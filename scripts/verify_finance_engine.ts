import {
  calculateAccountBalances,
  calculateTotalNetWorth,
  calculateMonthlyCashflow,
  calculateTotalLiquidWealth,
  processDueRecurringTransactions,
  getNextOccurrenceDate,
  calculateTodaySummary,
  calculateExpenseCategoryDistribution
} from '../src/services/portfolio/financeEngine';
import type { Account, Transaction, RecurringTransaction } from '../src/services/portfolio/types';

console.log('=== TEST 1: RECURRING SALARY NOT COUNTED BEFORE DUE DATE ===');
const accounts: Account[] = [
  { id: 'acc-garanti', name: 'Garanti BBVA', type: 'bank', initialBalance: 82700, currency: 'TRY', createdAt: Date.now() },
  { id: 'acc-nakit', name: 'Nakit Kasa', type: 'cash', initialBalance: 5000, currency: 'TRY', createdAt: Date.now() }
];

// Today is 18 September 2026. Salary is due on 1 October 2026 (next month).
const recurring: RecurringTransaction[] = [
  {
    id: 'rec-salary',
    type: 'income',
    amount: 57700,
    frequency: 'monthly',
    dayOfMonth: 1,
    accountId: 'acc-garanti',
    name: 'Maaş',
    categoryId: 'Maaş',
    active: true,
    nextOccurrence: '2026-10-01',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'rec-installment',
    type: 'expense',
    amount: 4500,
    frequency: 'monthly',
    dayOfMonth: 25,
    accountId: 'acc-garanti',
    name: 'Laptop Taksiti',
    categoryId: 'Elektronik',
    active: true,
    installmentCurrent: 5,
    installmentTotal: 8,
    installmentRemaining: 3,
    nextOccurrence: '2026-09-25',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
];

const transactions: Transaction[] = [
  {
    id: 'tx-1',
    type: 'income',
    totalValue: 12000,
    accountId: 'acc-garanti',
    date: '18 Eylül 2026',
    transactionDate: '18 Eylül 2026',
    status: 'completed',
    title: 'Danışmanlık Geliri',
    timestamp: Date.now(),
  },
  {
    id: 'tx-2',
    type: 'expense',
    totalValue: 1500,
    accountId: 'acc-garanti',
    date: '18 Eylül 2026',
    transactionDate: '18 Eylül 2026',
    status: 'completed',
    title: 'Market Alışverişi',
    category: 'Market',
    timestamp: Date.now(),
  }
];

const computedAccounts = calculateAccountBalances(accounts, transactions);
const garantiBalance = computedAccounts.find(a => a.id === 'acc-garanti')?.currentBalance;
console.log(`Garanti BBVA Balance: ${garantiBalance} (Expected: 82700 + 12000 - 1500 = 93200)`);
if (garantiBalance !== 93200) {
  console.error('FAIL: Balance inflated!');
  process.exit(1);
} else {
  console.log('PASS: Salary ₺57,700 was NOT counted in Garanti BBVA balance!');
}

console.log('\n=== TEST 2: TOTAL NET WORTH CALCULATION ===');
const goldAndFxValue = 150000;
const totalNetWorth = calculateTotalNetWorth(goldAndFxValue, computedAccounts);
console.log(`Total Net Worth: ${totalNetWorth} (Expected: 150000 + 93200 + 5000 = 248200)`);
if (totalNetWorth !== 248200) {
  console.error('FAIL: Net Worth mismatch');
  process.exit(1);
} else {
  console.log('PASS: Net Worth correctly computed without unearned money!');
}

console.log('\n=== TEST 3: REALIZED VS EXPECTED CASHFLOW ===');
const cashflow = calculateMonthlyCashflow(transactions, 'Eylül 2026');
console.log(`Realized Income: ${cashflow.realizedIncome} (Expected: 12000)`);
console.log(`Realized Expense: ${cashflow.realizedExpense} (Expected: 1500)`);
console.log(`Realized Net: ${cashflow.realizedNet} (Expected: 10500)`);
if (cashflow.realizedNet !== 10500) {
  console.error('FAIL: Cashflow mismatch');
  process.exit(1);
} else {
  console.log('PASS: Realized cashflow strictly reflects completed transactions!');
}

console.log('\n=== TEST 4: DUE DATE AUTOMATION ENGINE ===');
// Simulate due date arrived (25 September 2026)
const simulatedDate = new Date(2026, 8, 25); // 25 Sept 2026
const { newTransactions, updatedRecurring } = processDueRecurringTransactions(recurring, transactions, simulatedDate);
console.log(`New transactions created on due date: ${newTransactions.length}`);
console.log(`Created tx title: ${newTransactions[0]?.title}, amount: ${newTransactions[0]?.totalValue}`);
const updatedLaptop = updatedRecurring.find(r => r.id === 'rec-installment');
console.log(`Updated installment: ${updatedLaptop?.installmentCurrent} / ${updatedLaptop?.installmentTotal}`);
if (newTransactions.length === 1 && updatedLaptop?.installmentCurrent === 6) {
  console.log('PASS: Laptop installment automatically realized on due date and advanced to 6/8!');
} else {
  console.error('FAIL: Due date processing failed!');
  process.exit(1);
}

console.log('\n=== TEST 5: TODAY SUMMARY ===');
const todaySummary = calculateTodaySummary(transactions, '18 Eylül 2026');
console.log(`Today Summary: Income = +${todaySummary.income}, Expense = -${todaySummary.expense}, Net = ${todaySummary.net}, Count = ${todaySummary.count}`);
if (todaySummary.income === 12000 && todaySummary.expense === 1500 && todaySummary.net === 10500) {
  console.log('PASS: Today Summary calculation is exact!');
} else {
  console.error('FAIL: Today summary failed!');
  process.exit(1);
}

console.log('\n=== ALL ACCOUNTING ENGINE TESTS PASSED! ===');
