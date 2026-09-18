import type { AssetKey, MarketPricesMap, ChartTimeframe, HistoricalDataPoint } from './types';

// Realistic baseline Turkish market prices (TRY)
const BASE_PRICES: MarketPricesMap = {
  gramGold: {
    price: 5120.0,
    change24hPercent: 1.42,
    change24hAmount: 71.7,
    high24h: 5145.0,
    low24h: 5048.3,
    lastUpdated: '16:48',
  },
  quarterGold: {
    price: 8420.0,
    change24hPercent: 1.18,
    change24hAmount: 98.2,
    high24h: 8460.0,
    low24h: 8320.0,
    lastUpdated: '16:48',
  },
  halfGold: {
    price: 16840.0,
    change24hPercent: 1.18,
    change24hAmount: 196.4,
    high24h: 16920.0,
    low24h: 16640.0,
    lastUpdated: '16:48',
  },
  fullGold: {
    price: 33680.0,
    change24hPercent: 1.20,
    change24hAmount: 399.2,
    high24h: 33840.0,
    low24h: 33280.0,
    lastUpdated: '16:48',
  },
  usd: {
    price: 41.20,
    change24hPercent: -0.15,
    change24hAmount: -0.06,
    high24h: 41.38,
    low24h: 41.12,
    lastUpdated: '16:48',
  },
  eur: {
    price: 48.50,
    change24hPercent: 0.32,
    change24hAmount: 0.15,
    high24h: 48.72,
    low24h: 48.31,
    lastUpdated: '16:48',
  },
  try: {
    price: 1.0,
    change24hPercent: 0.0,
    change24hAmount: 0.0,
    high24h: 1.0,
    low24h: 1.0,
    lastUpdated: '16:48',
  },
};

export class MockMarketProvider {
  private currentPrices: MarketPricesMap = JSON.parse(JSON.stringify(BASE_PRICES));

  public async getPrices(): Promise<MarketPricesMap> {
    // Return with subtle micro-fluctuation to reflect active live market
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Tiny realistic jitter
    const jitter = (base: number) => {
      const deltaPercent = (Math.random() * 0.1 - 0.05) / 100;
      return Number((base * (1 + deltaPercent)).toFixed(2));
    };

    const updated = { ...this.currentPrices };
    (Object.keys(updated) as AssetKey[]).forEach((key) => {
      if (key === 'try') {
        updated[key] = {
          ...updated[key],
          price: 1.0,
          change24hPercent: 0.0,
          change24hAmount: 0.0,
          lastUpdated: timeStr,
        };
        return;
      }
      const p = jitter(updated[key].price);
      updated[key] = {
        ...updated[key],
        price: p,
        lastUpdated: timeStr,
      };
    });

    this.currentPrices = updated;
    return this.currentPrices;
  }

  public generatePortfolioHistory(
    currentPortfolioValue: number,
    timeframe: ChartTimeframe
  ): HistoricalDataPoint[] {
    const points: HistoricalDataPoint[] = [];
    const now = Date.now();
    const isZero = currentPortfolioValue <= 0;

    let count = 24;
    let stepMs = 3600 * 1000; // 1 hour for 1G
    let overallGainFactor = 0.0524; // 5.24% growth

    switch (timeframe) {
      case '1G': // 1 Day (24 hours)
        count = 12;
        stepMs = 2 * 3600 * 1000;
        overallGainFactor = 0.015;
        break;
      case '1H': // 1 Week (7 days)
        count = 7;
        stepMs = 24 * 3600 * 1000;
        overallGainFactor = 0.028;
        break;
      case '1A': // 1 Month (30 days)
        count = 15;
        stepMs = 2 * 24 * 3600 * 1000;
        overallGainFactor = 0.052;
        break;
      case '3A': // 3 Months
        count = 18;
        stepMs = 5 * 24 * 3600 * 1000;
        overallGainFactor = 0.094;
        break;
      case '1Y': // 1 Year
        count = 12;
        stepMs = 30 * 24 * 3600 * 1000;
        overallGainFactor = 0.385; // Annual gold performance
        break;
    }

    if (isZero) {
      for (let i = 0; i < count; i++) {
        const time = now - (count - 1 - i) * stepMs;
        const d = new Date(time);
        points.push({
          timestamp: time,
          dateStr: timeframe === '1G' 
            ? `${String(d.getHours()).padStart(2, '0')}:00` 
            : `${d.getDate()} ${['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][d.getMonth()]}`,
          value: 0,
        });
      }
      return points;
    }

    const startValue = currentPortfolioValue / (1 + overallGainFactor);

    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1);
      const time = now - (count - 1 - i) * stepMs;
      const d = new Date(time);

      // Organic realistic curve with upward drift + slight volatility
      const noise = (Math.sin(i * 1.7) * 0.3 + Math.cos(i * 0.9) * 0.2) * (currentPortfolioValue * 0.012);
      const val = i === count - 1 
        ? currentPortfolioValue 
        : Math.round(startValue + (currentPortfolioValue - startValue) * Math.pow(progress, 0.85) + noise);

      const dateLabel = timeframe === '1G'
        ? `${String(d.getHours()).padStart(2, '0')}:00`
        : timeframe === '1Y'
        ? `${['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][d.getMonth()]} ${d.getFullYear().toString().slice(2)}`
        : `${d.getDate()} ${['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][d.getMonth()]}`;

      points.push({
        timestamp: time,
        dateStr: dateLabel,
        value: Math.max(0, val),
      });
    }

    return points;
  }
}
