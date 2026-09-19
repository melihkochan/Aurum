import type { 
  Account, 
  Transaction, 
  Category, 
  RecurringTransaction,
} from './types';

export interface MonthlyCashflowSummary {
  realizedIncome: number;
  expectedIncome: number;
  totalIncome: number; // realized + expected
  realizedExpense: number;
  expectedExpense: number;
  totalExpense: number; // realized + expected
  realizedNet: number;
  expectedNet: number;
  savingsRate: number;
}

export interface CategoryBreakdownItem {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  monthlyBudget?: number;
}

export interface MonthlyTrendItem {
  monthKey: string; // "2026-09"
  monthLabel: string; // "Eylül"
  year: number;
  income: number;
  expense: number;
  net: number;
}

const MONTH_NAMES_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

/**
 * 1. HESAP BAKİYELERİ HESAPLAMA MOTORU
 * Her banka ve nakit hesabı için net currentBalance hesaplar.
 * Sadece 'completed' durumundaki işlemler dahil edilir.
 * 'expected' işlemler ASLA bakiyeyi etkilemez.
 */
export function calculateAccountBalances(
  accounts: Account[],
  transactions: Transaction[]
): (Account & { currentBalance: number; monthlyIn: number; monthlyOut: number })[] {
  const currentMonthIdx = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthName = MONTH_NAMES_TR[currentMonthIdx];

  return accounts.map((acc) => {
    let balance = acc.initialBalance || 0;
    let monthlyIn = 0;
    let monthlyOut = 0;

    transactions.forEach((tx) => {
      // Sadece tamamlanmış (completed) veya eski kayıtlarda status undefined ise tamamlanmış kabul et
      const isCompleted = tx.status === 'completed' || tx.status === undefined;
      if (!isCompleted) return;

      const isCurrentMonth = 
        (tx.transactionDate && tx.transactionDate.includes(currentMonthName)) ||
        (tx.date && tx.date.includes(currentMonthName)) ||
        (new Date(tx.timestamp).getMonth() === currentMonthIdx && new Date(tx.timestamp).getFullYear() === currentYear);

      const amount = tx.totalValue || 0;

      // 1. GELİR (Income)
      if (tx.type === 'income' && tx.accountId === acc.id) {
        balance += amount;
        if (isCurrentMonth) monthlyIn += amount;
      }

      // 2. GİDER (Expense)
      else if (tx.type === 'expense' && tx.accountId === acc.id) {
        balance -= amount;
        if (isCurrentMonth) monthlyOut += amount;
      }

      // 3. TRANSFER (Transfer)
      else if (tx.type === 'transfer') {
        if (tx.accountId === acc.id) {
          // Kaynak hesaptan para çıktı
          balance -= amount;
          if (isCurrentMonth) monthlyOut += amount;
        }
        if (tx.targetAccountId === acc.id) {
          // Hedef hesaba para girdi
          balance += amount;
          if (isCurrentMonth) monthlyIn += amount;
        }
      }

      // 4. VARLIK ALIMI (Buy - hesaptan para ödenir)
      else if (tx.type === 'buy' && tx.accountId === acc.id) {
        balance -= amount;
        if (isCurrentMonth) monthlyOut += amount;
      }

      // 5. VARLIK SATIMI (Sell - hesaba satış parası gelir)
      else if (tx.type === 'sell' && tx.targetAccountId === acc.id) {
        balance += amount;
        if (isCurrentMonth) monthlyIn += amount;
      }

      // 6. PARA ÇEKME (Withdrawal)
      else if (tx.type === 'withdrawal' && tx.accountId === acc.id) {
        balance -= amount;
        if (isCurrentMonth) monthlyOut += amount;
      }

      // 7. PARA YATIRMA (Deposit)
      else if (tx.type === 'deposit' && tx.accountId === acc.id) {
        balance += amount;
        if (isCurrentMonth) monthlyIn += amount;
      }
    });

    return {
      ...acc,
      currentBalance: Number(balance.toFixed(2)),
      balance: Number(balance.toFixed(2)),
      monthlyIn: Number(monthlyIn.toFixed(2)),
      monthlyOut: Number(monthlyOut.toFixed(2)),
    };
  });
}

/**
 * 2. TOPLAM LİKİT HESAP VARLIĞI
 */
export function calculateTotalLiquidWealth(accountsWithBalances: { currentBalance: number }[]): number {
  return accountsWithBalances.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
}

/**
 * 3. TOPLAM NET VARLIK (CENTRAL SINGLE SOURCE OF TRUTH)
 * Altın/Döviz Varlıklarının Değeri + Likit Banka & Nakit Bakiyeleri
 */
export function calculateTotalNetWorth(
  assetsValueWithoutCash: number,
  accountsWithBalances: { currentBalance: number }[]
): number {
  const liquidTotal = calculateTotalLiquidWealth(accountsWithBalances);
  return Number((assetsValueWithoutCash + liquidTotal).toFixed(2));
}

/**
 * 4. AYLIK NAKİT AKIŞI (GERÇEKLEŞEN & BEKLENEN)
 */
export function calculateMonthlyCashflow(
  transactions: Transaction[],
  monthName?: string
): MonthlyCashflowSummary {
  const targetMonth = monthName || MONTH_NAMES_TR[new Date().getMonth()];

  let realizedIncome = 0;
  let expectedIncome = 0;
  let realizedExpense = 0;
  let expectedExpense = 0;

  transactions.forEach((tx) => {
    const isThisMonth = 
      (tx.transactionDate && tx.transactionDate.includes(targetMonth)) ||
      (tx.date && tx.date.includes(targetMonth));

    if (!isThisMonth) return;

    const amount = tx.totalValue || 0;
    const isExpected = tx.status === 'expected';

    if (tx.type === 'income') {
      if (isExpected) {
        expectedIncome += amount;
      } else {
        realizedIncome += amount;
      }
    } else if (tx.type === 'expense') {
      if (isExpected) {
        expectedExpense += amount;
      } else {
        realizedExpense += amount;
      }
    }
  });

  const totalIncome = realizedIncome + expectedIncome;
  const totalExpense = realizedExpense + expectedExpense;
  const realizedNet = realizedIncome - realizedExpense;
  const expectedNet = totalIncome - totalExpense;
  const savingsRate = realizedIncome > 0
    ? Math.max(0, Math.round((realizedNet / realizedIncome) * 100))
    : 0;

  return {
    realizedIncome: Number(realizedIncome.toFixed(2)),
    expectedIncome: Number(expectedIncome.toFixed(2)),
    totalIncome: Number(totalIncome.toFixed(2)),
    realizedExpense: Number(realizedExpense.toFixed(2)),
    expectedExpense: Number(expectedExpense.toFixed(2)),
    totalExpense: Number(totalExpense.toFixed(2)),
    realizedNet: Number(realizedNet.toFixed(2)),
    expectedNet: Number(expectedNet.toFixed(2)),
    savingsRate,
  };
}

/**
 * 5. KATEGORİ BAZLI HARCAMA / GELİR ANALİZİ
 */
export function calculateCategoryDistribution(
  transactions: Transaction[],
  type: 'income' | 'expense',
  categories: Category[],
  monthName?: string
): CategoryBreakdownItem[] {
  const targetMonth = monthName || MONTH_NAMES_TR[new Date().getMonth()];
  const categoryMap = new Map<string, Category>();
  categories.forEach((c) => categoryMap.set(c.id, c));
  categories.forEach((c) => categoryMap.set(c.name.toLowerCase(), c));

  const itemsMap: Record<string, { amount: number; count: number; categoryObj?: Category }> = {};
  let totalAmount = 0;

  transactions.forEach((tx) => {
    if (tx.type !== type) return;
    if (tx.status === 'cancelled') return;

    const isThisMonth = 
      !targetMonth ||
      (tx.transactionDate && tx.transactionDate.includes(targetMonth)) ||
      (tx.date && tx.date.includes(targetMonth));

    if (!isThisMonth) return;

    const catKey = tx.categoryId || (typeof tx.category === 'string' ? tx.category : 'other');
    const resolvedCat = categoryMap.get(catKey) || 
      categories.find((c) => c.name.toLowerCase() === catKey.toLowerCase()) || 
      categoryMap.get('cat-exp-other') || 
      categoryMap.get('cat-inc-other');

    const key = resolvedCat?.id || catKey;

    if (!itemsMap[key]) {
      itemsMap[key] = { amount: 0, count: 0, categoryObj: resolvedCat };
    }

    const val = tx.totalValue || 0;
    itemsMap[key].amount += val;
    itemsMap[key].count += 1;
    totalAmount += val;
  });

  const result: CategoryBreakdownItem[] = Object.keys(itemsMap).map((key) => {
    const data = itemsMap[key];
    const cat = data.categoryObj;
    const amount = Number(data.amount.toFixed(2));
    const percentage = totalAmount > 0 ? Number(((amount / totalAmount) * 100).toFixed(1)) : 0;

    return {
      id: key,
      name: cat ? cat.name : key,
      type,
      color: cat?.color || (type === 'income' ? '#10B981' : '#EF4444'),
      icon: cat?.icon || 'Tags',
      amount,
      percentage,
      transactionCount: data.count,
      monthlyBudget: cat?.monthlyBudget,
    };
  });

  // Tutar sırasına göre azalan sırala
  return result.sort((a, b) => b.amount - a.amount);
}

/**
 * 6. AYLIK NAKİT AKIŞI GEÇMİŞİ (6 veya 12 Ay Trendi)
 */
export function calculateCashflowHistory(
  transactions: Transaction[],
  monthsCount: 6 | 12 = 6
): MonthlyTrendItem[] {
  const result: MonthlyTrendItem[] = [];
  const now = new Date();

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mIdx = d.getMonth();
    const year = d.getFullYear();
    const monthName = MONTH_NAMES_TR[mIdx];
    const monthKey = `${year}-${String(mIdx + 1).padStart(2, '0')}`;

    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      // 'completed' ve gerçekleşmiş olanları ekle
      if (tx.status === 'cancelled') return;
      const isCompleted = tx.status === 'completed' || tx.status === undefined;
      if (!isCompleted) return;

      const txDateStr = tx.transactionDate || tx.date || '';
      const txTimestamp = tx.timestamp ? new Date(tx.timestamp) : null;

      const matchesMonth = 
        txDateStr.includes(monthName) ||
        (txTimestamp && txTimestamp.getMonth() === mIdx && txTimestamp.getFullYear() === year);

      if (matchesMonth) {
        if (tx.type === 'income') {
          income += tx.totalValue || 0;
        } else if (tx.type === 'expense') {
          expense += tx.totalValue || 0;
        }
      }
    });

    result.push({
      monthKey,
      monthLabel: monthName,
      year,
      income: Number(income.toFixed(2)),
      expense: Number(expense.toFixed(2)),
      net: Number((income - expense).toFixed(2)),
    });
  }

  return result;
}

/**
 * 7. YAKLAŞAN / BEKLENEN İŞLEMLER LİSTESİ
 */
export function getUpcomingExpectedTransactions(
  transactions: Transaction[],
  recurring: RecurringTransaction[] = [],
  limit = 5
): Array<{
  id: string;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  dateStr: string;
  accountName?: string;
  isRecurringSource?: boolean;
}> {
  // 1. Transaction tablosundaki status === 'expected' olanlar
  const expectedTx = transactions
    .filter((t) => t.status === 'expected')
    .map((t) => ({
      id: t.id,
      name: t.title || t.name || (t.type === 'income' ? 'Beklenen Gelir' : 'Beklenen Gider'),
      type: t.type as 'income' | 'expense',
      amount: t.totalValue,
      dateStr: t.transactionDate || t.date,
      accountName: t.accountId,
      isRecurringSource: false,
    }));

  // 2. Aktif recurring'lerden de ekle
  const recurringItems = recurring
    .filter((r) => r.active)
    .map((r) => ({
      id: `rec-upcoming-${r.id}`,
      name: r.name,
      type: r.type,
      amount: r.amount,
      dateStr: `Her ayın ${r.dayOfMonth}'i`,
      accountName: r.accountId,
      isRecurringSource: true,
    }));

  return [...expectedTx, ...recurringItems].slice(0, limit);
}

/**
 * 8. SONRAKİ GERÇEKLEŞME TARİHİ HESAPLAMA
 * Güncel tarihe göre sonraki gerçekleşme tarihini hesaplar.
 */
export function getNextOccurrenceDate(
  dayOfMonth: number, 
  baseDate = new Date()
): { dateStr: string; isoDate: string; isPastThisMonth: boolean } {
  const currentYear = baseDate.getFullYear();
  const currentMonth = baseDate.getMonth();
  const currentDay = baseDate.getDate();

  let targetYear = currentYear;
  let targetMonth = currentMonth;
  const isPastThisMonth = dayOfMonth <= currentDay;

  if (isPastThisMonth) {
    targetMonth += 1;
    if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }
  }

  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const actualDay = Math.min(dayOfMonth, daysInMonth);

  const monthName = MONTH_NAMES_TR[targetMonth];
  const dateStr = `${actualDay} ${monthName}`;
  const isoDate = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}`;

  return { dateStr, isoDate, isPastThisMonth };
}

export interface TodaySummary {
  incomeToday: number;
  expenseToday: number;
  netToday: number;
  income: number;
  expense: number;
  net: number;
  count: number;
}

export interface CategoryDistributionItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

/**
 * 9. VADESİ GELEN DÜZENLİ İŞLEMLERİ GERÇEKLEŞTİRME MOTORU
 * Tarihi gelen aktif düzenli işlemleri (örneğin 1 Ekim maaşı geldiğinde)
 * otomatik olarak gerçekleşmiş işleme dönüştürür.
 */
export function processDueRecurringTransactions(
  recurringList: RecurringTransaction[],
  existingTransactions: Transaction[],
  currentDate = new Date()
): {
  newTransactions: Transaction[];
  updatedRecurringList: RecurringTransaction[];
  updatedRecurring: RecurringTransaction[];
  hasChanges: boolean;
} {
  const newTransactions: Transaction[] = [];
  const currentIso = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

  const updatedRecurringList = recurringList.map((item) => {
    if (!item.active) return item;

    // Sonraki ödeme tarihi yoksa belirle
    let nextOcc = item.nextOccurrence;
    if (!nextOcc) {
      const calc = getNextOccurrenceDate(item.dayOfMonth, currentDate);
      nextOcc = calc.isoDate;
    }

    // Vadesi bugün veya geçmiş mi?
    const isDue = nextOcc <= currentIso;

    if (isDue) {
      // Bu dönem için zaten tamamlanmış bir işlem oluşturulmuş mu?
      const alreadyCreated = existingTransactions.some(
        (tx) => 
          tx.recurringTransactionId === item.id && 
          (tx.date === nextOcc || (tx.transactionDate && tx.transactionDate.includes(nextOcc)))
      );

      if (!alreadyCreated) {
        // Yeni tamamlanmış işlem oluştur
        const dateParts = nextOcc.split('-');
        const y = parseInt(dateParts[0], 10);
        const m = parseInt(dateParts[1], 10) - 1;
        const d = parseInt(dateParts[2], 10);
        const formattedDateStr = `${d} ${MONTH_NAMES_TR[m]} ${y}`;

        const newTx: Transaction = {
          id: `tx-rec-${item.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: item.type,
          title: item.name,
          name: item.name,
          totalValue: item.amount,
          quantity: 1,
          accountId: item.accountId,
          category: item.categoryId,
          status: 'completed',
          date: formattedDateStr,
          transactionDate: formattedDateStr,
          transactionTime: '09:00',
          timestamp: new Date(y, m, d, 9, 0).getTime(),
          recurringTransactionId: item.id,
          installmentCurrent: item.installmentCurrent,
          installmentTotal: item.installmentTotal,
        };

        newTransactions.push(newTx);
      }

      // Bir sonraki aya taşı
      const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, item.dayOfMonth);
      const nextCalc = getNextOccurrenceDate(item.dayOfMonth, nextMonthDate);

      // Taksit güncellemesi
      let newInstallmentCurrent = item.installmentCurrent;
      let newInstallmentRemaining = item.installmentRemaining;
      let stillActive: boolean = item.active;

      if (item.installmentTotal && item.installmentTotal > 0) {
        newInstallmentCurrent = (item.installmentCurrent || 0) + 1;
        if (newInstallmentRemaining && newInstallmentRemaining > 0) {
          newInstallmentRemaining -= 1;
        }
        if (newInstallmentCurrent >= item.installmentTotal) {
          stillActive = false; // Taksitler bitti
        }
      }

      return {
        ...item,
        nextOccurrence: nextCalc.isoDate,
        installmentCurrent: newInstallmentCurrent,
        installmentRemaining: newInstallmentRemaining,
        active: stillActive,
        updatedAt: Date.now(),
      };
    }

    return item;
  });

  const hasChanges = newTransactions.length > 0;

  return {
    newTransactions,
    updatedRecurringList,
    updatedRecurring: updatedRecurringList,
    hasChanges,
  };
}

export function getTodayDateStr(): string {
  const now = new Date();
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

/**
 * 10. BUGÜNKÜ ÖZET (GELİR, GİDER, NET)
 */
export function calculateTodaySummary(
  transactions: Transaction[],
  todayStr = getTodayDateStr()
): TodaySummary {
  let incomeToday = 0;
  let expenseToday = 0;
  let count = 0;

  transactions.forEach((tx) => {
    const isCompleted = tx.status === 'completed' || tx.status === undefined;
    if (!isCompleted) return;

    const txDate = tx.transactionDate || tx.date || '';
    const isToday = txDate.includes(todayStr) || txDate.toLowerCase().includes('bugün');

    if (isToday) {
      count += 1;
      if (tx.type === 'income') {
        incomeToday += tx.totalValue || 0;
      } else if (tx.type === 'expense') {
        expenseToday += tx.totalValue || 0;
      }
    }
  });

  const net = Number((incomeToday - expenseToday).toFixed(2));

  return {
    incomeToday: Number(incomeToday.toFixed(2)),
    expenseToday: Number(expenseToday.toFixed(2)),
    netToday: net,
    income: Number(incomeToday.toFixed(2)),
    expense: Number(expenseToday.toFixed(2)),
    net,
    count,
  };
}

/**
 * 11. HARCAMA DAĞILIMI (KATEGORİSEL YÜZDELER VE TUTARLAR)
 */
export function calculateExpenseCategoryDistribution(
  transactions: Transaction[],
  categories: Category[] = []
): CategoryDistributionItem[] {
  const categoryMap = new Map<string, Category>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  let totalExpense = 0;
  const expenseByCat: Record<string, number> = {};

  transactions.forEach((tx) => {
    if (tx.type !== 'expense') return;
    const isCompleted = tx.status === 'completed' || tx.status === undefined;
    if (!isCompleted) return;

    const amount = tx.totalValue || 0;
    totalExpense += amount;

    const catKey = tx.category || tx.categoryId || 'Diğer';
    expenseByCat[catKey] = (expenseByCat[catKey] || 0) + amount;
  });

  if (totalExpense === 0) return [];

  const defaultColors = ['#F43F5E', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#64748B'];

  return Object.entries(expenseByCat)
    .map(([key, amount], index) => {
      const cat = categoryMap.get(key);
      const name = cat?.name || key;
      const color = cat?.color || defaultColors[index % defaultColors.length];
      const percentage = Number(((amount / totalExpense) * 100).toFixed(1));

      return {
        id: key,
        name,
        category: name,
        amount: Number(amount.toFixed(2)),
        percentage,
        color,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}
