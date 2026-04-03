import { useTransactionStore } from '../store/transactionStore';
import { useCategoryStore } from '../store/categoryStore';
import { useWalletStore } from '../store/walletStore';

const getTxns = () => useTransactionStore.getState().transactions || [];
const getCats = () => useCategoryStore.getState().categories || [];
const getAccs = () => useWalletStore.getState().wallets || [];

export async function calculateBurnRate(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  const mo = m - 1;
  const s = new Date(y, mo, 1).toISOString();
  const e = new Date(y, mo + 1, 0, 23, 59, 59).toISOString();
  const exps = getTxns().filter(t => t.type === 'expense' && t.date >= s && t.date <= e);
  const tot = exps.reduce((a, t) => a + t.amount, 0);
  const now = new Date(), dim = new Date(y, mo + 1, 0).getDate();
  let dp = (now.getFullYear() === y && now.getMonth() === mo) ? now.getDate() : (new Date(y, mo + 1, 0) < now ? dim : 1);
  const dr = dp > 0 ? tot / dp : 0;
  return { dailyBurnRate: Math.round(dr * 100) / 100, totalExpense: tot, daysPassed: dp, daysRemaining: Math.max(0, dim - dp), daysInMonth: dim, projectedMonthTotal: Math.round(dr * dim * 100) / 100 };
}

export async function predictRemainingDays(accountId) {
  const accs = getAccs();
  const acc = accountId ? accs.find(a => a._id === accountId) : null;
  const bal = acc ? acc.balance : accs.reduce((s, a) => s + a.balance, 0);
  const ago = new Date(Date.now() - 30 * 86400000).toISOString();
  const now = new Date().toISOString();
  const spent = getTxns().filter(t => t.type === 'expense' && t.date >= ago && t.date <= now).reduce((s, t) => s + t.amount, 0);
  const avg = spent / 30, rd = avg > 0 ? Math.floor(bal / avg) : Infinity;
  return { balance: bal, avgDailySpend: Math.round(avg * 100) / 100, remainingDays: rd === Infinity ? 999 : rd, isInfinite: avg === 0 };
}

export async function getCategoryTrends(months = 6) {
  const now = new Date(), trends = [], txns = getTxns();
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const s = d.toISOString(), e = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();
    const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const ml = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d);
    const mt = txns.filter(t => t.date >= s && t.date <= e);
    const ex = mt.filter(t => t.type === 'expense'), inc = mt.filter(t => t.type === 'income');
    const ct = {}; ex.forEach(t => { if (t.categoryId) ct[t.categoryId] = (ct[t.categoryId] || 0) + t.amount; });
    const ti = inc.reduce((a, t) => a + t.amount, 0), te = ex.reduce((a, t) => a + t.amount, 0);
    trends.push({ monthKey: mk, monthLabel: ml, totalExpense: te, totalIncome: ti, netFlow: ti - te, categoryBreakdown: ct, transactionCount: ex.length });
  }
  return trends.reverse();
}

export async function getMonthOverMonthComparison() {
  const now = new Date();
  const tm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lm = now.getMonth() === 0 ? `${now.getFullYear() - 1}-12` : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;
  const td = await calculateBurnRate(tm), ld = await calculateBurnRate(lm);
  const ch = ld.totalExpense > 0 ? ((td.totalExpense - ld.totalExpense) / ld.totalExpense) * 100 : 0;
  return { thisMonth: td, lastMonth: ld, changePercent: Math.round(ch * 10) / 10, direction: ch > 0 ? 'up' : ch < 0 ? 'down' : 'same' };
}

export async function getWalletAnalysis(accountId) {
  const accs = getAccs(), acc = accs.find(a => a._id === accountId);
  if (!acc) return null;
  const txns = getTxns().filter(t => t.accountId === accountId);
  const cats = getCats(), cm = {}; cats.forEach(c => { cm[c._id] = c; });
  const ct = {}; let ti = 0, te = 0;
  txns.forEach(t => {
    if (t.type === 'income') ti += t.amount;
    else if (t.type === 'expense') { te += t.amount; if (t.categoryId && cm[t.categoryId]) { const c = cm[t.categoryId]; if (!ct[c._id]) ct[c._id] = { ...c, total: 0, count: 0 }; ct[c._id].total += t.amount; ct[c._id].count += 1; } }
  });
  const now = new Date(), md = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const s = d.toISOString(), e = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();
    const l = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d);
    const mt = txns.filter(t => t.date >= s && t.date <= e);
    md.push({ month: l, income: mt.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0), expense: mt.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0) });
  }
  const avg = txns.length > 0 ? txns.reduce((a, t) => a + t.amount, 0) / txns.length : 0;
  return { account: acc, totalIncome: ti, totalExpense: te, netFlow: ti - te, transactionCount: txns.length, avgTransaction: Math.round(avg * 100) / 100, topCategories: Object.values(ct).sort((a, b) => b.total - a.total).slice(0, 5), monthlyData: md };
}

export async function getTopInsights() {
  const ins = [], now = new Date(), mk = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  try {
    const br = await calculateBurnRate(mk);
    if (br.dailyBurnRate > 0) ins.push({ icon: 'flame', title: 'Daily Burn Rate', value: br.dailyBurnRate, type: 'currency', subtitle: `${br.daysRemaining} days left`, color: '#f97316' });
    const pr = await predictRemainingDays();
    if (!pr.isInfinite && pr.remainingDays < 60) ins.push({ icon: 'clock', title: 'Money Lasts', value: pr.remainingDays, type: 'days', subtitle: `At ${pr.avgDailySpend.toFixed(0)}/day`, color: pr.remainingDays < 14 ? '#ef4444' : pr.remainingDays < 30 ? '#f59e0b' : '#22c55e' });
    const comp = await getMonthOverMonthComparison();
    if (comp.lastMonth.totalExpense > 0) ins.push({ icon: comp.direction === 'up' ? 'trending-up' : 'trending-down', title: 'vs Last Month', value: Math.abs(comp.changePercent), type: 'percent', subtitle: comp.direction === 'up' ? 'Spending ↑' : 'Spending ↓', color: comp.direction === 'up' ? '#ef4444' : '#22c55e' });
    if (br.projectedMonthTotal > 0) ins.push({ icon: 'target', title: 'Projected Total', value: br.projectedMonthTotal, type: 'currency', subtitle: `Based on ${br.daysPassed} days`, color: '#8b5cf6' });
  } catch (e) { console.error('Insights error:', e); }
  return ins;
}
