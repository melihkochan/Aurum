import type { 
  HoldingsMap, 
  Transaction, 
  UserPreferences, 
  Goal, 
  NoteItem, 
  CustomAssetMap,
  Account,
  Category,
  RecurringTransaction,
} from '../portfolio/types';

const STORAGE_KEYS = {
  HOLDINGS: 'aurum_holdings_v2',
  TRANSACTIONS: 'aurum_transactions_v2',
  GOALS: 'aurum_goals_v2',
  PREFERENCES: 'aurum_preferences_v2',
  NOTES: 'aurum_notes_v1',
  CUSTOM_ASSETS: 'aurum_custom_assets_v1',
  ACCOUNTS: 'aurum_accounts_v1',
  CATEGORIES: 'aurum_categories_v1',
  RECURRING_TRANSACTIONS: 'aurum_recurring_v1',
};

// Initial realistic baseline holdings (including Nakit TL)
export const DEFAULT_HOLDINGS: HoldingsMap = {
  gramGold: 10.0,
  quarterGold: 2.0,
  halfGold: 0,
  fullGold: 0,
  usd: 500.0,
  eur: 0,
  try: 15000.0,
};

// Default transactions (Asset Buys + Income + Expenses)
// With clear distinction between transactionDate/Time and createdAt/createdDateStr
export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1a',
    assetKey: 'quarterGold',
    quantity: 1,
    type: 'buy',
    unitPrice: 8420,
    totalValue: 8420,
    purchasePrice: 8420,
    date: '18 Eylül 2026',
    timestamp: Date.now() - 2 * 3600 * 1000,
    transactionDate: '18 Eylül 2026',
    transactionTime: '14:30',
    createdAt: Date.now() - 2 * 3600 * 1000,
    createdDateStr: '18 Eylül 2026 • 14:35',
    marketPriceAtTransaction: 8420,
    note: 'Kuyumcukent fiziki alım',
  },
  {
    id: 'tx-1b',
    assetKey: 'quarterGold',
    quantity: 1,
    type: 'buy',
    unitPrice: 8400,
    totalValue: 8400,
    purchasePrice: 8400,
    date: '14 Eylül 2026',
    timestamp: Date.now() - 4 * 24 * 3600 * 1000,
    transactionDate: '14 Eylül 2026',
    transactionTime: '11:15',
    createdAt: Date.now() - 4 * 24 * 3600 * 1000,
    createdDateStr: '14 Eylül 2026 • 11:20',
    marketPriceAtTransaction: 8400,
    note: 'Yatırımlık çeyrek',
  },
  {
    id: 'tx-2',
    type: 'income',
    totalValue: 35000,
    category: 'salary',
    categoryId: 'cat-salary',
    title: 'Eylül Maaş Ödemesi',
    accountId: 'acc-ziraat',
    status: 'completed',
    date: '15 Eylül 2026',
    timestamp: Date.now() - 3 * 24 * 3600 * 1000,
    transactionDate: '15 Eylül 2026',
    transactionTime: '09:15',
    createdAt: Date.now() - 3 * 24 * 3600 * 1000,
    createdDateStr: '15 Eylül 2026 • 09:15',
  },
  {
    id: 'tx-3',
    type: 'expense',
    totalValue: 11200,
    category: 'Kira',
    categoryId: 'cat-rent',
    title: 'Eylül Kira Ödemesi',
    accountId: 'acc-ziraat',
    status: 'completed',
    date: '15 Eylül 2026',
    timestamp: Date.now() - 3 * 24 * 3600 * 1000,
    transactionDate: '15 Eylül 2026',
    transactionTime: '11:00',
    createdAt: Date.now() - 3 * 24 * 3600 * 1000,
    createdDateStr: '15 Eylül 2026 • 11:05',
  },
  {
    id: 'tx-4a',
    assetKey: 'gramGold',
    quantity: 8,
    type: 'buy',
    unitPrice: 5118.55,
    totalValue: 40948.40,
    purchasePrice: 5118.55,
    status: 'completed',
    date: '18 Eylül 2026',
    timestamp: Date.now() - 1 * 3600 * 1000,
    transactionDate: '18 Eylül 2026',
    transactionTime: '10:00',
    createdAt: Date.now() - 1 * 3600 * 1000,
    createdDateStr: '18 Eylül 2026 • 10:00',
    marketPriceAtTransaction: 5118.55,
    note: 'Kapalıçarşı fiziki külçe alımı',
  },
  {
    id: 'tx-4b',
    assetKey: 'gramGold',
    quantity: 2,
    type: 'buy',
    unitPrice: 5120,
    totalValue: 10240,
    purchasePrice: 5120,
    status: 'completed',
    date: '12 Eylül 2026',
    timestamp: Date.now() - 6 * 24 * 3600 * 1000,
    transactionDate: '12 Eylül 2026',
    transactionTime: '15:20',
    createdAt: Date.now() - 2 * 24 * 3600 * 1000,
    createdDateStr: '16 Eylül 2026 • 19:04',
    marketPriceAtTransaction: 5120,
    note: 'Kapalıçarşı 24K külçe',
  },
  {
    id: 'tx-5',
    type: 'expense',
    totalValue: 1250,
    category: 'Market',
    categoryId: 'cat-grocery',
    title: 'Haftalık Market Alışverişi',
    accountId: 'acc-ziraat',
    status: 'completed',
    date: '12 Eylül 2026',
    timestamp: Date.now() - 6 * 24 * 3600 * 1000,
    transactionDate: '12 Eylül 2026',
    transactionTime: '18:45',
    createdAt: Date.now() - 6 * 24 * 3600 * 1000,
    createdDateStr: '12 Eylül 2026 • 18:50',
  },
  {
    id: 'tx-5b',
    type: 'expense',
    totalValue: 7550,
    category: 'Diğer',
    categoryId: 'cat-exp-other',
    title: 'Kredi Kartı Ekstre Ödemesi',
    accountId: 'acc-garanti',
    status: 'completed',
    date: '11 Eylül 2026',
    timestamp: Date.now() - 7 * 24 * 3600 * 1000,
    transactionDate: '11 Eylül 2026',
    transactionTime: '14:20',
    createdAt: Date.now() - 7 * 24 * 3600 * 1000,
    createdDateStr: '11 Eylül 2026 • 14:20',
  },
  {
    id: 'tx-6',
    assetKey: 'usd',
    quantity: 500,
    type: 'buy',
    unitPrice: 41.0,
    totalValue: 20500,
    purchasePrice: 41.0,
    date: '10 Eylül 2026',
    timestamp: Date.now() - 8 * 24 * 3600 * 1000,
    transactionDate: '10 Eylül 2026',
    transactionTime: '13:10',
    createdAt: Date.now() - 5 * 24 * 3600 * 1000,
    createdDateStr: '13 Eylül 2026 • 20:15',
    marketPriceAtTransaction: 41.0,
    note: 'Döviz bürosu nakit alım',
  },
];

// Initial realistic baseline accounts (Banka ve Nakit hesapları)
export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc-ziraat',
    name: 'Ziraat Bankası',
    type: 'bank',
    bankName: 'Ziraat Bankası',
    initialBalance: 50000,
    balance: 50000,
    currency: 'TRY',
    icon: 'Building2',
    color: '#E11D48',
    createdAt: Date.now() - 30 * 24 * 3600 * 1000,
  },
  {
    id: 'acc-garanti',
    name: 'Garanti BBVA',
    type: 'bank',
    bankName: 'Garanti BBVA',
    initialBalance: 25000,
    balance: 25000,
    currency: 'TRY',
    icon: 'Building2',
    color: '#059669',
    createdAt: Date.now() - 30 * 24 * 3600 * 1000,
  },
  {
    id: 'acc-cash',
    name: 'Nakit Cüzdan',
    type: 'cash',
    initialBalance: 10000,
    balance: 10000,
    currency: 'TRY',
    icon: 'Banknote',
    color: '#10B981',
    createdAt: Date.now() - 30 * 24 * 3600 * 1000,
  },
];

// Initial expense & income categories
export const DEFAULT_CATEGORIES: Category[] = [
  // Gider Kategorileri
  { id: 'cat-rent', name: 'Kira', type: 'expense', icon: 'Home', color: '#EF4444', active: true, createdAt: Date.now() },
  { id: 'cat-grocery', name: 'Market', type: 'expense', icon: 'ShoppingCart', color: '#F97316', active: true, createdAt: Date.now() },
  { id: 'cat-bills', name: 'Faturalar', type: 'expense', icon: 'Receipt', color: '#F59E0B', active: true, createdAt: Date.now() },
  { id: 'cat-phone', name: 'Telefon', type: 'expense', icon: 'Smartphone', color: '#3B82F6', active: true, createdAt: Date.now() },
  { id: 'cat-internet', name: 'İnternet', type: 'expense', icon: 'Wifi', color: '#06B6D4', active: true, createdAt: Date.now() },
  { id: 'cat-transport', name: 'Ulaşım', type: 'expense', icon: 'Bus', color: '#8B5CF6', active: true, createdAt: Date.now() },
  { id: 'cat-fuel', name: 'Yakıt', type: 'expense', icon: 'Fuel', color: '#EC4899', active: true, createdAt: Date.now() },
  { id: 'cat-health', name: 'Sağlık', type: 'expense', icon: 'HeartPulse', color: '#10B981', active: true, createdAt: Date.now() },
  { id: 'cat-entertainment', name: 'Eğlence', type: 'expense', icon: 'Film', color: '#A855F7', active: true, createdAt: Date.now() },
  { id: 'cat-shopping', name: 'Alışveriş', type: 'expense', icon: 'ShoppingBag', color: '#F43F5E', active: true, createdAt: Date.now() },
  { id: 'cat-subscription', name: 'Abonelik', type: 'expense', icon: 'CreditCard', color: '#6366F1', active: true, createdAt: Date.now() },
  { id: 'cat-installment', name: 'Taksit', type: 'expense', icon: 'Layers', color: '#D97706', active: true, createdAt: Date.now() },
  { id: 'cat-education', name: 'Eğitim', type: 'expense', icon: 'GraduationCap', color: '#14B8A6', active: true, createdAt: Date.now() },
  { id: 'cat-exp-other', name: 'Diğer Gider', type: 'expense', icon: 'MoreHorizontal', color: '#64748B', active: true, createdAt: Date.now() },

  // Gelir Kategorileri
  { id: 'cat-salary', name: 'Maaş', type: 'income', icon: 'Briefcase', color: '#10B981', active: true, createdAt: Date.now() },
  { id: 'cat-freelance', name: 'Freelance', type: 'income', icon: 'Laptop', color: '#34D399', active: true, createdAt: Date.now() },
  { id: 'cat-bonus', name: 'Prim', type: 'income', icon: 'Award', color: '#F59E0B', active: true, createdAt: Date.now() },
  { id: 'cat-side-income', name: 'Ek Gelir', type: 'income', icon: 'Coins', color: '#38BDF8', active: true, createdAt: Date.now() },
  { id: 'cat-investment-return', name: 'Yatırım Geliri', type: 'income', icon: 'TrendingUp', color: '#F3C969', active: true, createdAt: Date.now() },
  { id: 'cat-refund', name: 'İade', type: 'income', icon: 'RotateCcw', color: '#A78BFA', active: true, createdAt: Date.now() },
  { id: 'cat-inc-other', name: 'Diğer Gelir', type: 'income', icon: 'PlusCircle', color: '#94A3B8', active: true, createdAt: Date.now() },
];

// Initial recurring transactions (Sabit Gelir ve Giderler)
export const DEFAULT_RECURRING: RecurringTransaction[] = [
  {
    id: 'rec-salary',
    type: 'income',
    name: 'Maaş',
    categoryId: 'cat-salary',
    amount: 57700,
    frequency: 'monthly',
    dayOfMonth: 1,
    accountId: 'acc-garanti',
    startDate: '2026-09-01',
    nextOccurrence: '2026-10-01',
    active: true,
    createdAt: Date.now() - 30 * 24 * 3600 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'rec-freelance',
    type: 'income',
    name: 'Freelance Proje',
    categoryId: 'cat-freelance',
    amount: 10000,
    frequency: 'monthly',
    dayOfMonth: 15,
    accountId: 'acc-ziraat',
    startDate: '2026-09-01',
    nextOccurrence: '2026-10-15',
    active: true,
    createdAt: Date.now() - 15 * 24 * 3600 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'rec-phone',
    type: 'expense',
    name: 'Telefon Faturası',
    categoryId: 'cat-phone',
    amount: 750,
    frequency: 'monthly',
    dayOfMonth: 15,
    accountId: 'acc-ziraat',
    startDate: '2026-09-01',
    nextOccurrence: '2026-10-15',
    active: true,
    createdAt: Date.now() - 30 * 24 * 3600 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'rec-installment',
    type: 'expense',
    name: 'Laptop Taksiti',
    categoryId: 'cat-installment',
    amount: 4500,
    frequency: 'monthly',
    dayOfMonth: 5,
    accountId: 'acc-garanti',
    startDate: '2026-06-01',
    nextOccurrence: '2026-10-05',
    installmentCurrent: 5,
    installmentTotal: 8,
    installmentRemaining: 3,
    active: true,
    createdAt: Date.now() - 90 * 24 * 3600 * 1000,
    updatedAt: Date.now(),
  },
];

// Realistic baseline financial goals
export const DEFAULT_GOALS: Goal[] = [
  {
    id: 'goal-1',
    title: 'Yeni Araba',
    targetAmount: 750000,
    currentAmount: 616057,
    targetDate: '18 Eylül 2027',
    icon: '🚗',
    category: 'car',
    createdAt: Date.now() - 30 * 24 * 3600 * 1000,
    note: 'Sıfır km SUV model araç peşinatı',
  },
  {
    id: 'goal-2',
    title: 'Ev Peşinatı',
    targetAmount: 2000000,
    currentAmount: 150000,
    targetDate: '15 Haziran 2028',
    icon: '🏠',
    category: 'house',
    createdAt: Date.now() - 60 * 24 * 3600 * 1000,
    note: 'Konut kredisi ön peşinat birikimi',
  },
];

// Default sample notes & tasks
export const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Altın Portföy Stratejisi',
    content: 'Altın fiyatlarını düzenli takip et. Gram altın 7.000 TL üzerine çıkarsa portföy dağılımını tekrar değerlendir ve bir kısmını nakit dövize kaydır.',
    type: 'note',
    tags: ['#portföy', '#altın', '#strateji'],
    completed: false,
    createdAt: Date.now() - 2 * 24 * 3600 * 1000,
    updatedAt: Date.now() - 2 * 24 * 3600 * 1000,
  },
  {
    id: 'note-2',
    title: 'Döviz Alım Hedefi',
    content: 'Dolar kuru 48 TL altına sarkarsa 500 USD ek alım gerçekleştirilecek.',
    type: 'note',
    tags: ['#döviz', '#usd', '#hedef'],
    completed: false,
    createdAt: Date.now() - 5 * 24 * 3600 * 1000,
    updatedAt: Date.now() - 5 * 24 * 3600 * 1000,
  },
  {
    id: 'todo-1',
    title: 'Sigorta yenilemesini kontrol et',
    content: 'Kasko ve trafik sigortası tekliflerini karşılaştır.',
    type: 'todo',
    tags: ['#sigorta', '#araç'],
    completed: false,
    priority: 'today',
    createdAt: Date.now() - 1 * 24 * 3600 * 1000,
    updatedAt: Date.now() - 1 * 24 * 3600 * 1000,
  },
  {
    id: 'todo-2',
    title: 'Araba hedefini güncelle',
    content: 'Biriken nakit tutarın hedefe aktarımını doğrula.',
    type: 'todo',
    tags: ['#araba', '#hedef'],
    completed: false,
    priority: 'today',
    createdAt: Date.now() - 1 * 24 * 3600 * 1000,
    updatedAt: Date.now() - 1 * 24 * 3600 * 1000,
  },
  {
    id: 'todo-3',
    title: 'USD birikimini kontrol et',
    content: 'Fiziki döviz rezervi ile uygulamadaki kaydı eşle.',
    type: 'todo',
    tags: ['#usd', '#kasa'],
    completed: false,
    priority: 'week',
    createdAt: Date.now() - 3 * 24 * 3600 * 1000,
    updatedAt: Date.now() - 3 * 24 * 3600 * 1000,
  },
  {
    id: 'todo-4',
    title: 'Eylül ayı BES katkısını kontrol et',
    content: 'Devlet katkısı ve fon dağılım oranlarını incele.',
    type: 'todo',
    tags: ['#bes', '#emeklilik'],
    completed: true,
    priority: 'week',
    createdAt: Date.now() - 7 * 24 * 3600 * 1000,
    updatedAt: Date.now() - 1 * 24 * 3600 * 1000,
  },
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  name: 'Melih',
  currency: 'TRY',
  isBalanceHidden: false,
  autoRefreshEnabled: true,
  refreshIntervalSeconds: 45,
  performancePeriod: 'daily',
};

export const CATEGORY_NAME_TR_MAP: Record<string, string> = {
  rent: 'Kira',
  grocery: 'Market',
  bills: 'Faturalar',
  phone: 'Telefon',
  internet: 'İnternet',
  transport: 'Ulaşım',
  fuel: 'Yakıt',
  health: 'Sağlık',
  entertainment: 'Eğlence',
  shopping: 'Alışveriş',
  subscription: 'Abonelik',
  installment: 'Taksit',
  education: 'Eğitim',
  other: 'Diğer',
  salary: 'Maaş',
  freelance: 'Freelance',
  bonus: 'Prim',
  'side-income': 'Ek Gelir',
  'investment-return': 'Yatırım Geliri',
  refund: 'İade',
};

export class StorageService {
  public static getHoldings(): HoldingsMap {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HOLDINGS);
      return data ? JSON.parse(data) : DEFAULT_HOLDINGS;
    } catch {
      return DEFAULT_HOLDINGS;
    }
  }

  public static saveHoldings(holdings: HoldingsMap): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HOLDINGS, JSON.stringify(holdings));
    } catch (e) {
      console.error('Holdings kaydedilemedi:', e);
    }
  }

  public static getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const rawList: Transaction[] = data ? JSON.parse(data) : DEFAULT_TRANSACTIONS;
      return rawList.map((tx) => {
        const catLower = (tx.category || '').toLowerCase().trim();
        const trCategory = CATEGORY_NAME_TR_MAP[catLower] || tx.category;
        return {
          ...tx,
          category: trCategory,
        };
      });
    } catch {
      return DEFAULT_TRANSACTIONS;
    }
  }

  public static saveTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Transactions kaydedilemedi:', e);
    }
  }

  public static getGoals(): Goal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (!data) return DEFAULT_GOALS;
      const parsed: Goal[] = JSON.parse(data);
      // Migrate legacy text icons
      return parsed.map((g) => ({
        ...g,
        icon: g.icon === 'Car' ? '🚗' : g.icon === 'Home' ? '🏠' : (g.icon || '🎯'),
      }));
    } catch {
      return DEFAULT_GOALS;
    }
  }

  public static saveGoals(goals: Goal[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Goals kaydedilemedi:', e);
    }
  }

  public static getNotes(): NoteItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      return data ? JSON.parse(data) : DEFAULT_NOTES;
    } catch {
      return DEFAULT_NOTES;
    }
  }

  public static saveNotes(notes: NoteItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (e) {
      console.error('Notes kaydedilemedi:', e);
    }
  }

  public static getCustomAssets(): CustomAssetMap {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_ASSETS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  public static saveCustomAssets(customAssets: CustomAssetMap): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_ASSETS, JSON.stringify(customAssets));
    } catch (e) {
      console.error('Custom assets kaydedilemedi:', e);
    }
  }

  public static getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return data ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  public static savePreferences(prefs: UserPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch (e) {
      console.error('Preferences kaydedilemedi:', e);
    }
  }

  public static getAccounts(): Account[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      return data ? JSON.parse(data) : DEFAULT_ACCOUNTS;
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  }

  public static saveAccounts(accounts: Account[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    } catch (e) {
      console.error('Accounts kaydedilemedi:', e);
    }
  }

  public static getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }

  public static saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Categories kaydedilemedi:', e);
    }
  }

  public static getRecurring(): RecurringTransaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECURRING_TRANSACTIONS);
      return data ? JSON.parse(data) : DEFAULT_RECURRING;
    } catch {
      return DEFAULT_RECURRING;
    }
  }

  public static saveRecurring(recurring: RecurringTransaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RECURRING_TRANSACTIONS, JSON.stringify(recurring));
    } catch (e) {
      console.error('Recurring transactions kaydedilemedi:', e);
    }
  }

  public static resetToDemo(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.HOLDINGS);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.GOALS);
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
      localStorage.removeItem(STORAGE_KEYS.NOTES);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_ASSETS);
      localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
      localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      localStorage.removeItem(STORAGE_KEYS.RECURRING_TRANSACTIONS);
    } catch (e) {
      console.error('Sıfırlama hatası:', e);
    }
  }

  public static clearAllData(): void {
    const emptyHoldings: HoldingsMap = {
      gramGold: 0,
      quarterGold: 0,
      halfGold: 0,
      fullGold: 0,
      usd: 0,
      eur: 0,
      try: 0,
    };
    StorageService.saveHoldings(emptyHoldings);
    StorageService.saveTransactions([]);
    StorageService.saveGoals([]);
    StorageService.saveNotes([]);
    StorageService.saveAccounts([]);
    StorageService.saveRecurring([]);
  }
}
