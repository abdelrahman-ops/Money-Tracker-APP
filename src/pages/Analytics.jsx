import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import { useAppStore } from '../store/appStore';
import { useTransactionStore } from '../store/transactionStore';
import { useCategoryStore } from '../store/categoryStore';
import { useWalletStore } from '../store/walletStore';
import { fetchBudgets, saveBudget } from '../services/apiServices';
import { calculateBurnRate, getMonthOverMonthComparison, getCategoryTrends, getWalletAnalysis } from '../services/insightsEngine';
import {
  ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Flame, Target,
  ArrowUpRight, ArrowDownLeft, BarChart3, PieChart, CreditCard,
  Calendar, DollarSign, X, Activity
} from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import LucideIcon from '../components/LucideIcon';
import MonthYearPicker from '../components/MonthYearPicker';

const CHART_COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#f97316','#14b8a6','#6366f1'];

export default function Analytics() {
  const navigate = useNavigate();
  const balanceVisible = useAppStore(s => s.balanceVisible);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [editBudgetCategory, setEditBudgetCategory] = useState(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [burnRate, setBurnRate] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [trends, setTrends] = useState([]);
  const [walletAnalysis, setWalletAnalysis] = useState(null);
  const [budgets, setBudgets] = useState([]);

  const month = currentMonth.getMonth(), year = currentMonth.getFullYear();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const accounts = useWalletStore(s => s.wallets);
  const categories = useCategoryStore(s => s.categories);
  const allTransactions = useTransactionStore(s => s.transactions);

  const startDate = new Date(year, month, 1).toISOString();
  const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
  const monthTransactions = useMemo(() => allTransactions.filter(t => t.date >= startDate && t.date <= endDate), [allTransactions, startDate, endDate]);

  useEffect(() => {
    calculateBurnRate(monthKey).then(setBurnRate);
    getMonthOverMonthComparison().then(setComparison);
    getCategoryTrends(6).then(setTrends);
    fetchBudgets(monthKey).then(b => setBudgets(b || [])).catch(() => {});
  }, [monthKey]);

  useEffect(() => { if (selectedWallet) getWalletAnalysis(selectedWallet).then(setWalletAnalysis); }, [selectedWallet]);

  const totalIncome = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netFlow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;

  const categoryBreakdown = useMemo(() => {
    const map = {};
    monthTransactions.filter(t => t.type === 'expense' && t.categoryId).forEach(t => {
      const cat = categories.find(c => c._id === t.categoryId);
      if (cat) { if (!map[cat._id]) map[cat._id] = { ...cat, total: 0, count: 0 }; map[cat._id].total += t.amount; map[cat._id].count += 1; }
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [monthTransactions, categories]);

  const dailySpending = useMemo(() => {
    const data = {}; const dim = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= dim; d++) data[d] = 0;
    monthTransactions.filter(t => t.type === 'expense').forEach(t => { const day = new Date(t.date).getDate(); data[day] = (data[day] || 0) + t.amount; });
    return Object.entries(data).map(([day, amount]) => ({ day: parseInt(day), amount }));
  }, [monthTransactions, year, month]);
  const maxDailySpend = Math.max(...dailySpending.map(d => d.amount), 1);

  const budgetMap = {}; budgets.forEach(b => { budgetMap[b.categoryId] = b; });
  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const budgetUsed = totalBudget > 0 ? (totalExpense / totalBudget * 100) : 0;
  const pieData = categoryBreakdown.slice(0, 8).map((cat, i) => ({ name: cat.name, value: cat.total, color: CHART_COLORS[i % CHART_COLORS.length] }));

  const handleSaveBudget = async (categoryId) => {
    const limit = parseFloat(budgetInput);
    if (!limit || limit <= 0) return;
    await saveBudget({ categoryId, monthKey, limit });
    const fresh = await fetchBudgets(monthKey);
    setBudgets(fresh || []);
    setEditBudgetCategory(null); setBudgetInput('');
  };

  const fmtVal = v => balanceVisible ? formatCurrency(v) : '••••';
  const TABS = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'budgets', label: 'Budgets', icon: Target },
    { key: 'categories', label: 'Categories', icon: PieChart },
    { key: 'wallets', label: 'Cards', icon: CreditCard },
    { key: 'trends', label: 'Trends', icon: Activity },
  ];

  return (
    <div className="px-4 pt-5 pb-28">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={prevMonth} className="w-9 h-9 rounded-full bg-[var(--color-surface)] flex items-center justify-center haptic active:scale-90 transition-transform"><ChevronLeft className="w-5 h-5" /></button>
        <MonthYearPicker currentMonth={month} currentYear={year} onChange={(m, y) => setCurrentMonth(new Date(y, m, 1))} />
        <button onClick={nextMonth} className="w-9 h-9 rounded-full bg-[var(--color-surface)] flex items-center justify-center haptic active:scale-90 transition-transform"><ChevronRight className="w-5 h-5" /></button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="ios-card p-3.5 text-center"><div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-1.5"><ArrowDownLeft className="w-4 h-4 text-green-500" /></div><p className="text-[11px] text-[var(--color-muted)]">Income</p><p className="text-[15px] font-bold text-[var(--color-success)]">{fmtVal(totalIncome)}</p></div>
        <div className="ios-card p-3.5 text-center"><div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-1.5"><ArrowUpRight className="w-4 h-4 text-red-500" /></div><p className="text-[11px] text-[var(--color-muted)]">Expenses</p><p className="text-[15px] font-bold text-[var(--color-danger)]">{fmtVal(totalExpense)}</p></div>
        <div className="ios-card p-3.5 text-center"><div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-1.5" style={{ backgroundColor: netFlow >= 0 ? '#22c55e18' : '#ef444418' }}>{netFlow >= 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}</div><p className="text-[11px] text-[var(--color-muted)]">Net Flow</p><p className={'text-[15px] font-bold ' + (netFlow >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]')}>{fmtVal(netFlow)}</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={'flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[13px] font-semibold shrink-0 transition-all ' + (activeTab === tab.key ? 'gradient-primary text-white' : 'ios-card text-[var(--color-muted)]')}><tab.icon className="w-3.5 h-3.5" />{tab.label}</button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (<>
        {burnRate && burnRate.dailyBurnRate > 0 && (
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="ios-card p-3.5"><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center"><Flame className="w-4 h-4 text-orange-500" /></div><p className="text-[11px] text-[var(--color-muted)] font-medium">Burn Rate</p></div><p className="text-[18px] font-bold text-orange-500">{fmtVal(burnRate.dailyBurnRate)}<span className="text-[11px] font-normal text-[var(--color-muted)]">/day</span></p><p className="text-[11px] text-[var(--color-muted)] mt-0.5">{burnRate.daysRemaining} days left</p></motion.div>
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.05}} className="ios-card p-3.5"><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center"><Target className="w-4 h-4 text-violet-500" /></div><p className="text-[11px] text-[var(--color-muted)] font-medium">Projected</p></div><p className="text-[18px] font-bold text-violet-500">{fmtVal(burnRate.projectedMonthTotal)}</p><p className="text-[11px] text-[var(--color-muted)] mt-0.5">This month total</p></motion.div>
            {comparison && comparison.lastMonth.totalExpense > 0 && (
              <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="ios-card p-3.5"><div className="flex items-center gap-2 mb-2"><div className={'w-8 h-8 rounded-xl flex items-center justify-center ' + (comparison.direction === 'up' ? 'bg-red-500/10' : 'bg-green-500/10')}>{comparison.direction === 'up' ? <TrendingUp className="w-4 h-4 text-red-500" /> : <TrendingDown className="w-4 h-4 text-green-500" />}</div><p className="text-[11px] text-[var(--color-muted)] font-medium">vs Last Month</p></div><p className={'text-[18px] font-bold ' + (comparison.direction === 'up' ? 'text-red-500' : 'text-green-500')}>{comparison.direction === 'up' ? '+' : '-'}{Math.abs(comparison.changePercent)}%</p><p className="text-[11px] text-[var(--color-muted)] mt-0.5">{comparison.direction === 'up' ? 'Spending ↑' : 'Spending ↓'}</p></motion.div>
            )}
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.15}} className="ios-card p-3.5"><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{backgroundColor:savingsRate>=0?'#22c55e18':'#ef444418'}}><DollarSign className="w-4 h-4" style={{color:savingsRate>=0?'#22c55e':'#ef4444'}} /></div><p className="text-[11px] text-[var(--color-muted)] font-medium">Savings Rate</p></div><p className={'text-[18px] font-bold '+(savingsRate>=0?'text-green-500':'text-red-500')}>{savingsRate.toFixed(0)}%</p><p className="text-[11px] text-[var(--color-muted)] mt-0.5">Of income saved</p></motion.div>
          </div>
        )}
        {/* Daily Heatmap */}
        <div className="ios-card p-4 mb-5">
          <h3 className="text-[15px] font-bold mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-[var(--color-primary)]" />Daily Spending</h3>
          <div className="grid grid-cols-7 gap-1">
            {['S','M','T','W','T','F','S'].map((d,i) => <div key={i} className="text-[9px] text-[var(--color-muted)] text-center font-medium pb-1">{d}</div>)}
            {Array.from({length:new Date(year,month,1).getDay()},(_,i) => <div key={`pad-${i}`} />)}
            {dailySpending.map(({day,amount}) => { const int = amount > 0 ? Math.max(0.15,amount/maxDailySpend) : 0; const today = new Date(); const isToday = day===today.getDate()&&month===today.getMonth()&&year===today.getFullYear();
              return <div key={day} className={'w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-medium transition-colors '+(isToday?'ring-1.5 ring-[var(--color-primary)]':'')} style={{backgroundColor:amount>0?`rgba(239,68,68,${int})`:'var(--color-surface)',color:int>0.5?'white':'var(--color-muted)'}} title={`Day ${day}: ${formatCurrency(amount)}`}>{day}</div>;
            })}
          </div>
          <div className="flex items-center justify-between mt-3 px-1"><span className="text-[10px] text-[var(--color-muted)]">Less</span><div className="flex gap-1">{[0,0.2,0.4,0.6,0.8,1].map(v => <div key={v} className="w-3 h-3 rounded" style={{backgroundColor:`rgba(239,68,68,${v||0.05})`}} />)}</div><span className="text-[10px] text-[var(--color-muted)]">More</span></div>
        </div>
        {/* Top Spending */}
        <div className="ios-card p-4 mb-5">
          <h3 className="text-[15px] font-bold mb-3">Top Spending Categories</h3>
          {categoryBreakdown.length === 0 ? <p className="text-[13px] text-[var(--color-muted)] text-center py-4">No expenses this month</p> : categoryBreakdown.slice(0,5).map((cat,i) => {
            const pct = totalExpense > 0 ? (cat.total/totalExpense*100) : 0;
            return <motion.div key={cat._id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.03}} className="flex items-center gap-3 py-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{backgroundColor:(cat.color||CHART_COLORS[i])+'18'}}><LucideIcon name={cat.icon} className="w-4 h-4" style={{color:cat.color||CHART_COLORS[i]}} /></div>
              <div className="flex-1 min-w-0"><div className="flex items-center justify-between mb-1"><span className="text-[13px] font-semibold truncate">{cat.name}</span><span className="text-[13px] font-bold text-[var(--color-danger)] shrink-0 ml-2">{fmtVal(cat.total)}</span></div><div className="h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden"><motion.div initial={{width:0}} animate={{width:pct+'%'}} className="h-full rounded-full" style={{backgroundColor:cat.color||CHART_COLORS[i]}} /></div></div>
              <span className="text-[11px] text-[var(--color-muted)] w-10 text-right shrink-0">{pct.toFixed(0)}%</span>
            </motion.div>;
          })}
        </div>
      </>)}

      {/* BUDGETS TAB */}
      {activeTab === 'budgets' && (<>
        {totalBudget > 0 && (
          <div className="ios-card p-4 mb-4">
            <div className="flex items-center justify-between mb-3"><div><p className="text-[11px] text-[var(--color-muted)] font-medium uppercase tracking-wider">Monthly Budget</p><p className="text-[22px] font-bold">{fmtVal(totalBudget)}</p></div><div className="text-right"><p className={'text-[18px] font-bold '+(budgetUsed>100?'text-[var(--color-danger)]':'text-[var(--color-success)]')}>{budgetUsed.toFixed(0)}%</p><p className="text-[11px] text-[var(--color-muted)]">used</p></div></div>
            <div className="h-3 bg-[var(--color-surface)] rounded-full overflow-hidden"><motion.div initial={{width:0}} animate={{width:Math.min(budgetUsed,100)+'%'}} transition={{duration:0.6}} className="h-full rounded-full" style={{backgroundColor:budgetUsed>100?'var(--color-danger)':budgetUsed>70?'#f59e0b':'var(--color-success)'}} /></div>
            <div className="flex justify-between text-[12px] mt-2"><span className="text-[var(--color-muted)]">Spent: <strong className="text-[var(--color-danger)]">{fmtVal(totalExpense)}</strong></span><span className="text-[var(--color-muted)]">Left: <strong className="text-[var(--color-success)]">{fmtVal(Math.max(0,totalBudget-totalExpense))}</strong></span></div>
          </div>
        )}
        <div className="ios-card p-4 mb-5">
          <h3 className="text-[15px] font-bold mb-4">Category Limits</h3>
          {categories.length === 0 ? <p className="text-[13px] text-[var(--color-muted)] text-center py-4">No categories available</p> : (
            <div className="space-y-0.5">
              {categories.map(cat => {
                const b = budgetMap[cat._id]; const isEditing = editBudgetCategory === cat._id;
                const catSpent = categoryBreakdown.find(c => c._id === cat._id)?.total || 0;
                const catPct = b ? Math.min((catSpent/b.limit)*100,100) : 0;
                return (
                  <div key={cat._id} className="py-3 border-b border-[var(--color-border)]/50 last:border-0">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{backgroundColor:(cat.color||'#888')+'15'}}><LucideIcon name={cat.icon} className="w-4 h-4" style={{color:cat.color}} /></div><div><span className="text-[14px] font-semibold block">{cat.name}</span>{b && <span className="text-[11px] text-[var(--color-muted)]">{fmtVal(catSpent)} / {fmtVal(b.limit)}</span>}</div></div>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input autoFocus type="number" value={budgetInput} onChange={e=>setBudgetInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSaveBudget(cat._id)} className="w-20 bg-[var(--color-surface)] py-1.5 px-2.5 rounded-lg text-right text-[13px] font-semibold outline-none ring-1 ring-[var(--color-primary)]/50" placeholder="0" />
                          <button onClick={()=>handleSaveBudget(cat._id)} className="text-[12px] font-bold text-white bg-[var(--color-primary)] px-2.5 py-1.5 rounded-lg">✓</button>
                          <button onClick={()=>setEditBudgetCategory(null)} className="p-1 rounded-lg"><X className="w-3.5 h-3.5 text-[var(--color-muted)]" /></button>
                        </div>
                      ) : (
                        <button onClick={()=>{setEditBudgetCategory(cat._id);setBudgetInput(b?b.limit:'');}} className={`text-[12px] font-bold px-3 py-1.5 rounded-full active:scale-95 transition-transform ${b?'text-[var(--color-text)] bg-[var(--color-surface)]':'text-[var(--color-primary)] bg-[var(--color-primary)]/10'}`}>{b?fmtVal(b.limit):'Set limit'}</button>
                      )}
                    </div>
                    {b && <div className="h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden mt-2 ml-11"><motion.div initial={{width:0}} animate={{width:catPct+'%'}} className="h-full rounded-full" style={{backgroundColor:catPct>90?'var(--color-danger)':catPct>60?'#f59e0b':cat.color||'var(--color-primary)'}} /></div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>)}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (<>
        {pieData.length > 0 && (
          <div className="ios-card p-4 mb-5">
            <h3 className="text-[15px] font-bold mb-3">Expense Breakdown</h3>
            <div className="h-52"><ResponsiveContainer width="100%" height="100%"><RechartsPie><Pie data={pieData} cx="50%" cy="50%" innerRadius={58} outerRadius={85} paddingAngle={3} dataKey="value">{pieData.map((e,i)=><Cell key={i} fill={e.color} stroke="none" />)}</Pie><Tooltip formatter={v=>formatCurrency(v)} contentStyle={{backgroundColor:'var(--color-card)',border:'1px solid var(--color-border)',borderRadius:'12px',fontSize:'12px'}} /></RechartsPie></ResponsiveContainer></div>
            <div className="flex flex-wrap gap-2 mt-3 justify-center">{pieData.map((item,i) => <div key={i} className="flex items-center gap-1.5 text-[11px]"><div className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor:item.color}} /><span className="text-[var(--color-muted)]">{item.name}</span></div>)}</div>
          </div>
        )}
        <div className="space-y-2">
          {categoryBreakdown.map((cat,i) => {
            const budget = budgetMap[cat._id]; const budgetPct = budget ? Math.min((cat.total/budget.limit)*100,100) : 0;
            const isEditing = editBudgetCategory === cat._id;
            return (
              <motion.div key={cat._id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}} className="ios-card p-4">
                <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{backgroundColor:(cat.color||CHART_COLORS[i])+'18'}}><LucideIcon name={cat.icon} className="w-5 h-5" style={{color:cat.color||CHART_COLORS[i]}} /></div><div className="flex-1 min-w-0"><p className="text-[14px] font-semibold">{cat.name}</p><p className="text-[12px] text-[var(--color-muted)]">{cat.count} transactions</p></div><div className="text-right"><p className="text-[15px] font-bold text-[var(--color-danger)]">{fmtVal(cat.total)}</p>{budget && <p className="text-[11px] text-[var(--color-muted)]">of {fmtVal(budget.limit)}</p>}</div></div>
                {budget && <div className="h-2 bg-[var(--color-surface)] rounded-full overflow-hidden mb-2"><motion.div initial={{width:0}} animate={{width:budgetPct+'%'}} className="h-full rounded-full" style={{backgroundColor:budgetPct>100?'var(--color-danger)':budgetPct>70?'#f59e0b':'var(--color-success)'}} /></div>}
                {isEditing ? (
                  <div className="flex gap-2 mt-2"><input type="number" value={budgetInput} onChange={e=>setBudgetInput(e.target.value)} placeholder="Budget limit" autoFocus className="flex-1 px-3 py-2 rounded-xl bg-[var(--color-surface)] text-[13px] focus:outline-none" /><button onClick={()=>handleSaveBudget(cat._id)} className="px-3 py-2 rounded-xl gradient-primary text-white text-[12px] font-semibold">Save</button><button onClick={()=>setEditBudgetCategory(null)} className="px-3 py-2 rounded-xl bg-[var(--color-surface)] text-[12px] font-semibold">Cancel</button></div>
                ) : (
                  <button onClick={()=>{setEditBudgetCategory(cat._id);setBudgetInput(budget?String(budget.limit):'');}} className="text-[12px] text-[var(--color-primary)] font-semibold mt-1">{budget?'Edit Budget':'+ Set Budget'}</button>
                )}
              </motion.div>
            );
          })}
        </div>
        {categoryBreakdown.length === 0 && <div className="ios-card text-center py-12"><PieChart className="w-12 h-12 text-[var(--color-muted)] mx-auto mb-3" /><p className="text-[15px] font-semibold mb-1">No expenses</p><p className="text-[13px] text-[var(--color-muted)]">Add some transactions to see the breakdown</p></div>}
      </>)}

      {/* WALLETS TAB */}
      {activeTab === 'wallets' && (<>
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
          {accounts.map(acc => <button key={acc._id} onClick={()=>setSelectedWallet(acc._id)} className={'shrink-0 px-4 py-2.5 rounded-2xl text-[13px] font-semibold transition-all '+(selectedWallet===acc._id?'gradient-primary text-white':'ios-card text-[var(--color-muted)]')}>{acc.name}</button>)}
        </div>
        {!selectedWallet && <div className="ios-card text-center py-12"><CreditCard className="w-12 h-12 text-[var(--color-muted)] mx-auto mb-3" /><p className="text-[15px] font-semibold mb-1">Select a Wallet</p><p className="text-[13px] text-[var(--color-muted)]">Tap a wallet above to see its analysis</p></div>}
        {walletAnalysis && selectedWallet && (<>
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="ios-card p-4 mb-4">
            <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{backgroundColor:(walletAnalysis.account.color||'#3b82f6')+'18'}}><LucideIcon name={walletAnalysis.account.icon||'wallet'} className="w-6 h-6" style={{color:walletAnalysis.account.color||'#3b82f6'}} /></div><div><p className="text-[18px] font-bold">{walletAnalysis.account.name}</p><p className="text-[13px] text-[var(--color-muted)]">{walletAnalysis.transactionCount} transactions</p></div></div>
            <div className="grid grid-cols-3 gap-3"><div className="bg-[var(--color-surface)] rounded-2xl p-3 text-center"><p className="text-[10px] text-[var(--color-muted)]">Income</p><p className="text-[14px] font-bold text-[var(--color-success)]">{fmtVal(walletAnalysis.totalIncome)}</p></div><div className="bg-[var(--color-surface)] rounded-2xl p-3 text-center"><p className="text-[10px] text-[var(--color-muted)]">Expense</p><p className="text-[14px] font-bold text-[var(--color-danger)]">{fmtVal(walletAnalysis.totalExpense)}</p></div><div className="bg-[var(--color-surface)] rounded-2xl p-3 text-center"><p className="text-[10px] text-[var(--color-muted)]">Avg Txn</p><p className="text-[14px] font-bold">{fmtVal(walletAnalysis.avgTransaction)}</p></div></div>
          </motion.div>
          {walletAnalysis.monthlyData.length > 0 && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.05}} className="ios-card p-4 mb-4">
              <h3 className="text-[15px] font-bold mb-3">Monthly Trend</h3>
              <div className="h-44"><ResponsiveContainer width="100%" height="100%"><BarChart data={walletAnalysis.monthlyData} barGap={4}><CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fontSize:10,fill:'var(--color-muted)'}} /><YAxis tickLine={false} axisLine={false} tick={{fontSize:10,fill:'var(--color-muted)'}} width={40} /><Tooltip formatter={v=>formatCurrency(v)} contentStyle={{backgroundColor:'var(--color-card)',border:'1px solid var(--color-border)',borderRadius:'12px',fontSize:'11px'}} /><Bar dataKey="income" fill="#22c55e" radius={[4,4,0,0]} name="Income" /><Bar dataKey="expense" fill="#ef4444" radius={[4,4,0,0]} name="Expense" /></BarChart></ResponsiveContainer></div>
            </motion.div>
          )}
          {walletAnalysis.topCategories.length > 0 && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="ios-card p-4 mb-4">
              <h3 className="text-[15px] font-bold mb-3">Top Categories</h3>
              {walletAnalysis.topCategories.map((cat,i) => { const pct = walletAnalysis.totalExpense > 0 ? (cat.total/walletAnalysis.totalExpense*100) : 0;
                return <div key={cat._id} className="flex items-center gap-3 py-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor:(cat.color||CHART_COLORS[i])+'18'}}><LucideIcon name={cat.icon} className="w-4 h-4" style={{color:cat.color||CHART_COLORS[i]}} /></div><div className="flex-1 min-w-0"><div className="flex justify-between text-[13px] mb-1"><span className="font-semibold truncate">{cat.name}</span><span className="font-bold text-[var(--color-muted)] shrink-0 ml-2">{pct.toFixed(0)}%</span></div><div className="h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:pct+'%',backgroundColor:cat.color||CHART_COLORS[i]}} /></div></div><span className="text-[12px] font-bold text-[var(--color-danger)] shrink-0 w-16 text-right">{fmtVal(cat.total)}</span></div>;
              })}
            </motion.div>
          )}
        </>)}
      </>)}

      {/* TRENDS TAB */}
      {activeTab === 'trends' && (<>
        {trends.length > 0 && (<>
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="ios-card p-4 mb-5">
            <h3 className="text-[15px] font-bold mb-3">6-Month Trend</h3>
            <div className="h-48"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trends}><defs><linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient><linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} /><XAxis dataKey="monthLabel" tickLine={false} axisLine={false} tick={{fontSize:10,fill:'var(--color-muted)'}} /><YAxis tickLine={false} axisLine={false} tick={{fontSize:10,fill:'var(--color-muted)'}} width={35} /><Tooltip formatter={v=>formatCurrency(v)} contentStyle={{backgroundColor:'var(--color-card)',border:'1px solid var(--color-border)',borderRadius:'12px',fontSize:'11px'}} /><Area type="monotone" dataKey="totalIncome" stroke="#22c55e" fill="url(#incomeGrad)" strokeWidth={2} name="Income" /><Area type="monotone" dataKey="totalExpense" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} name="Expense" /></AreaChart></ResponsiveContainer></div>
          </motion.div>
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.05}} className="ios-card p-4 mb-5">
            <h3 className="text-[15px] font-bold mb-3">Net Flow History</h3>
            <div className="h-40"><ResponsiveContainer width="100%" height="100%"><BarChart data={trends}><CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} /><XAxis dataKey="monthLabel" tickLine={false} axisLine={false} tick={{fontSize:10,fill:'var(--color-muted)'}} /><YAxis tickLine={false} axisLine={false} tick={{fontSize:10,fill:'var(--color-muted)'}} width={35} /><Tooltip formatter={v=>formatCurrency(v)} contentStyle={{backgroundColor:'var(--color-card)',border:'1px solid var(--color-border)',borderRadius:'12px',fontSize:'11px'}} /><Bar dataKey="netFlow" radius={[4,4,0,0]} name="Net Flow">{trends.map((e,i)=><Cell key={i} fill={e.netFlow>=0?'#22c55e':'#ef4444'} />)}</Bar></BarChart></ResponsiveContainer></div>
          </motion.div>
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="ios-card p-4 mb-5">
            <h3 className="text-[15px] font-bold mb-3">Monthly Summary</h3>
            <div className="space-y-2">{[...trends].reverse().map(m => <div key={m.monthKey} className="flex items-center justify-between py-2 border-b border-[var(--color-border)]/30 last:border-none"><span className="text-[13px] font-medium w-12">{m.monthLabel}</span><span className="text-[12px] text-[var(--color-success)]">+{fmtVal(m.totalIncome)}</span><span className="text-[12px] text-[var(--color-danger)]">-{fmtVal(m.totalExpense)}</span><span className={'text-[12px] font-bold '+(m.netFlow>=0?'text-[var(--color-success)]':'text-[var(--color-danger)]')}>{m.netFlow>=0?'+':''}{fmtVal(m.netFlow)}</span><span className="text-[11px] text-[var(--color-muted)]">{m.transactionCount} txns</span></div>)}</div>
          </motion.div>
        </>)}
        {trends.length === 0 && <div className="ios-card text-center py-12"><Activity className="w-12 h-12 text-[var(--color-muted)] mx-auto mb-3" /><p className="text-[15px] font-semibold mb-1">No trend data</p><p className="text-[13px] text-[var(--color-muted)]">Add transactions over several months to see trends</p></div>}
      </>)}
    </div>
  );
}
