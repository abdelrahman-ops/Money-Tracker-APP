import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import { useWalletStore } from '../store/walletStore';
import apiClient from '../api/client';
import { ArrowLeft, Plus, Users, ArrowUpRight, ArrowDownLeft, Check, Trash2, CreditCard, CheckCircle2, Edit2, X, AlertCircle, Calendar, User } from 'lucide-react';
import { refreshAllData } from '../utils/refreshData';
import { motion, AnimatePresence } from 'framer-motion';

export default function DebtTracker() {
  const navigate = useNavigate();
  const accounts = useWalletStore((s) => s.wallets);
  const refreshWallets = useWalletStore((s) => s.fetchWallets);

  const [debts, setDebts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [showPayment, setShowPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentAccountId, setPaymentAccountId] = useState(null);
  const [filter, setFilter] = useState('all');

  const [formName, setFormName] = useState('');
  const [formPerson, setFormPerson] = useState('');
  const [formType, setFormType] = useState('i_owe');
  const [formAmount, setFormAmount] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadDebts(); }, []);

  const loadDebts = async () => {
    try {
      const { data } = await apiClient.get('/debts');
      setDebts(data.data || []);
    } catch (e) {
      console.error('Failed to load debts:', e);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormPerson('');
    setFormType('i_owe');
    setFormAmount('');
    setFormDueDate('');
    setEditingDebt(null);
  };

  const openForm = (debt = null) => {
    if (debt) {
      setEditingDebt(debt);
      setFormName(debt.name);
      setFormPerson(debt.personName);
      setFormType(debt.type);
      setFormAmount(String(debt.totalAmount));
      setFormDueDate(debt.dueDate ? debt.dueDate.slice(0, 10) : '');
    } else {
      resetForm();
    }
    setShowForm(true);
  };

  const handleSaveDebt = async () => {
    const total = parseFloat(formAmount);
    if (!formName.trim() || !formPerson.trim() || !total || total <= 0) return;
    setSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        personName: formPerson.trim(),
        type: formType,
        totalAmount: total,
        dueDate: formDueDate ? new Date(formDueDate).toISOString() : null
      };
      if (editingDebt) {
        await apiClient.put(`/debts/${editingDebt._id}`, payload);
      } else {
        await apiClient.post('/debts', { ...payload, paidAmount: 0, status: 'active' });
      }
      setShowForm(false);
      resetForm();
      loadDebts();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDebt = async (debt) => {
    if (window.confirm(`Are you sure you want to delete "${debt.name}"?`)) {
      await apiClient.delete(`/debts/${debt._id}`);
      loadDebts();
    }
  };

  const handleSettleDebt = async (debt) => {
    await apiClient.put(`/debts/${debt._id}`, { status: 'settled', paidAmount: debt.totalAmount });
    loadDebts();
  };

  const handlePayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0 || !showPayment || !paymentAccountId) return;
    setSaving(true);
    try {
      await apiClient.post(`/debts/${showPayment._id}/pay`, { amount, accountId: paymentAccountId });
      setShowPayment(null);
      setPaymentAmount('');
      loadDebts();
      refreshAllData();
    } finally {
      setSaving(false);
    }
  };

  const openPayment = (debt) => {
    setShowPayment(debt);
    setPaymentAmount('');
    setPaymentAccountId(accounts[0]?._id || null);
  };

  const filteredDebts = debts.filter((d) => {
    if (filter === 'all') return d.status !== 'settled';
    if (filter === 'settled') return d.status === 'settled';
    return d.type === filter && d.status !== 'settled';
  });

  const totalIOwe = debts.filter((d) => d.type === 'i_owe' && d.status !== 'settled').reduce((s, d) => s + (d.totalAmount - d.paidAmount), 0);
  const totalOwedToMe = debts.filter((d) => d.type === 'owed_to_me' && d.status !== 'settled').reduce((s, d) => s + (d.totalAmount - d.paidAmount), 0);

  const FILTER_TABS = [
    { key: 'all', label: 'Active' },
    { key: 'i_owe', label: 'I Owe' },
    { key: 'owed_to_me', label: 'Owed to Me' },
    { key: 'settled', label: 'Settled' }
  ];

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
        <h1 className="text-[17px] font-black tracking-tight text-[var(--color-text)]">Debts & Loans</h1>
        <button
          onClick={() => openForm()}
          className="w-10 h-10 rounded-2xl gradient-primary text-white flex items-center justify-center haptic shadow-md shadow-blue-500/20 active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-4 rounded-[24px] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/[0.03] rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/10">
              <ArrowUpRight className="w-4 h-4 text-red-500" strokeWidth={2.5} />
            </div>
            <p className="text-[11px] text-[var(--color-muted)] font-extrabold uppercase tracking-wide">I Owe</p>
          </div>
          <p className="text-[20px] font-black text-[var(--color-danger)] tracking-tight">
            {formatCurrency(totalIOwe)}
          </p>
        </div>

        <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-4 rounded-[24px] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/[0.03] rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/10">
              <ArrowDownLeft className="w-4 h-4 text-green-500" strokeWidth={2.5} />
            </div>
            <p className="text-[11px] text-[var(--color-muted)] font-extrabold uppercase tracking-wide">Owed to Me</p>
          </div>
          <p className="text-[20px] font-black text-[var(--color-success)] tracking-tight">
            {formatCurrency(totalOwedToMe)}
          </p>
        </div>
      </div>

      {/* Filter Tabs Segment Controller */}
      <div className="relative flex bg-[var(--color-card)] border border-[var(--color-border)]/45 p-1 rounded-2xl mb-6 overflow-x-auto select-none" style={{ scrollbarWidth: 'none' }}>
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className="relative flex-1 flex items-center justify-center py-2.5 rounded-xl text-[12.5px] font-bold shrink-0 transition-all haptic z-10"
            style={{ color: filter === tab.key ? 'var(--color-text)' : 'var(--color-muted)' }}
          >
            {filter === tab.key && (
              <motion.div
                layoutId="activeDebtTab"
                className="absolute inset-0 bg-[var(--color-surface)] border border-[var(--color-border)]/35 rounded-xl shadow-sm -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {filteredDebts.length === 0 ? (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 text-center py-12 rounded-[28px] shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]/35 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[var(--color-muted)]" />
          </div>
          <p className="text-[15px] font-bold mb-1 text-[var(--color-text)]">
            {filter === 'settled' ? 'No settled records' : 'No active debts'}
          </p>
          <p className="text-[13px] text-[var(--color-muted)] px-6">
            {filter === 'settled' ? 'Settled loans and payments will show up here.' : 'Add your borrowing and lending logs to track balances.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDebts.map((debt, idx) => {
            const pct = debt.totalAmount > 0 ? Math.min((debt.paidAmount / debt.totalAmount) * 100, 100) : 0;
            const remaining = debt.totalAmount - debt.paidAmount;
            const isSettled = debt.status === 'settled';
            const isOverdue = debt.dueDate && new Date(debt.dueDate) < new Date() && !isSettled;
            const isOweType = debt.type === 'i_owe';
            
            return (
              <motion.div
                key={debt._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`bg-[var(--color-card)] border p-5 rounded-[28px] shadow-sm relative overflow-hidden transition-all ${
                  isOverdue ? 'border-red-500/35 ring-1 ring-red-500/10' : 'border-[var(--color-border)]/55'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start gap-3.5 mb-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                      isOweType
                        ? 'bg-red-500/10 border-red-500/10'
                        : 'bg-green-500/10 border-green-500/10'
                    }`}
                  >
                    {isOweType ? (
                      <ArrowUpRight className="w-5 h-5 text-red-500" strokeWidth={2.5} />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5 text-green-500" strokeWidth={2.5} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-[15.5px] font-bold truncate text-[var(--color-text)]">{debt.name}</p>
                    <p className="text-[12.5px] text-[var(--color-muted)] font-semibold flex items-center gap-1 mt-0.5">
                      <User className="w-3.5 h-3.5 shrink-0" />
                      {isOweType ? 'I owe' : 'Owes me'}: <strong className="text-[var(--color-text)] font-extrabold">{debt.personName}</strong>
                    </p>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className={`text-[16px] font-black ${isOweType ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
                      {formatCurrency(remaining)}
                    </p>
                    <p className="text-[10px] text-[var(--color-muted)] font-bold mt-0.5">
                      of {formatCurrency(debt.totalAmount)}
                    </p>
                  </div>
                </div>

                {/* Progress bar for partially paid debts */}
                {pct > 0 && (
                  <div className="space-y-1.5 mb-3.5">
                    <div className="w-full h-1.5 bg-[var(--color-surface)] border border-[var(--color-border)]/35 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: isSettled ? 'var(--color-success)' : (isOweType ? 'var(--color-danger)' : 'var(--color-success)') }}
                      />
                    </div>
                    <p className="text-[10.5px] text-[var(--color-muted)] font-extrabold text-right">
                      {pct.toFixed(0)}% Settled ({formatCurrency(debt.paidAmount)} paid)
                    </p>
                  </div>
                )}

                {/* Footer Info & Actions */}
                <div className="flex items-center justify-between border-t border-[var(--color-border)]/30 pt-3 mt-1.5">
                  <div className="flex items-center gap-2 text-[10.5px] font-extrabold text-[var(--color-muted)]">
                    {isOverdue && (
                      <span className="text-[var(--color-danger)] bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/10">Overdue</span>
                    )}
                    {debt.dueDate && !isOverdue && !isSettled && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Due: {new Date(debt.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {isSettled && (
                      <span className="text-[var(--color-success)] bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/10">Settled</span>
                    )}
                  </div>
                  
                  {!isSettled && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSettleDebt(debt)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/10 text-[11px] font-extrabold text-[var(--color-success)] active:scale-95 transition-all haptic"
                      >
                        <Check className="w-3 h-3" strokeWidth={2.5} /> Settle
                      </button>
                      
                      {isOweType && (
                        <button
                          onClick={() => openPayment(debt)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl gradient-primary text-white text-[11px] font-extrabold active:scale-95 transition-all haptic shadow-md"
                        >
                          <CreditCard className="w-3 h-3" /> Pay
                        </button>
                      )}
                      
                      <button
                        onClick={() => openForm(debt)}
                        className="p-2 rounded-xl text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-all haptic"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteDebt(debt)}
                        className="p-2 rounded-xl text-[var(--color-danger)] hover:bg-red-500/10 transition-all haptic"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Debt Form Bottom Sheet Overlay */}
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
                {editingDebt ? 'Edit Debt Info' : 'Add New Debt Log'}
              </h3>
              
              <div className="space-y-4.5">
                <div className="flex bg-[var(--color-surface)] border border-[var(--color-border)]/35 p-1 rounded-2xl">
                  <button
                    onClick={() => setFormType('i_owe')}
                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all haptic ${
                      formType === 'i_owe'
                        ? 'bg-[var(--color-danger)] text-white shadow-sm'
                        : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    I Owe Money
                  </button>
                  <button
                    onClick={() => setFormType('owed_to_me')}
                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all haptic ${
                      formType === 'owed_to_me'
                        ? 'bg-[var(--color-success)] text-white shadow-sm'
                        : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    Owed to Me
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Reason / Purpose</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Lunch split, Car rent share"
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)]/45 text-base font-semibold rounded-2xl focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Person Name</label>
                  <input
                    type="text"
                    value={formPerson}
                    onChange={(e) => setFormPerson(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)]/45 text-base font-semibold rounded-2xl focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Total Balance</label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)]/45 text-base font-bold rounded-2xl focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Due Date (Optional)</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)]/45 text-base font-bold rounded-2xl focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text)]"
                  />
                </div>

                <button
                  onClick={handleSaveDebt}
                  disabled={saving || !formName.trim() || !formPerson.trim() || !formAmount}
                  className="w-full py-4 rounded-2xl gradient-primary text-white font-extrabold text-[15px] shadow-lg shadow-blue-500/25 haptic active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
                >
                  {saving ? 'Saving...' : editingDebt ? 'Save Debt Modifications' : 'Create Debt Log'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Payment Dialog Box */}
      <AnimatePresence>
        {showPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowPayment(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-card)] border border-[var(--color-border)]/55 rounded-3xl p-5 w-full max-w-sm shadow-2xl flex flex-col"
            >
              <h3 className="text-[17px] font-black text-center text-[var(--color-text)] mb-1">
                Log Payback Installment
              </h3>
              <p className="text-[12.5px] text-[var(--color-muted)] text-center font-bold">
                {showPayment.name} — {showPayment.personName}
              </p>
              
              <div className="my-4 bg-[var(--color-surface)] border border-[var(--color-border)]/35 p-3 rounded-2xl text-center">
                <span className="text-[11px] text-[var(--color-muted)] font-extrabold uppercase">Remaining Balance</span>
                <p className="text-[17px] font-black text-[var(--color-text)] mt-0.5">
                  {formatCurrency(showPayment.totalAmount - showPayment.paidAmount)}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Payment Amount</label>
                  <input
                    type="number"
                    step="any"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount"
                    autoFocus
                    className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]/45 text-[16px] font-extrabold text-center focus:outline-none text-[var(--color-text)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Deduct From Wallet</label>
                  <select
                    value={paymentAccountId || ''}
                    onChange={(e) => setPaymentAccountId(e.target.value)}
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
                    onClick={() => setShowPayment(null)}
                    className="flex-1 py-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]/50 font-bold text-[13.5px] text-[var(--color-text)] haptic"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={saving || !paymentAmount || parseFloat(paymentAmount) <= 0}
                    className="flex-1 py-3.5 rounded-2xl gradient-primary text-white font-extrabold text-[13.5px] disabled:opacity-50 haptic shadow-md"
                  >
                    {saving ? '...' : 'Register Payment'}
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
