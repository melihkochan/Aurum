import type { MarketPricesMap, MarketQuote } from './types';
import { MockMarketProvider } from './mockProvider';

const APINOKTAM_BASE_URL = 'https://api.apinoktam.erenozdemir.com.tr/v1';
const DEFAULT_API_KEY = 'ak_live_6a419bd256565bae1e945e341a0abaafb4f59b38bf619ee9';
const CACHE_STORAGE_KEY = 'aurum_live_market_cache_v3';
// Cache TTL: 1 hour (3600000ms) to conserve API credits (1000 credits plan)
const CACHE_TTL_MS = 60 * 60 * 1000;

interface CachedMarketPayload {
  timestamp: number;
  prices: MarketPricesMap;
}

export class LiveMarketProvider {
  private apiKey: string;
  private fallbackMock: MockMarketProvider;
  private inFlightPromise: Promise<{ prices: MarketPricesMap; isLive: boolean; error?: string }> | null = null;

  constructor() {
    // Allows overriding via .env when configured, defaults to the active user key
    this.apiKey = import.meta.env.VITE_MARKET_API_KEY || DEFAULT_API_KEY;
    this.fallbackMock = new MockMarketProvider();
  }

  /**
   * Fetches market prices only when explicitly requested (e.g. app entry).
   * Strictly avoids duplicate parallel requests and uses localStorage cache
   * so no credits are consumed unnecessarily.
   */
  public async fetchPrices(forceRefresh = false): Promise<{ prices: MarketPricesMap; isLive: boolean; error?: string }> {
    // 1. If another fetch is already running in parallel, reuse the same promise (deduplication)
    if (this.inFlightPromise) {
      return this.inFlightPromise;
    }

    // 2. Check local cache first unless forced
    const cached = this.getValidCache();
    if (!forceRefresh && cached) {
      return { prices: cached.prices, isLive: true };
    }

    // 3. Initiate single controlled fetch
    this.inFlightPromise = this.executeFetch(cached?.prices);
    try {
      const result = await this.inFlightPromise;
      return result;
    } finally {
      this.inFlightPromise = null;
    }
  }

  private async executeFetch(previousPrices?: MarketPricesMap): Promise<{ prices: MarketPricesMap; isLive: boolean; error?: string }> {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      // Concurrently fetch both gold and currency endpoints
      const [goldRes, dovizRes] = await Promise.all([
        fetch(`${APINOKTAM_BASE_URL}/altin`, { headers, signal: controller.signal }),
        fetch(`${APINOKTAM_BASE_URL}/doviz`, { headers, signal: controller.signal }),
      ]);

      clearTimeout(timeoutId);

      if (!goldRes.ok || !dovizRes.ok) {
        throw new Error(`API yanıt vermedi (Altın: ${goldRes.status}, Döviz: ${dovizRes.status})`);
      }

      const goldJson = await goldRes.json();
      const dovizJson = await dovizRes.json();

      if (!goldJson.success || !dovizJson.success) {
        throw new Error('API verisi doğrulanamadı');
      }

      // Parse and construct MarketPricesMap
      const prices = this.parseApiResponse(goldJson.data, dovizJson.data, previousPrices);

      // Save to localStorage with current timestamp
      this.saveCache(prices);

      return { prices, isLive: true };
    } catch (err: any) {
      console.warn('Canlı piyasa API bağlantısı veya önbellek yenileme başarısız:', err?.message || err);

      // If we have any cached data (even if expired), use it as fallback before mock
      const existingCache = this.getRawCache();
      if (existingCache?.prices) {
        return {
          prices: existingCache.prices,
          isLive: false,
          error: 'Piyasa verileri güncellenemedi. Son kaydedilen canlı kurlar kullanılıyor.',
        };
      }

      const fallbackPrices = await this.fallbackMock.getPrices();
      return {
        prices: fallbackPrices,
        isLive: false,
        error: 'Piyasa verileri geçici olarak alınamadı. Standart referans değerler gösteriliyor.',
      };
    }
  }

  private parseApiResponse(goldData: any, dovizData: any, previousPrices?: MarketPricesMap): MarketPricesMap {
    const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const kalemler: any[] = goldData?.kalemler || [];
    const kurlar: any[] = dovizData?.kurlar || [];

    const findGold = (sembol: string, tur: string) =>
      kalemler.find((item) => item.sembol?.toUpperCase() === sembol.toUpperCase() || item.tur === tur);

    const findCurrency = (kod: string) =>
      kurlar.find((item) => item.kod?.toUpperCase() === kod.toUpperCase());

    const graItem = findGold('GRA', 'gram');
    const ceyrekItem = findGold('CEYREKALTIN', 'ceyrek');
    const yarimItem = findGold('YARIMALTIN', 'yarim');
    const tamItem = findGold('TAMALTIN', 'tam');

    const usdItem = findCurrency('USD');
    const eurItem = findCurrency('EUR');

    const createQuote = (
      price: number,
      percentChange: number,
      fallbackPrice: number
    ): MarketQuote => {
      const finalPrice = price > 0 ? price : fallbackPrice;
      const changeAmount = finalPrice * (percentChange / 100);
      return {
        price: finalPrice,
        change24hPercent: Number(percentChange.toFixed(2)),
        change24hAmount: Number(changeAmount.toFixed(2)),
        high24h: Number((finalPrice * 1.01).toFixed(2)),
        low24h: Number((finalPrice * 0.99).toFixed(2)),
        lastUpdated: timeStr,
      };
    };

    // Calculate currency change vs previous cached price or default to reasonable spread
    const calcCurrencyChange = (newPrice: number, key: 'usd' | 'eur'): number => {
      if (previousPrices && previousPrices[key] && previousPrices[key].price > 0) {
        const prev = previousPrices[key].price;
        return ((newPrice - prev) / prev) * 100;
      }
      return key === 'usd' ? 0.22 : 0.35;
    };

    const usdPrice = usdItem?.satis || usdItem?.alis || 48.69;
    const eurPrice = eurItem?.satis || eurItem?.alis || 55.89;

    return {
      gramGold: createQuote(graItem?.satis || graItem?.alis || 6834.0, graItem?.degisim ?? 0.45, 6834.0),
      quarterGold: createQuote(ceyrekItem?.satis || ceyrekItem?.alis || 11116.0, ceyrekItem?.degisim ?? -0.3, 11116.0),
      halfGold: createQuote(yarimItem?.satis || yarimItem?.alis || 22232.0, yarimItem?.degisim ?? -0.3, 22232.0),
      fullGold: createQuote(tamItem?.satis || tamItem?.alis || 44328.0, tamItem?.degisim ?? -0.3, 44328.0),
      usd: createQuote(usdPrice, calcCurrencyChange(usdPrice, 'usd'), 48.69),
      eur: createQuote(eurPrice, calcCurrencyChange(eurPrice, 'eur'), 55.89),
      try: {
        price: 1.0,
        change24hPercent: 0.0,
        change24hAmount: 0.0,
        high24h: 1.0,
        low24h: 1.0,
        lastUpdated: timeStr,
      },
    };
  }

  private getValidCache(): CachedMarketPayload | null {
    const raw = this.getRawCache();
    if (!raw) return null;
    const age = Date.now() - raw.timestamp;
    if (age < CACHE_TTL_MS && raw.prices && raw.prices.gramGold) {
      return raw;
    }
    return null;
  }

  private getRawCache(): CachedMarketPayload | null {
    try {
      const data = localStorage.getItem(CACHE_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data) as CachedMarketPayload;
    } catch {
      return null;
    }
  }

  private saveCache(prices: MarketPricesMap) {
    try {
      const payload: CachedMarketPayload = {
        timestamp: Date.now(),
        prices,
      };
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Önbellek yerel depolamaya yazılamadı:', e);
    }
  }
}
