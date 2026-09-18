import type { MarketPricesMap, ChartTimeframe, HistoricalDataPoint } from './types';
import { MockMarketProvider } from './mockProvider';
import { LiveMarketProvider } from './liveProvider';

type PriceSubscriber = (prices: MarketPricesMap, isLive: boolean, error?: string) => void;

class MarketService {
  private mockProvider: MockMarketProvider;
  private liveProvider: LiveMarketProvider;
  private subscribers: Set<PriceSubscriber> = new Set();
  private currentPrices: MarketPricesMap | null = null;
  private lastError?: string;
  private isLive = false;
  private initPromise: Promise<MarketPricesMap> | null = null;

  constructor() {
    this.mockProvider = new MockMarketProvider();
    this.liveProvider = new LiveMarketProvider();
  }

  /**
   * Initializes market prices on app entry.
   * Guaranteed to only execute once per session, with zero background timers.
   */
  public async init(): Promise<MarketPricesMap> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      const result = await this.liveProvider.fetchPrices(false);
      this.currentPrices = result.prices;
      this.isLive = result.isLive;
      this.lastError = result.error;
      this.notify();
      return this.currentPrices;
    })();

    return this.initPromise;
  }

  public subscribe(callback: PriceSubscriber): () => void {
    this.subscribers.add(callback);
    if (this.currentPrices) {
      callback(this.currentPrices, this.isLive, this.lastError);
    }
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Optional manual refresh only when triggered directly
   */
  public async refresh(force = false): Promise<MarketPricesMap> {
    const result = await this.liveProvider.fetchPrices(force);
    this.currentPrices = result.prices;
    this.isLive = result.isLive;
    this.lastError = result.error;
    this.notify();
    return this.currentPrices;
  }

  public getCachedPrices(): MarketPricesMap | null {
    return this.currentPrices;
  }

  public getPortfolioHistory(totalValue: number, timeframe: ChartTimeframe): HistoricalDataPoint[] {
    return this.mockProvider.generatePortfolioHistory(totalValue, timeframe);
  }

  private notify() {
    if (!this.currentPrices) return;
    this.subscribers.forEach((cb) => cb(this.currentPrices!, this.isLive, this.lastError));
  }
}

export const marketService = new MarketService();
