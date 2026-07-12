import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import { useWalletStore } from '../store/walletStore';
import apiClient from '../api/client';
import { ArrowLeft, Plus, Target, PiggyBank, Edit2, Trash2, X, AlertCircle, ArrowUpRight, ArrowDownLeft, Calendar, Link2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { refreshAllData } from '../utils/refreshData';
import { motion, AnimatePresence } from 'framer-motion';
import LucideIcon from '../components/LucideIcon';

const GOAL_COLORS = ['#34c759', '#007aff', '#af52de', '#ff9500', '#ff2d55', '#5ac8fa', '#ffcc00', '#ff3b30'];
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
  const [expandedGoalId, setExpandedGoalId] = useState(null);

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
    if (!formName.trim() || !target || target <= 0) return;
    setSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        targetAmount: target,
        deadline: formDeadline ? new Date(formDeadline).toISOString() : null,
        color: formColor,
        icon: formIcon,
        walletId: formWalletId
      };
      if (editingGoal) {
        await apiClient.put(`/savings-goals/${editingGoal._id}`, payload);
      } else {
        await apiClient.post('/savings-goals', { ...payload, currentAmount: 0, status: 'active' });
      }
      setShowForm(false); resetForm(); loadGoals();
    } finally { setSaving(false); }
  };

  const handleDeleteGoal = async (goal) => {
    if (window.confirm(`Are you sure you want to delete "${goal.name}"?`)) {
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
    <div className="px-4 pt-5 pb-24 w-full max-w-md mx-auto bg-[var(--color-bg)] min-h-[100dvh]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-2xl min-w-touch min-h-touch flex items-center justify-center hover:bg-[var(--color-border)]/20 text-[var(--color-text)] transition-colors haptic"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[17px] font-black tracking-tight text-[var(--color-text)]">Savings Goals</h1>
        <button
          onClick={() => openForm()}
          className="w-10 h-10 rounded-2xl gradient-primary text-white flex items-center justify-center haptic shadow-md shadow-blue-500/20 active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Hero card showing Total Savings Progress */}
      {goals.length > 0 && (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-5 rounded-[28px] shadow-sm mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/[0.03] rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3.5 mb-4 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/10">
              <PiggyBank className="w-5 h-5 text-green-500" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-[var(--color-muted)] font-extrabold uppercase tracking-widest">Total Savings</p>
              <p className="text-[26px] font-black text-green-500 tracking-tight leading-none mt-1">
                {formatCurrency(totalSaved)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[var(--color-muted)] font-extrabold uppercase tracking-wide">Target</p>
              <p className="text-[14px] font-bold text-[var(--color-text)] mt-0.5">{formatCurrency(totalTarget)}</p>
            </div>
          </div>
          
          {totalTarget > 0 && (
            <div className="space-y-2">
              <div className="w-full h-2.5 bg-[var(--color-surface)] border border-[var(--color-border)]/35 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totalSaved / totalTarget) * 100, 100)}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full bg-green-500 shadow-inner"
                />
              </div>
              <p className="text-[10.5px] text-[var(--color-muted)] font-extrabold text-right">
                {Math.round((totalSaved / totalTarget) * 100)}% Achieved
              </p>
            </div>
          )}
        </div>
      )}

      {goals.length === 0 ? (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 text-center py-12 rounded-[28px] shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]/35 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-[var(--color-muted)]" />
          </div>
          <p className="text-[16px] font-bold mb-1 text-[var(--color-text)]">No goals configured</p>
          <p className="text-[13px] text-[var(--color-muted)] mb-5">Create a target goal to start mapping savings.</p>
          <button
            onClick={() => openForm()}
            className="px-6 py-3.5 rounded-2xl gradient-primary text-white font-extrabold text-[14px] haptic shadow-md shadow-blue-500/20"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, idx) => {
            const pct = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
            const remaining = goal.targetAmount - goal.currentAmount;
            const isComplete = pct >= 100;
            const goalColor = goal.color || '#34c759';
            const isExpanded = expandedGoalId === goal._id;
            
            return (
              <motion.div
                key={goal._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-5 rounded-[28px] shadow-sm relative overflow-hidden"
              >
                {/* Header elements inside card */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border"
                    style={{ backgroundColor: `${goalColor}12`, borderColor: `${goalColor}18` }}
                  >
                    <LucideIcon name={goal.icon || 'target'} className="w-5 h-5" style={{ color: goalColor }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[15.5px] font-bold truncate text-[var(--color-text)]">{goal.name}</p>
                      {isComplete && <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} />}
                    </div>
                    <p className="text-[12px] text-[var(--color-muted)] font-semibold mt-0.5">
                      {formatCurrency(goal.currentAmount)} saved of {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => setExpandedGoalId(isExpanded ? null : goal._id)}
                      className="p-2 rounded-xl text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-all haptic"
                      title="View contribution history"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openForm(goal)}
                      className="p-2 rounded-xl text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-all haptic"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal)}
                      className="p-2 rounded-xl text-[var(--color-danger)] hover:bg-red-500/10 transition-all haptic"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-2">
                  <div className="w-full h-2.5 bg-[var(--color-surface)] border border-[var(--color-border)]/35 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: goalColor }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11.5px] font-bold text-[var(--color-muted)]">
                    <span>{pct.toFixed(0)}% saved</span>
                    <span>{remaining > 0 ? `${formatCurrency(remaining)} left` : 'Goal Completed! 🌟'}</span>
                  </div>
                </div>

                {/* Info row (deadline + linking) */}
                {(goal.deadline || goal.walletId) && (
                  <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-[var(--color-border)]/30 text-[10px] font-bold text-[var(--color-muted)]">
                    {goal.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Due: {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                    )}
                    {goal.walletId && (
                      <span className="flex items-center gap-1">
                        <Link2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                        Linked Account
                      </span>
                    )}
                  </div>
                )}

                {/* Contribution timeline detail */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-[var(--color-border)]/30 space-y-2.5"
                  >
                    <p className="text-[10px] font-extrabold text-[var(--color-muted)] uppercase tracking-wider">Contribution History</p>
                    {goal.contributions && goal.contributions.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                        {goal.contributions.map((c, cIdx) => (
                          <div key={cIdx} className="flex justify-between items-center bg-[var(--color-surface)]/50 p-2.5 rounded-xl border border-[var(--color-border)]/15">
                            <div className="min-w-0">
                              <p className="text-[12.5px] font-bold text-[var(--color-text)] truncate">{c.note || (c.amount > 0 ? 'Savings Contribution' : 'Savings Withdrawal')}</p>
                              <p className="text-[10px] text-[var(--color-muted)] font-semibold mt-0.5">{new Date(c.date).toLocaleDateString()}</p>
                            </div>
                            <span className={`text-[12.5px] font-black shrink-0 ${c.amount >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                              {c.amount >= 0 ? '+' : ''}{formatCurrency(c.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-[var(--color-muted)] font-semibold italic">No manual contribution logs yet. Try deposit/withdrawal below.</p>
                    )}
                  </motion.div>
                )}

                {/* Deposit / Withdraw Action Buttons */}
                <div className="flex gap-2.5 mt-4">
                  {goal.currentAmount > 0 && (
                    <button
                      onClick={() => openDeposit(goal, true)}
                      className="flex-1 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]/45 text-[12.5px] font-bold text-[var(--color-text)] flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all haptic"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-[var(--color-danger)]" /> Withdraw
                    </button>
                  )}
                  <button
                    onClick={() => openDeposit(goal)}
                    className="flex-1 py-3 rounded-2xl text-[12.5px] font-bold text-white flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all haptic shadow-md"
                    style={{ backgroundColor: goalColor, boxShadow: `0 4px 12px ${goalColor}20` }}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-white" /> Deposit
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Goal Form Modal Overlay (Bottom sheet slider) */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center px-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-card)] rounded-t-[32px] border-t border-[var(--color-border)]/40 w-full max-w-md p-6 pb-8 max-h-[82vh] overflow-y-auto z-110 shadow-2xl flex flex-col"
            >
              <div className="w-12 h-1 bg-[var(--color-border)]/70 rounded-full mx-auto mb-5" />
              <h3 className="text-[17px] font-black text-center text-[var(--color-text)] mb-5">
                {editingGoal ? 'Update Savings Goal' : 'New Savings Goal'}
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Goal Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Vacation Trip, Emergency Fund"
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)]/45 text-base font-semibold rounded-2xl focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Target Amount</label>
                  <input
                    type="number"
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)]/45 text-base font-bold rounded-2xl focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Deadline Date (Optional)</label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)]/45 text-base font-bold rounded-2xl focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text)]"
                  />
                </div>

                {/* Color pickers */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Theme Color</label>
                  <div className="grid grid-cols-8 gap-2 bg-[var(--color-surface)] border border-[var(--color-border)]/35 p-3 rounded-2xl">
                    {GOAL_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setFormColor(c)}
                        className={`aspect-square rounded-lg border border-black/10 transition-all haptic ${
                          formColor === c ? 'scale-110 ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-surface)]' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Goal Icon</label>
                  <div className="grid grid-cols-6 gap-2 bg-[var(--color-surface)] border border-[var(--color-border)]/35 p-3 rounded-2xl max-h-36 overflow-y-auto">
                    {GOAL_ICONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setFormIcon(icon)}
                        className={`p-2.5 rounded-xl flex items-center justify-center transition-all haptic ${
                          formIcon === icon
                            ? 'bg-[var(--color-primary)] text-white shadow-md'
                            : 'hover:bg-[var(--color-card)] text-[var(--color-muted)]'
                        }`}
                      >
                        <LucideIcon name={icon} className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Linking selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Link to Wallet Account</label>
                  <select
                    value={formWalletId || ''}
                    onChange={(e) => setFormWalletId(e.target.value || null)}
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)]/45 text-[13.5px] font-bold rounded-2xl focus:outline-none text-[var(--color-text)]"
                  >
                    <option value="">No linked wallet</option>
                    {accounts.map((a) => (
                      <option key={a._id} value={a._id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSaveGoal}
                  disabled={saving || !formName.trim() || !formTarget}
                  className="w-full py-4 rounded-2xl gradient-primary text-white font-extrabold text-[15.5px] shadow-lg shadow-blue-500/25 haptic active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
                >
                  {saving ? 'Saving...' : editingGoal ? 'Update Goal Details' : 'Create Target Goal'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deposit/Withdraw Center Modal Dialog */}
      <AnimatePresence>
        {showDeposit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowDeposit(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-card)] border border-[var(--color-border)]/55 rounded-3xl p-5 w-full max-w-sm shadow-2xl flex flex-col"
            >
              <div className="flex items-center gap-3.5 mb-5">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border"
                  style={{ backgroundColor: `${showDeposit.color || '#22c55e'}15`, borderColor: `${showDeposit.color || '#22c55e'}20` }}
                >
                  <LucideIcon name={showDeposit.icon || 'target'} className="w-5 h-5" style={{ color: showDeposit.color }} />
                </div>
                <div>
                  <h3 className="text-[17px] font-black text-[var(--color-text)] leading-tight">
                    {isWithdrawal ? 'Withdraw Funds' : 'Deposit Savings'}
                  </h3>
                  <p className="text-[11.5px] text-[var(--color-muted)] font-bold">{showDeposit.name}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Amount</label>
                  <input
                    type="number"
                    step="any"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount"
                    autoFocus
                    className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]/45 text-[17px] font-extrabold text-center focus:outline-none text-[var(--color-text)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Source Wallet Account</label>
                  <select
                    value={depositAccountId || ''}
                    onChange={(e) => setDepositAccountId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]/45 text-base font-bold focus:outline-none text-[var(--color-text)]"
                  >
                    {accounts.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name} ({formatCurrency(a.balance)})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setShowDeposit(null)}
                    className="flex-1 py-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]/50 font-bold text-[13.5px] text-[var(--color-text)] haptic"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeposit}
                    disabled={saving || !depositAmount || parseFloat(depositAmount) <= 0}
                    className="flex-1 py-3.5 rounded-2xl gradient-primary text-white font-extrabold text-[13.5px] disabled:opacity-50 haptic shadow-md"
                  >
                    {saving ? '...' : isWithdrawal ? 'Withdraw' : 'Confirm'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
