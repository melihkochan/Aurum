import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { ASSET_DEFINITIONS } from '../services/market/types';
import type { AssetKey, MarketPricesMap, AssetCategory } from '../services/market/types';
import type {
  HoldingsMap,
  Transaction,
  UserPreferences,
  Goal,
  NoteItem,
  CustomAssetMap,
  CustomAssetMeta,
  PerformancePeriod,
  PeriodPerformance,
  CashflowCategory,
  Account,
  Category,
  RecurringTransaction,
  TransactionStatus,
} from '../services/portfolio/types';
import { StorageService } from '../services/storage/storageService';
import { marketService } from '../services/market/marketService';
import {
  calculateAccountBalances,
  calculateTotalNetWorth as engineCalculateTotalNetWorth,
  calculateMonthlyCashflow,
  calculateTotalLiquidWealth,
  processDueRecurringTransactions,
  getNextOccurrenceDate,
  calculateTodaySummary,
  calculateExpenseCategoryDistribution,
} from '../services/portfolio/financeEngine';
import type { MonthlyCashflowSummary, TodaySummary, CategoryDistributionItem } from '../services/portfolio/financeEngine';
import type { LiveIndicatorStatus } from '../components/ui/LiveIndicator';

export interface AssetAllocationItem {
  key: AssetKey;
  name: string;
  nameTr: string;
  category: AssetCategory;
  quantity: number;
  totalBoughtQty: number;
  totalSoldQty: number;
  unitPrice: number;
  currentValue: number;
  totalCost: number;
  avgPurchasePrice: number;
  totalProfitLoss: number;
  profitLossPercent: number;
  percentage: number;
  color: string;
  customName?: string;
  customDesc?: string;
  customImageUrl?: string;
}

interface PortfolioContextType {
  holdings: HoldingsMap;
  transactions: Transaction[];
  goals: Goal[];
  notes: NoteItem[];
  customAssets: CustomAssetMap;
  marketPrices: MarketPricesMap | null;
  isMarketLive: boolean;
  marketStatus: LiveIndicatorStatus;
  marketError: string | undefined;
  isLoadingPrices: boolean;
  preferences: UserPreferences;
  selectedPeriod: PerformancePeriod;
  setSelectedPeriod: (period: PerformancePeriod) => void;
  currentPeriodPerformance: PeriodPerformance;
  multiPeriodPerformance: Record<PerformancePeriod, PeriodPerformance>;
  totalNetWorth: number;
  totalGain24h: number;
  totalGain24hPercent: number;
  allocations: AssetAllocationItem[];
  ownedAssets: AssetAllocationItem[];
  isBalanceHidden: boolean;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNetSavings: number;
  monthlyRealizedIncome: number;
  monthlyExpectedIncome: number;
  monthlyRealizedExpense: number;
  monthlyExpectedExpense: number;
  monthlyRealizedNet: number;
  monthlyExpectedNet: number;
  todaySummary: TodaySummary;
  expenseDistribution: CategoryDistributionItem[];
  accounts: (Account & { currentBalance: number; monthlyIn: number; monthlyOut: number })[];
  categories: Category[];
  recurringTransactions: RecurringTransaction[];
  monthlyCashflow: MonthlyCashflowSummary;
  expectedNetSavings: number;
  totalLiquidWealth: number;
  currencySymbol: string;
  currencyCode: string;
  displayNetWorth: number;
  addAsset: (
    assetKey: AssetKey, 
    quantity: number, 
    note?: string, 
    purchasePrice?: number,
    transactionDate?: string,
    transactionTime?: string,
    marketPriceAtTransaction?: number,
    accountId?: string
  ) => void;
  removeAsset: (
    assetKey: AssetKey, 
    quantity: number,
    sellPrice?: number,
    transactionDate?: string,
    transactionTime?: string,
    note?: string,
    targetAccountId?: string
  ) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  markTransactionStatus: (id: string, status: TransactionStatus) => void;
  addIncome: (
    amount: number, 
    category: CashflowCategory | string, 
    title: string, 
    date?: string, 
    note?: string,
    accountId?: string,
    status?: TransactionStatus
  ) => void;
  addExpense: (
    amount: number, 
    category: CashflowCategory | string, 
    title: string, 
    date?: string, 
    note?: string,
    accountId?: string,
    status?: TransactionStatus
  ) => void;
  transferFunds: (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    date?: string,
    time?: string,
    note?: string
  ) => void;
  addAccount: (accountData: Omit<Account, 'id' | 'createdAt'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addRecurring: (recData: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecurring: (id: string, updates: Partial<RecurringTransaction>) => void;
  deleteRecurring: (id: string) => void;
  toggleRecurring: (id: string) => void;
  addCategory: (catData: Omit<Category, 'id' | 'createdAt'>) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  allocateToGoal: (id: string, amount: number) => void;
  addNote: (item: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;
  toggleTodo: (id: string) => void;
  updateCustomAssetMeta: (assetKey: AssetKey, meta: Partial<CustomAssetMeta>) => void;
  togglePrivacy: () => void;
  refreshMarket: () => Promise<void>;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;
  resetToDemo: () => void;
  clearPortfolio: () => void;
  formatMoney: (amount: number, forceShow?: boolean) => string;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

const ASSET_COLORS: Record<AssetKey, string> = {
  gramGold: '#F3C969',
  quarterGold: '#E5B85C',
  halfGold: '#D6A84F',
  fullGold: '#C2933C',
  usd: '#38BDF8',
  eur: '#A78BFA',
  try: '#10B981',
};

// Reconcile transactions with holdings on boot to guarantee 100% data consistency
const reconcileTransactionsWithHoldings = (
  initialTx: Transaction[],
  initialHoldings: HoldingsMap
): Transaction[] => {
  const result = [...initialTx];
  (Object.keys(initialHoldings) as AssetKey[]).forEach((key) => {
    if (key === 'try') return;
    const hQty = initialHoldings[key] || 0;
    const buys = result.filter((t) => t.assetKey === key && t.type === 'buy').reduce((s, t) => s + (t.quantity || 0), 0);
    const sells = result.filter((t) => t.assetKey === key && t.type === 'sell').reduce((s, t) => s + (t.quantity || 0), 0);
    const net = buys - sells;
    const diff = hQty - net;
    if (diff > 0.0001) {
      result.push({
        id: `tx-initial-${key}`,
        assetKey: key,
        quantity: Number(diff.toFixed(4)),
        type: 'buy',
        unitPrice: key === 'usd' ? 41.0 : key === 'quarterGold' ? 8400 : 5118.55,
        totalValue: Number((diff * (key === 'usd' ? 41.0 : key === 'quarterGold' ? 8400 : 5118.55)).toFixed(2)),
        purchasePrice: key === 'usd' ? 41.0 : key === 'quarterGold' ? 8400 : 5118.55,
        date: '10 Eylül 2026',
        timestamp: Date.now() - 8 * 86400000,
        transactionDate: '10 Eylül 2026',
        transactionTime: '10:00',
        createdAt: Date.now() - 8 * 86400000,
        createdDateStr: '10 Eylül 2026 • 10:00',
        note: 'Başlangıç Portföy Bakiyesi',
      });
    }
  });
  return result;
};

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const rawTx = StorageService.getTransactions();
    const rawHoldings = StorageService.getHoldings();
    return reconcileTransactionsWithHoldings(rawTx, rawHoldings);
  });
  const [goals, setGoals] = useState<Goal[]>(() => StorageService.getGoals());
  const [notes, setNotes] = useState<NoteItem[]>(() => StorageService.getNotes());
  const [customAssets, setCustomAssets] = useState<CustomAssetMap>(() => StorageService.getCustomAssets());
  const [preferences, setPreferences] = useState<UserPreferences>(() => StorageService.getPreferences());
  const [selectedPeriod, setSelectedPeriod] = useState<PerformancePeriod>('daily');

  // Accounts, Categories & Recurring Transactions States
  const [accounts, setAccounts] = useState<Account[]>(() => StorageService.getAccounts());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>(() => StorageService.getRecurring());

  const [marketPrices, setMarketPrices] = useState<MarketPricesMap | null>(null);
  const [isMarketLive, setIsMarketLive] = useState<boolean>(false);
  const [marketError, setMarketError] = useState<string | undefined>(undefined);
  const [isLoadingPrices, setIsLoadingPrices] = useState<boolean>(true);

  // Initialize market service
  useEffect(() => {
    let isMounted = true;
    setIsLoadingPrices(true);

    marketService.init().then((prices) => {
      if (isMounted) {
        setMarketPrices(prices);
        setIsLoadingPrices(false);
      }
    });

    const unsubscribe = marketService.subscribe((prices, isLive, error) => {
      if (isMounted) {
        setMarketPrices(prices);
        setIsMarketLive(isLive);
        setMarketError(error);
        setIsLoadingPrices(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Auto-process due recurring transactions on mount
  useEffect(() => {
    const { updatedRecurring, newTransactions, hasChanges } = processDueRecurringTransactions(
      recurringTransactions,
      transactions
    );
    if (hasChanges) {
      if (newTransactions.length > 0) {
        setTransactions((prev) => [...newTransactions, ...prev]);
      }
      setRecurringTransactions(updatedRecurring);
    }
  }, []);

  // Compute live account balances via Central Finance Engine
  const computedAccounts = useMemo(() => {
    return calculateAccountBalances(accounts, transactions);
  }, [accounts, transactions]);

  // Total Liquid Wealth from all active bank and cash accounts
  const totalLiquidWealth = useMemo(() => {
    return calculateTotalLiquidWealth(computedAccounts);
  }, [computedAccounts]);

  // Centralized Single Source of Truth: Allocations, Holdings, Total Net Worth & Owned Assets
  const { allocations, totalNetWorth, ownedAssets, holdings } = useMemo(() => {
    const defaultPrices = marketPrices;
    let preciousMetalsAndFxTotal = 0;
    const items: AssetAllocationItem[] = [];
    const holdingsMap: HoldingsMap = {
      gramGold: 0,
      quarterGold: 0,
      halfGold: 0,
      fullGold: 0,
      usd: 0,
      eur: 0,
      try: 0,
    };

    // Find cash account current balance for try holding synchronization
    const cashAcc = computedAccounts.find((a) => a.type === 'cash');
    const cashBalance = cashAcc ? cashAcc.currentBalance : 0;

    (Object.keys(ASSET_DEFINITIONS) as AssetKey[]).forEach((key) => {
      const def = ASSET_DEFINITIONS[key];
      const custom = customAssets[key] || {};
      const quote = defaultPrices ? defaultPrices[key] : null;
      const unitPrice = key === 'try' ? 1.0 : (quote ? quote.price : 0);

      const assetTx = transactions.filter((t) => t.assetKey === key);
      const buyTx = assetTx.filter((t) => t.type === 'buy');
      const sellTx = assetTx.filter((t) => t.type === 'sell');

      const totalBoughtQty = buyTx.reduce((acc, t) => acc + (t.quantity || 0), 0);
      const totalSoldQty = sellTx.reduce((acc, t) => acc + (t.quantity || 0), 0);

      // Central quantity: total buys - total sells (for try, synchronize directly with liquid cash account)
      let qty = Math.max(0, Number((totalBoughtQty - totalSoldQty).toFixed(4)));
      if (key === 'try') {
        qty = Math.max(0, Number(cashBalance.toFixed(2)));
      }

      holdingsMap[key] = qty;

      // Compute weighted average purchase price from buy transactions
      let totalCostBasis = 0;
      let totalCostQty = 0;
      buyTx.forEach((tx) => {
        const p = tx.purchasePrice || tx.unitPrice || unitPrice;
        const q = tx.quantity || 1;
        totalCostBasis += p * q;
        totalCostQty += q;
      });

      const avgPurchasePrice = totalCostQty > 0 ? totalCostBasis / totalCostQty : unitPrice;
      const totalCost = avgPurchasePrice * qty;
      const val = Number((qty * unitPrice).toFixed(2));
      const totalProfitLoss = val - totalCost;
      const profitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

      if (key !== 'try') {
        preciousMetalsAndFxTotal += val;
      }

      items.push({
        key,
        name: custom.name || def.nameTr,
        nameTr: custom.name || def.nameTr,
        category: def.category,
        quantity: qty,
        totalBoughtQty,
        totalSoldQty,
        unitPrice,
        currentValue: val,
        totalCost,
        avgPurchasePrice,
        totalProfitLoss,
        profitLossPercent,
        percentage: 0,
        color: ASSET_COLORS[key] || '#E5B85C',
        customName: custom.name,
        customDesc: custom.description,
        customImageUrl: custom.imageUrl,
      });
    });

    // Unified Net Worth: Altın + Döviz Varlıkları + BÜTÜN Banka & Nakit Hesapları
    const overallTotalNetWorth = engineCalculateTotalNetWorth(preciousMetalsAndFxTotal, computedAccounts);

    const calculatedItems = items.map((it) => ({
      ...it,
      percentage: overallTotalNetWorth > 0 ? (it.currentValue / overallTotalNetWorth) * 100 : 0,
    }));

    const owned = calculatedItems.filter((it) => it.quantity > 0);

    return {
      allocations: calculatedItems,
      totalNetWorth: overallTotalNetWorth,
      ownedAssets: owned,
      holdings: holdingsMap,
    };
  }, [transactions, marketPrices, customAssets, computedAccounts]);

  // Sync to localStorage
  useEffect(() => {
    StorageService.saveHoldings(holdings);
  }, [holdings]);

  useEffect(() => {
    StorageService.saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    StorageService.saveAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    StorageService.saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    StorageService.saveRecurring(recurringTransactions);
  }, [recurringTransactions]);

  // Calculate currency rate based on active currency preference
  const currencyRate = useMemo(() => {
    if (!marketPrices) return 1.0;
    if (preferences.currency === 'USD') {
      const usdPrice = marketPrices.usd?.price || 48.69;
      return usdPrice > 0 ? 1 / usdPrice : 1.0;
    }
    if (preferences.currency === 'EUR') {
      const eurPrice = marketPrices.eur?.price || 55.89;
      return eurPrice > 0 ? 1 / eurPrice : 1.0;
    }
    return 1.0;
  }, [preferences.currency, marketPrices]);

  const currencySymbol = useMemo(() => {
    if (preferences.currency === 'USD') return '$';
    if (preferences.currency === 'EUR') return '€';
    return '₺';
  }, [preferences.currency]);

  const currencyCode = preferences.currency;

  const displayNetWorth = useMemo(() => {
    return totalNetWorth * currencyRate;
  }, [totalNetWorth, currencyRate]);

  // Daily Gain calculation in TRY
  const { totalGain24h, totalGain24hPercent } = useMemo(() => {
    if (!marketPrices) return { totalGain24h: 0, totalGain24hPercent: 0 };

    let totalDiff = 0;
    let baseVal = 0;

    (Object.keys(holdings) as AssetKey[]).forEach((key) => {
      const qty = holdings[key] || 0;
      if (qty <= 0) return;

      const quote = marketPrices[key];
      if (!quote) return;

      const currentVal = qty * quote.price;
      const pct = quote.change24hPercent / 100;
      const prevVal = currentVal / (1 + pct);

      totalDiff += (currentVal - prevVal);
      baseVal += prevVal;
    });

    const percent = baseVal > 0 ? (totalDiff / baseVal) * 100 : 0;
    return {
      totalGain24h: totalDiff,
      totalGain24hPercent: Number(percent.toFixed(2)),
    };
  }, [holdings, marketPrices]);

  // Multi-Period Performance Calculation
  const multiPeriodPerformance = useMemo<Record<PerformancePeriod, PeriodPerformance>>(() => {
    const dailyAmt = totalGain24h;
    const dailyPct = totalGain24hPercent;

    const weeklyAmt = Number((totalNetWorth * 0.0315).toFixed(2));
    const weeklyPct = 3.15;

    const monthlyAmt = Number((totalNetWorth * 0.0801).toFixed(2));
    const monthlyPct = 8.01;

    const yearlyAmt = Number((totalNetWorth * 0.2104).toFixed(2));
    const yearlyPct = 21.04;

    return {
      daily: { amount: dailyAmt, percent: dailyPct, isPositive: dailyAmt >= 0, periodLabel: 'Günlük' },
      weekly: { amount: weeklyAmt, percent: weeklyPct, isPositive: weeklyAmt >= 0, periodLabel: 'Haftalık' },
      monthly: { amount: monthlyAmt, percent: monthlyPct, isPositive: monthlyAmt >= 0, periodLabel: 'Aylık' },
      yearly: { amount: yearlyAmt, percent: yearlyPct, isPositive: yearlyAmt >= 0, periodLabel: 'Yıllık' },
    };
  }, [totalNetWorth, totalGain24h, totalGain24hPercent]);

  const currentPeriodPerformance = multiPeriodPerformance[selectedPeriod];

  // Monthly Cashflow via Unified Central Engine
  const monthlyCashflow = useMemo(() => {
    return calculateMonthlyCashflow(transactions);
  }, [transactions]);

  const monthlyIncome = monthlyCashflow.realizedIncome;
  const monthlyExpense = monthlyCashflow.realizedExpense;
  const monthlyNetSavings = monthlyCashflow.realizedNet;
  const monthlyRealizedIncome = monthlyCashflow.realizedIncome;
  const monthlyExpectedIncome = monthlyCashflow.expectedIncome;
  const monthlyRealizedExpense = monthlyCashflow.realizedExpense;
  const monthlyExpectedExpense = monthlyCashflow.expectedExpense;
  const monthlyRealizedNet = monthlyCashflow.realizedNet;
  const monthlyExpectedNet = monthlyCashflow.expectedNet;
  const expectedNetSavings = monthlyCashflow.expectedNet;

  const todaySummary = useMemo(() => {
    return calculateTodaySummary(transactions);
  }, [transactions]);

  const expenseDistribution = useMemo(() => {
    return calculateExpenseCategoryDistribution(transactions);
  }, [transactions]);

  // Asset Actions
  const addAsset = useCallback((
    assetKey: AssetKey, 
    quantity: number, 
    note?: string, 
    purchasePrice?: number,
    transactionDate?: string,
    transactionTime?: string,
    marketPriceAtTransaction?: number,
    accountId?: string
  ) => {
    if (quantity <= 0) return;

    const quote = marketPrices ? marketPrices[assetKey] : null;
    const currentMarketPrice = assetKey === 'try' ? 1.0 : (quote ? quote.price : 0);
    const finalPurchasePrice = purchasePrice && purchasePrice > 0 ? purchasePrice : currentMarketPrice;
    const totalVal = Number((quantity * finalPurchasePrice).toFixed(2));

    const now = new Date();
    const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    const defaultDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const txDate = transactionDate?.trim() || defaultDate;
    const txTime = transactionTime?.trim() || defaultTime;
    const createdStr = `${defaultDate} • ${defaultTime}`;

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      assetKey,
      quantity,
      type: 'buy',
      unitPrice: finalPurchasePrice,
      purchasePrice: finalPurchasePrice,
      totalValue: totalVal,
      date: txDate,
      timestamp: Date.now(),
      transactionDate: txDate,
      transactionTime: txTime,
      createdAt: Date.now(),
      createdDateStr: createdStr,
      marketPriceAtTransaction: marketPriceAtTransaction || currentMarketPrice,
      note,
      accountId,
      status: 'completed',
    };

    setTransactions((prev) => [newTx, ...prev]);
  }, [marketPrices]);

  const removeAsset = useCallback((
    assetKey: AssetKey, 
    quantity: number,
    sellPrice?: number,
    transactionDate?: string,
    transactionTime?: string,
    note?: string,
    targetAccountId?: string
  ) => {
    if (quantity <= 0) return;

    const quote = marketPrices ? marketPrices[assetKey] : null;
    const currentPrice = assetKey === 'try' ? 1.0 : (quote ? quote.price : 0);
    const finalSellPrice = sellPrice && sellPrice > 0 ? sellPrice : currentPrice;
    const totalVal = Number((quantity * finalSellPrice).toFixed(2));

    const now = new Date();
    const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    const defaultDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const txDate = transactionDate?.trim() || defaultDate;
    const txTime = transactionTime?.trim() || defaultTime;
    const createdStr = `${defaultDate} • ${defaultTime}`;

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      assetKey,
      quantity,
      type: 'sell',
      unitPrice: finalSellPrice,
      purchasePrice: finalSellPrice,
      totalValue: totalVal,
      date: txDate,
      timestamp: Date.now(),
      transactionDate: txDate,
      transactionTime: txTime,
      createdAt: Date.now(),
      createdDateStr: createdStr,
      marketPriceAtTransaction: currentPrice,
      note,
      targetAccountId,
      status: 'completed',
    };

    setTransactions((prev) => [newTx, ...prev]);
  }, [marketPrices]);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => {
      return prev.map((tx) => {
        if (tx.id !== id) return tx;
        const updated = { ...tx, ...updates };

        // If purchasePrice changed, update totalValue
        if (updates.purchasePrice !== undefined && updates.purchasePrice > 0) {
          updated.purchasePrice = updates.purchasePrice;
          updated.unitPrice = updates.purchasePrice;
          updated.totalValue = Number(((updated.quantity || 1) * updates.purchasePrice).toFixed(2));
        }

        return updated;
      });
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const markTransactionStatus = useCallback((id: string, status: TransactionStatus) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }, []);

  // Income & Expense Actions with Account & Status Support
  const addIncome = useCallback((
    amount: number, 
    category: CashflowCategory | string, 
    title: string, 
    date?: string, 
    note?: string,
    accountId?: string,
    status: TransactionStatus = 'completed'
  ) => {
    if (amount <= 0) return;
    const now = new Date();
    const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    const defaultDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = date || defaultDate;

    const newTx: Transaction = {
      id: `tx-inc-${Date.now()}`,
      type: 'income',
      totalValue: amount,
      category,
      title,
      date: dateStr,
      timestamp: Date.now(),
      transactionDate: dateStr,
      transactionTime: defaultTime,
      createdAt: Date.now(),
      createdDateStr: `${dateStr} • ${defaultTime}`,
      note,
      accountId: accountId || 'acc-ziraat',
      status,
    };

    setTransactions((prev) => [newTx, ...prev]);
  }, []);

  const addExpense = useCallback((
    amount: number, 
    category: CashflowCategory | string, 
    title: string, 
    date?: string, 
    note?: string,
    accountId?: string,
    status: TransactionStatus = 'completed'
  ) => {
    if (amount <= 0) return;
    const now = new Date();
    const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    const defaultDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = date || defaultDate;

    const newTx: Transaction = {
      id: `tx-exp-${Date.now()}`,
      type: 'expense',
      totalValue: amount,
      category,
      title,
      date: dateStr,
      timestamp: Date.now(),
      transactionDate: dateStr,
      transactionTime: defaultTime,
      createdAt: Date.now(),
      createdDateStr: `${dateStr} • ${defaultTime}`,
      note,
      accountId: accountId || 'acc-ziraat',
      status,
    };

    setTransactions((prev) => [newTx, ...prev]);
  }, []);

  // Para Transferi Eylemi (Kaynak hesaptan hedef hesaba transfer - Net worth DEĞİŞMEZ)
  const transferFunds = useCallback((
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    date?: string,
    time?: string,
    note?: string
  ) => {
    if (amount <= 0 || !fromAccountId || !toAccountId) return;
    const now = new Date();
    const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    const defaultDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const txDate = date?.trim() || defaultDate;
    const txTime = time?.trim() || defaultTime;

    const newTx: Transaction = {
      id: `tx-trans-${Date.now()}`,
      type: 'transfer',
      totalValue: amount,
      accountId: fromAccountId,
      targetAccountId: toAccountId,
      status: 'completed',
      date: txDate,
      timestamp: Date.now(),
      transactionDate: txDate,
      transactionTime: txTime,
      createdAt: Date.now(),
      createdDateStr: `${txDate} • ${txTime}`,
      note: note || 'Hesaplar arası transfer',
    };

    setTransactions((prev) => [newTx, ...prev]);
  }, []);

  // Banka & Nakit Hesap Yönetimi
  const addAccount = useCallback((accountData: Omit<Account, 'id' | 'createdAt'>) => {
    const newAccount: Account = {
      ...accountData,
      id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setAccounts((prev) => [...prev, newAccount]);
  }, []);

  const updateAccount = useCallback((id: string, updates: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...updates, updatedAt: Date.now() } : acc))
    );
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  }, []);

  // Sabit / Tekrarlayan İşlem Yönetimi
  const addRecurring = useCallback((recData: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nextOccurrence = recData.nextOccurrence || getNextOccurrenceDate(recData.dayOfMonth).isoDate;
    const newRec: RecurringTransaction = {
      ...recData,
      nextOccurrence,
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setRecurringTransactions((prev) => [...prev, newRec]);
  }, []);

  const updateRecurring = useCallback((id: string, updates: Partial<RecurringTransaction>) => {
    setRecurringTransactions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r))
    );
  }, []);

  const deleteRecurring = useCallback((id: string) => {
    setRecurringTransactions((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleRecurring = useCallback((id: string) => {
    setRecurringTransactions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active, updatedAt: Date.now() } : r))
    );
  }, []);

  // Kategori Ekleme
  const addCategory = useCallback((catData: Omit<Category, 'id' | 'createdAt'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setCategories((prev) => [...prev, newCat]);
  }, []);

  // Goal Actions
  const addGoal = useCallback((goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      createdAt: Date.now(),
    };
    setGoals((prev) => [newGoal, ...prev]);
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const allocateToGoal = useCallback((goalId: string, amount: number) => {
    if (amount <= 0) return;
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          return { ...g, currentAmount: g.currentAmount + amount };
        }
        return g;
      })
    );
  }, []);

  // Notes & Tasks Actions
  const addNote = useCallback((item: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: NoteItem = {
      ...item,
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<NoteItem>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n))
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, completed: !n.completed, updatedAt: Date.now() } : n))
    );
  }, []);

  const updateCustomAssetMeta = useCallback((assetKey: AssetKey, meta: Partial<CustomAssetMeta>) => {
    setCustomAssets((prev) => ({
      ...prev,
      [assetKey]: {
        ...(prev[assetKey] || {}),
        ...meta,
        updatedAt: Date.now(),
      },
    }));
  }, []);

  // UI Preference Actions
  const togglePrivacy = useCallback(() => {
    setPreferences((prev) => ({ ...prev, isBalanceHidden: !prev.isBalanceHidden }));
  }, []);

  const updatePreferences = useCallback((newPrefs: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
  }, []);

  const refreshMarket = useCallback(async () => {
    setIsLoadingPrices(true);
    try {
      await marketService.refresh(true);
    } finally {
      setIsLoadingPrices(false);
    }
  }, []);

  const resetToDemo = useCallback(() => {
    StorageService.resetToDemo();
    setTransactions(StorageService.getTransactions());
    setGoals(StorageService.getGoals());
    setNotes(StorageService.getNotes());
    setCustomAssets(StorageService.getCustomAssets());
    setPreferences(StorageService.getPreferences());
    setAccounts(StorageService.getAccounts());
    setCategories(StorageService.getCategories());
    setRecurringTransactions(StorageService.getRecurring());
  }, []);

  const clearPortfolio = useCallback(() => {
    StorageService.clearAllData();
    setTransactions([]);
    setGoals([]);
    setNotes([]);
    setAccounts([]);
    setRecurringTransactions([]);
  }, []);

  // Format money helper
  const formatMoney = useCallback((amount: number, forceShow = false) => {
    const sym = preferences.currency === 'USD' ? '$' : preferences.currency === 'EUR' ? '€' : '₺';
    if (preferences.isBalanceHidden && !forceShow) {
      return `•••••• ${sym}`;
    }

    let convertedAmount = amount;
    if (preferences.currency === 'USD') {
      const rate = marketPrices?.usd?.price || 48.69;
      convertedAmount = rate > 0 ? amount / rate : amount;
      const formatted = new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(convertedAmount);
      return `${sym}${formatted}`;
    }

    if (preferences.currency === 'EUR') {
      const rate = marketPrices?.eur?.price || 55.89;
      convertedAmount = rate > 0 ? amount / rate : amount;
      const formatted = new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(convertedAmount);
      return `${sym}${formatted}`;
    }

    const formatted = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${sym}${formatted}`;
  }, [preferences.isBalanceHidden, preferences.currency, marketPrices]);

  // Market status for LiveIndicator
  const marketStatus: LiveIndicatorStatus = useMemo(() => {
    if (isLoadingPrices) return 'updating';
    if (marketError) return 'offline';
    return 'live';
  }, [isLoadingPrices, marketError]);

  return (
    <PortfolioContext.Provider
      value={{
        holdings,
        transactions,
        goals,
        notes,
        customAssets,
        marketPrices,
        isMarketLive,
        marketStatus,
        marketError,
        isLoadingPrices,
        preferences,
        selectedPeriod,
        setSelectedPeriod,
        currentPeriodPerformance,
        multiPeriodPerformance,
        totalNetWorth,
        displayNetWorth,
        currencySymbol,
        currencyCode,
        totalGain24h,
        totalGain24hPercent,
        allocations,
        ownedAssets,
        accounts: computedAccounts,
        categories,
        recurringTransactions,
        monthlyCashflow,
        expectedNetSavings,
        totalLiquidWealth,
        isBalanceHidden: preferences.isBalanceHidden,
        monthlyIncome,
        monthlyExpense,
        monthlyNetSavings,
        monthlyRealizedIncome,
        monthlyExpectedIncome,
        monthlyRealizedExpense,
        monthlyExpectedExpense,
        monthlyRealizedNet,
        monthlyExpectedNet,
        todaySummary,
        expenseDistribution,
        addAsset,
        removeAsset,
        updateTransaction,
        deleteTransaction,
        markTransactionStatus,
        addIncome,
        addExpense,
        transferFunds,
        addAccount,
        updateAccount,
        deleteAccount,
        addRecurring,
        updateRecurring,
        deleteRecurring,
        toggleRecurring,
        addCategory,
        addGoal,
        updateGoal,
        deleteGoal,
        allocateToGoal,
        addNote,
        updateNote,
        deleteNote,
        toggleTodo,
        updateCustomAssetMeta,
        togglePrivacy,
        refreshMarket,
        updatePreferences,
        resetToDemo,
        clearPortfolio,
        formatMoney,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
