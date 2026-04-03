import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import { useWalletStore } from '../store/walletStore';
import apiClient from '../api/client';
import { ArrowLeft, Plus, Target, PiggyBank, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { refreshAllData } from '../utils/refreshData';
import { motion, AnimatePresence } from 'framer-motion';
import LucideIcon from '../components/LucideIcon';

const GOAL_COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#ef4444'];
const GOAL_ICONS = ['target', 'home', 'car', 'plane', 'gift', 'heart', 'laptop', 'graduation-cap', 'piggy-bank', 'smartphone', 'briefcase', 'shield'];

export default function SavingsGoals() {
  const navigate = useNavigate();
  const accounts = useWalletStore((s) => s.wallets);
  const refreshWallets = useWalletStore((s) => s.fetchWallets);

  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showDeposit, setShowDeposit] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositAccountId, setDepositAccountId] = useState(null);
  const [isWithdrawal, setIsWithdrawal] = useState(false);

  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formColor, setFormColor] = useState(GOAL_COLORS[0]);
  const [formIcon, setFormIcon] = useState('target');
  const [formWalletId, setFormWalletId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    try {
      const { data } = await apiClient.get('/savings-goals');
      setGoals(data.data || []);
    } catch (e) {
      console.error('Failed to load goals:', e);
    }
  };

  const resetForm = () => {
    setFormName(''); setFormTarget(''); setFormDeadline('');
    setFormColor(GOAL_COLORS[0]); setFormIcon('target');
    setFormWalletId(null); setEditingGoal(null);
  };

  const openForm = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setFormName(goal.name); setFormTarget(String(goal.targetAmount));
      setFormDeadline(goal.deadline ? goal.deadline.slice(0, 10) : '');
      setFormColor(goal.color || GOAL_COLORS[0]); setFormIcon(goal.icon || 'target');
      setFormWalletId(goal.walletId || null);
    } else { resetForm(); }
    setShowForm(true);
  };

  const handleSaveGoal = async () => {
    const target = parseFloat(formTarget);
    if (!formName || !target || target <= 0) return;
    setSaving(true);
    try {
      const payload = { name: formName, targetAmount: target, deadline: formDeadline ? new Date(formDeadline).toISOString() : null, color: formColor, icon: formIcon, walletId: formWalletId };
      if (editingGoal) {
        await apiClient.put(`/savings-goals/${editingGoal._id}`, payload);
      } else {
        await apiClient.post('/savings-goals', { ...payload, currentAmount: 0, status: 'active' });
      }
      setShowForm(false); resetForm(); loadGoals();
    } finally { setSaving(false); }
  };

  const handleDeleteGoal = async (goal) => {
    if (window.confirm(`Delete "${goal.name}"?`)) {
      await apiClient.delete(`/savings-goals/${goal._id}`);
      loadGoals();
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0 || !showDeposit || !depositAccountId) return;
    setSaving(true);
    try {
      await apiClient.post(`/savings-goals/${showDeposit._id}/${isWithdrawal ? 'withdraw' : 'deposit'}`, { amount, accountId: depositAccountId });
      setShowDeposit(null); setDepositAmount(''); setIsWithdrawal(false);
      loadGoals(); refreshAllData();
    } finally { setSaving(false); }
  };

  const openDeposit = (goal, withdraw = false) => {
    setShowDeposit(goal); setIsWithdrawal(withdraw);
    setDepositAmount(''); setDepositAccountId(accounts[0]?._id || null);
  };

  const totalSaved = goals.reduce((s, g) => s + (g.currentAmount || 0), 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <div className="px-4 pt-5 pb-24">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="p-2 rounded-2xl min-w-touch min-h-touch haptic"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-[22px] font-bold flex-1">Savings Goals</h1>
        <button onClick={() => openForm()} className="w-10 h-10 rounded-2xl gradient-primary text-white flex items-center justify-center active:scale-90 transition-transform"><Plus className="w-5 h-5" /></button>
      </div>

      {goals.length > 0 && (
        <div className="ios-card p-4 mb-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-success)]/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-[var(--color-success)]" /></div>
            <div className="flex-1"><p className="text-[12px] text-[var(--color-muted)]">Total Saved</p><p className="text-[22px] font-bold text-[var(--color-success)]">{formatCurrency(totalSaved)}</p></div>
            <div className="text-right"><p className="text-[12px] text-[var(--color-muted)]">Target</p><p className="text-[15px] font-bold">{formatCurrency(totalTarget)}</p></div>
          </div>
          {totalTarget > 0 && (
            <div className="h-2.5 bg-[var(--color-surface)] rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: Math.min((totalSaved / totalTarget) * 100, 100) + '%' }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-[var(--color-success)]" />
            </div>
          )}
        </div>
      )}

      {goals.length === 0 ? (
        <div className="ios-card text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface)] flex items-center justify-center mx-auto mb-4"><Target className="w-8 h-8 text-[var(--color-muted)]" /></div>
          <p className="text-[16px] font-semibold mb-1">No savings goals yet</p>
          <p className="text-[13px] text-[var(--color-muted)] mb-5">Start saving toward your dreams</p>
          <button onClick={() => openForm()} className="px-6 py-3 rounded-2xl gradient-primary text-white font-bold text-[15px]">Create First Goal</button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal, idx) => {
            const pct = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
            const remaining = goal.targetAmount - goal.currentAmount;
            const isComplete = pct >= 100;
            return (
              <motion.div key={goal._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} className="ios-card p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: (goal.color || '#22c55e') + '18' }}>
                    <LucideIcon name={goal.icon || 'target'} className="w-5 h-5" style={{ color: goal.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><p className="text-[15px] font-semibold truncate">{goal.name}</p>{isComplete && <Check className="w-4 h-4 text-[var(--color-success)] shrink-0" />}</div>
                    <p className="text-[12px] text-[var(--color-muted)]">{formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openForm(goal)} className="p-2 rounded-xl active:bg-[var(--color-surface)] transition-colors"><Target className="w-4 h-4 text-[var(--color-muted)]" /></button>
                    <button onClick={() => handleDeleteGoal(goal)} className="p-2 rounded-xl active:bg-[var(--color-surface)] transition-colors"><Trash2 className="w-4 h-4 text-[var(--color-danger)]" /></button>
                  </div>
                </div>
                <div className="h-2.5 bg-[var(--color-surface)] rounded-full overflow-hidden mb-3">
                  <motion.div initial={{ width: 0 }} animate={{ width: pct + '%' }} transition={{ duration: 0.6 }} className="h-full rounded-full" style={{ backgroundColor: isComplete ? 'var(--color-success)' : (goal.color || '#22c55e') }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--color-muted)]">{pct.toFixed(0)}% • {remaining > 0 ? `${formatCurrency(remaining)} left` : 'Complete!'}</span>
                  <div className="flex gap-1.5">
                    {goal.currentAmount > 0 && (
                      <button onClick={() => openDeposit(goal, true)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--color-surface)] text-[12px] font-semibold text-[var(--color-muted)] active:scale-95 transition-transform"><Minus className="w-3 h-3" /> Withdraw</button>
                    )}
                    <button onClick={() => openDeposit(goal)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-white active:scale-95 transition-transform" style={{ backgroundColor: goal.color || '#22c55e' }}><Plus className="w-3 h-3" /> Deposit</button>
                  </div>
                </div>
                {goal.deadline && <p className="text-[11px] text-[var(--color-muted)] mt-2">Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Goal Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-end justify-center" onClick={() => setShowForm(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="bg-[var(--color-card)] rounded-t-3xl w-full max-w-lg pb-8 max-h-[80vh] overflow-y-auto">
              <div className="w-10 h-1 bg-[var(--color-border)] rounded-full mx-auto mt-3 mb-4" />
              <h3 className="text-lg font-bold text-center mb-5">{editingGoal ? 'Edit Goal' : 'New Savings Goal'}</h3>
              <div className="px-5 space-y-4">
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Goal name (e.g., New Car)" className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30" />
                <input type="number" value={formTarget} onChange={(e) => setFormTarget(e.target.value)} placeholder="Target amount" className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30" />
                <input type="date" value={formDeadline} onChange={(e) => setFormDeadline(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30" />
                <div><p className="text-[12px] text-[var(--color-muted)] mb-2 font-medium">Color</p><div className="flex gap-2 flex-wrap">{GOAL_COLORS.map((c) => (<button key={c} onClick={() => setFormColor(c)} className="w-9 h-9 rounded-xl transition-all" style={{ backgroundColor: c, boxShadow: formColor === c ? `0 0 0 3px ${c}44, 0 0 0 5px var(--color-bg)` : 'none', transform: formColor === c ? 'scale(1.1)' : 'scale(1)' }} />))}</div></div>
                <div><p className="text-[12px] text-[var(--color-muted)] mb-2 font-medium">Icon</p><div className="flex gap-2 flex-wrap">{GOAL_ICONS.map((icon) => (<button key={icon} onClick={() => setFormIcon(icon)} className={'w-10 h-10 rounded-xl flex items-center justify-center transition-all ' + (formIcon === icon ? 'bg-[var(--color-primary)]/10 ring-2 ring-[var(--color-primary)]' : 'bg-[var(--color-surface)]')}><LucideIcon name={icon} className="w-4 h-4" style={{ color: formIcon === icon ? formColor : 'var(--color-muted)' }} /></button>))}</div></div>
                <div>
                  <p className="text-[12px] text-[var(--color-muted)] mb-2 font-medium">Link to Wallet (optional)</p>
                  <select value={formWalletId || ''} onChange={(e) => setFormWalletId(e.target.value || null)} className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] text-[14px] focus:outline-none">
                    <option value="">No linked wallet</option>
                    {accounts.map((a) => (<option key={a._id} value={a._id}>{a.name}</option>))}
                  </select>
                </div>
                <button onClick={handleSaveGoal} disabled={saving || !formName || !formTarget} className="w-full py-3.5 rounded-2xl gradient-primary text-white font-bold text-[15px] disabled:opacity-50">{saving ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deposit/Withdraw Modal */}
      <AnimatePresence>
        {showDeposit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={() => setShowDeposit(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-[var(--color-card)] rounded-3xl p-6 w-full max-w-xs">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: (showDeposit.color || '#22c55e') + '18' }}>
                  <LucideIcon name={showDeposit.icon || 'target'} className="w-5 h-5" style={{ color: showDeposit.color }} />
                </div>
                <div><h3 className="text-lg font-bold">{isWithdrawal ? 'Withdraw' : 'Deposit'}</h3><p className="text-[12px] text-[var(--color-muted)]">{showDeposit.name}</p></div>
              </div>
              <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Amount" autoFocus className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] text-[17px] font-semibold text-center focus:outline-none mb-3" />
              <select value={depositAccountId || ''} onChange={(e) => setDepositAccountId(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] text-[14px] focus:outline-none mb-4">
                {accounts.map((a) => (<option key={a._id} value={a._id}>{a.name} ({formatCurrency(a.balance)})</option>))}
              </select>
              <div className="flex gap-2">
                <button onClick={() => setShowDeposit(null)} className="flex-1 py-3 rounded-2xl bg-[var(--color-surface)] font-semibold text-[14px]">Cancel</button>
                <button onClick={handleDeposit} disabled={saving || !depositAmount || parseFloat(depositAmount) <= 0} className="flex-1 py-3 rounded-2xl gradient-primary text-white font-semibold text-[14px] disabled:opacity-50">{saving ? '...' : isWithdrawal ? 'Withdraw' : 'Deposit'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
