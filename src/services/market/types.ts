export type AssetKey = 
  | 'gramGold' 
  | 'quarterGold' 
  | 'halfGold' 
  | 'fullGold' 
  | 'usd' 
  | 'eur'
  | 'try';

export type AssetCategory = 'gold' | 'currency' | 'cash';

export interface AssetMeta {
  key: AssetKey;
  nameTr: string;
  shortName: string;
  category: AssetCategory;
  symbol: string;
  unitNameTr: string;
  descriptionTr: string;
  weightGrams?: number;
  karat?: number;
}

export interface MarketQuote {
  price: number;
  change24hPercent: number;
  change24hAmount: number;
  high24h: number;
  low24h: number;
  lastUpdated: string;
}

export type MarketPricesMap = Record<AssetKey, MarketQuote>;

export type ChartTimeframe = '1G' | '1H' | '1A' | '3A' | '1Y';

export interface HistoricalDataPoint {
  timestamp: number;
  dateStr: string;
  value: number;
  changePercent?: number;
}

export const ASSET_DEFINITIONS: Record<AssetKey, AssetMeta> = {
  gramGold: {
    key: 'gramGold',
    nameTr: 'Gram Altın',
    shortName: 'Gram',
    category: 'gold',
    symbol: 'GA',
    unitNameTr: 'Adet',
    descriptionTr: '24 Ayar 0.995 Saf Altın',
    weightGrams: 1.0,
    karat: 24,
  },
  quarterGold: {
    key: 'quarterGold',
    nameTr: 'Çeyrek Altın',
    shortName: 'Çeyrek',
    category: 'gold',
    symbol: 'ÇA',
    unitNameTr: 'Adet',
    descriptionTr: '22 Ayar Darphane Basımı (1.75g)',
    weightGrams: 1.75,
    karat: 22,
  },
  halfGold: {
    key: 'halfGold',
    nameTr: 'Yarım Altın',
    shortName: 'Yarım',
    category: 'gold',
    symbol: 'YA',
    unitNameTr: 'Adet',
    descriptionTr: '22 Ayar Darphane Basımı (3.50g)',
    weightGrams: 3.50,
    karat: 22,
  },
  fullGold: {
    key: 'fullGold',
    nameTr: 'Tam Altın',
    shortName: 'Tam',
    category: 'gold',
    symbol: 'TA',
    unitNameTr: 'Adet',
    descriptionTr: '22 Ayar Darphane Ziynet (7.00g)',
    weightGrams: 7.00,
    karat: 22,
  },
  usd: {
    key: 'usd',
    nameTr: 'Amerikan Doları',
    shortName: 'USD',
    category: 'currency',
    symbol: '$',
    unitNameTr: 'Dolar',
    descriptionTr: 'TCMB Serbest Piyasa USD/TRY',
  },
  eur: {
    key: 'eur',
    nameTr: 'Euro',
    shortName: 'EUR',
    category: 'currency',
    symbol: '€',
    unitNameTr: 'Euro',
    descriptionTr: 'TCMB Serbest Piyasa EUR/TRY',
  },
  try: {
    key: 'try',
    nameTr: 'Türk Lirası',
    shortName: 'Nakit TL',
    category: 'cash',
    symbol: '₺',
    unitNameTr: 'TL',
    descriptionTr: 'Nakit Türk Lirası Rezervi',
  },
};
