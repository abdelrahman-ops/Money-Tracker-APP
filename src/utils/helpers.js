import { useAppStore } from '../store/appStore';
import { useWalletStore } from '../store/walletStore';
import { useTransactionStore } from '../store/transactionStore';
import { useCategoryStore } from '../store/categoryStore';

export function formatCurrency(amount) {
  const currency = useAppStore.getState().currency || 'EGP';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateShort(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatMonthYear(dateStr) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatTime(dateStr) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function getNetWorth() {
  const accounts = useWalletStore.getState().wallets || [];
  return accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
}

export function getMonthlyStats(year, month) {
  const startDate = new Date(year, month, 1).toISOString();
  const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
  const transactions = (useTransactionStore.getState().transactions || []).filter(
    (t) => t.date >= startDate && t.date <= endDate
  );
  let income = 0, expense = 0;
  transactions.forEach((t) => {
    if (t.type === 'income') income += t.amount;
    else if (t.type === 'expense') expense += t.amount;
  });
  return { income, expense, balance: income - expense };
}

export function getCategoryBreakdown(year, month) {
  const startDate = new Date(year, month, 1).toISOString();
  const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
  const allTxns = useTransactionStore.getState().transactions || [];
  const transactions = allTxns.filter((t) => t.type === 'expense' && t.date >= startDate && t.date <= endDate);
  const categories = useCategoryStore.getState().categories || [];
  const catMap = {};
  categories.forEach((c) => { catMap[c._id] = c; });
  const breakdown = {};
  transactions.forEach((t) => {
    const cat = catMap[t.categoryId];
    if (cat) {
      if (!breakdown[cat._id]) breakdown[cat._id] = { ...cat, total: 0 };
      breakdown[cat._id].total += t.amount;
    }
  });
  return Object.values(breakdown).sort((a, b) => b.total - a.total);
}

export function groupTransactionsByDate(transactions) {
  const groups = {};
  transactions.forEach((t) => {
    const dateKey = new Date(t.date).toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = { date: t.date, transactions: [] };
    }
    groups[dateKey].transactions.push(t);
  });
  return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getDayTransactions(transactions, date) {
  const dayStr = new Date(date).toDateString();
  return transactions.filter((t) => new Date(t.date).toDateString() === dayStr);
}

export const ACCOUNT_COLORS = [
  '#007AFF', '#5856D6', '#34C759', '#FF9500', '#FF3B30',
  '#AF52DE', '#06b6d4', '#ec4899', '#64748b', '#f59e0b',
];
