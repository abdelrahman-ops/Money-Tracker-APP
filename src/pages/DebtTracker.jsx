import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import { useWalletStore } from '../store/walletStore';
import apiClient from '../api/client';
import { ArrowLeft, Plus, Users, ArrowUpRight, ArrowDownLeft, Check, Trash2, CreditCard, CirclePlus, CheckCircle2, MoreVertical, Edit2, X, AlertCircle } from 'lucide-react';
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
    } catch (e) { console.error('Failed to load debts:', e); }
  };

  const resetForm = () => { setFormName(''); setFormPerson(''); setFormType('i_owe'); setFormAmount(''); setFormDueDate(''); setEditingDebt(null); };

  const openForm = (debt = null) => {
    if (debt) {
      setEditingDebt(debt); setFormName(debt.name); setFormPerson(debt.personName);
      setFormType(debt.type); setFormAmount(String(debt.totalAmount));
      setFormDueDate(debt.dueDate ? debt.dueDate.slice(0, 10) : '');
    } else { resetForm(); }
    setShowForm(true);
  };

  const handleSaveDebt = async () => {
    const total = parseFloat(formAmount);
    if (!formName || !formPerson || !total || total <= 0) return;
    setSaving(true);
    try {
      const payload = { name: formName, personName: formPerson, type: formType, totalAmount: total, dueDate: formDueDate ? new Date(formDueDate).toISOString() : null };
      if (editingDebt) {
        await apiClient.put(`/debts/${editingDebt._id}`, payload);
      } else {
        await apiClient.post('/debts', { ...payload, paidAmount: 0, status: 'active' });
      }
      setShowForm(false); resetForm(); loadDebts();
    } finally { setSaving(false); }
  };

  const handleDeleteDebt = async (debt) => {
    if (window.confirm(`Delete "${debt.name}"?`)) {
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
      setShowPayment(null); setPaymentAmount('');
      loadDebts(); refreshAllData();
    } finally { setSaving(false); }
  };

  const openPayment = (debt) => {
    setShowPayment(debt); setPaymentAmount('');
    setPaymentAccountId(accounts[0]?._id || null);
  };

  const filteredDebts = debts.filter((d) => {
    if (filter === 'all') return d.status !== 'settled';
    if (filter === 'settled') return d.status === 'settled';
    return d.type === filter && d.status !== 'settled';
  });

  const totalIOwe = debts.filter((d) => d.type === 'i_owe' && d.status !== 'settled').reduce((s, d) => s + (d.totalAmount - d.paidAmount), 0);
  const totalOwedToMe = debts.filter((d) => d.type === 'owed_to_me' && d.status !== 'settled').reduce((s, d) => s + (d.totalAmount - d.paidAmount), 0);

  return (
    <div className="px-4 pt-5 pb-24">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="p-2 rounded-2xl min-w-touch min-h-touch haptic"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-[22px] font-bold flex-1">Debts</h1>
        <button onClick={() => openForm()} className="w-10 h-10 rounded-2xl gradient-primary text-white flex items-center justify-center active:scale-90 transition-transform"><Plus className="w-5 h-5" /></button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="ios-card p-4">
          <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center"><ArrowUpRight className="w-4 h-4 text-red-500" /></div><p className="text-[12px] text-[var(--color-muted)]">I Owe</p></div>
          <p className="text-[18px] font-bold text-[var(--color-danger)]">{formatCurrency(totalIOwe)}</p>
        </div>
        <div className="ios-card p-4">
          <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center"><ArrowDownLeft className="w-4 h-4 text-green-500" /></div><p className="text-[12px] text-[var(--color-muted)]">Owed to Me</p></div>
          <p className="text-[18px] font-bold text-[var(--color-success)]">{formatCurrency(totalOwedToMe)}</p>
        </div>
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {[{ key: 'all', label: 'Active' }, { key: 'i_owe', label: 'I Owe' }, { key: 'owed_to_me', label: 'Owed to Me' }, { key: 'settled', label: 'Settled' }].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={'shrink-0 px-4 py-2 rounded-2xl text-[13px] font-semibold transition-all ' + (filter === f.key ? 'gradient-primary text-white' : 'bg-[var(--color-card)] text-[var(--color-muted)] ios-card')}>{f.label}</button>
        ))}
      </div>

      {filteredDebts.length === 0 ? (
        <div className="ios-card text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface)] flex items-center justify-center mx-auto mb-4"><Users className="w-8 h-8 text-[var(--color-muted)]" /></div>
          <p className="text-[16px] font-semibold mb-1">{filter === 'settled' ? 'No settled debts' : 'No active debts'}</p>
          <p className="text-[13px] text-[var(--color-muted)]">{filter === 'settled' ? 'Debts you settle will appear here' : 'Track money borrowed and lent'}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredDebts.map((debt, idx) => {
            const pct = debt.totalAmount > 0 ? Math.min((debt.paidAmount / debt.totalAmount) * 100, 100) : 0;
            const remaining = debt.totalAmount - debt.paidAmount;
            const isSettled = debt.status === 'settled';
            const isOverdue = debt.dueDate && new Date(debt.dueDate) < new Date() && !isSettled;
            return (
              <motion.div key={debt._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} className={'ios-card p-4' + (isOverdue ? ' ring-1 ring-[var(--color-danger)]/30' : '')}>
                <div className="flex items-start gap-3 mb-2.5">
                  <div className={'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ' + (debt.type === 'i_owe' ? 'bg-red-500/10' : 'bg-green-500/10')}>
                    {debt.type === 'i_owe' ? <ArrowUpRight className="w-5 h-5 text-red-500" /> : <ArrowDownLeft className="w-5 h-5 text-green-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold truncate">{debt.name}</p>
                    <p className="text-[12px] text-[var(--color-muted)]">{debt.type === 'i_owe' ? 'I owe' : 'Owes me'}: <span className="font-semibold">{debt.personName}</span></p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={'text-[15px] font-bold ' + (debt.type === 'i_owe' ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]')}>{formatCurrency(remaining)}</p>
                    <p className="text-[11px] text-[var(--color-muted)]">of {formatCurrency(debt.totalAmount)}</p>
                  </div>
                </div>
                {pct > 0 && (
                  <div className="h-2 bg-[var(--color-surface)] rounded-full overflow-hidden mb-2.5">
                    <motion.div initial={{ width: 0 }} animate={{ width: pct + '%' }} transition={{ duration: 0.5 }} className="h-full rounded-full" style={{ backgroundColor: isSettled ? 'var(--color-success)' : (debt.type === 'i_owe' ? 'var(--color-danger)' : 'var(--color-success)') }} />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-[var(--color-muted)]">
                    {isOverdue && <span className="text-[var(--color-danger)] font-semibold">Overdue</span>}
                    {debt.dueDate && !isOverdue && <span>Due: {new Date(debt.dueDate).toLocaleDateString()}</span>}
                    {isSettled && <span className="text-[var(--color-success)] font-semibold">Settled</span>}
                  </div>
                  {!isSettled && (
                    <div className="flex gap-1.5">
                      <button onClick={() => handleSettleDebt(debt)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[var(--color-surface)] text-[11px] font-semibold text-[var(--color-success)] active:scale-95 transition-transform"><Check className="w-3 h-3" /> Settle</button>
                      {debt.type === 'i_owe' && (
                        <button onClick={() => openPayment(debt)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl gradient-primary text-white text-[11px] font-semibold active:scale-95 transition-transform"><CreditCard className="w-3 h-3" /> Pay</button>
                      )}
                      <button onClick={() => openForm(debt)} className="p-1.5 rounded-xl active:bg-[var(--color-surface)] transition-colors"><ArrowUpRight className="w-3.5 h-3.5 text-[var(--color-muted)]" /></button>
                      <button onClick={() => handleDeleteDebt(debt)} className="p-1.5 rounded-xl active:bg-[var(--color-surface)] transition-colors"><Trash2 className="w-3.5 h-3.5 text-[var(--color-danger)]" /></button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Debt Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-end justify-center" onClick={() => setShowForm(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="bg-[var(--color-card)] rounded-t-3xl w-full max-w-lg pb-8 max-h-[80vh] overflow-y-auto">
              <div className="w-10 h-1 bg-[var(--color-border)] rounded-full mx-auto mt-3 mb-4" />
              <h3 className="text-lg font-bold text-center mb-5">{editingDebt ? 'Edit Debt' : 'New Debt'}</h3>
              <div className="px-5 space-y-4">
                <div className="flex gap-2">
                  <button onClick={() => setFormType('i_owe')} className={'flex-1 py-3 rounded-2xl text-[14px] font-semibold transition-all ' + (formType === 'i_owe' ? 'bg-red-500/10 text-red-500 ring-1 ring-red-500/30' : 'bg-[var(--color-surface)] text-[var(--color-muted)]')}>I Owe</button>
                  <button onClick={() => setFormType('owed_to_me')} className={'flex-1 py-3 rounded-2xl text-[14px] font-semibold transition-all ' + (formType === 'owed_to_me' ? 'bg-green-500/10 text-green-500 ring-1 ring-green-500/30' : 'bg-[var(--color-surface)] text-[var(--color-muted)]')}>Owed to Me</button>
                </div>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="What for? (e.g., Lunch money)" className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30" />
                <input type="text" value={formPerson} onChange={(e) => setFormPerson(e.target.value)} placeholder="Person name" className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30" />
                <input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="Total amount" className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30" />
                <input type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] text-[15px] focus:outline-none" />
                <button onClick={handleSaveDebt} disabled={saving || !formName || !formPerson || !formAmount} className="w-full py-3.5 rounded-2xl gradient-primary text-white font-bold text-[15px] disabled:opacity-50">{saving ? 'Saving...' : editingDebt ? 'Update Debt' : 'Create Debt'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={() => setShowPayment(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-[var(--color-card)] rounded-3xl p-6 w-full max-w-xs">
              <h3 className="text-lg font-bold text-center mb-1">Log Payment</h3>
              <p className="text-[12px] text-[var(--color-muted)] text-center mb-4">{showPayment.name} — {showPayment.personName}</p>
              <p className="text-center text-[13px] text-[var(--color-muted)] mb-3">Remaining: <span className="font-bold text-[var(--color-text)]">{formatCurrency(showPayment.totalAmount - showPayment.paidAmount)}</span></p>
              <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Payment amount" autoFocus className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] text-[17px] font-semibold text-center focus:outline-none mb-3" />
              <select value={paymentAccountId || ''} onChange={(e) => setPaymentAccountId(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] text-[14px] focus:outline-none mb-4">
                {accounts.map((a) => (<option key={a._id} value={a._id}>{a.name}</option>))}
              </select>
              <div className="flex gap-2">
                <button onClick={() => setShowPayment(null)} className="flex-1 py-3 rounded-2xl bg-[var(--color-surface)] font-semibold text-[14px]">Cancel</button>
                <button onClick={handlePayment} disabled={saving || !paymentAmount || parseFloat(paymentAmount) <= 0} className="flex-1 py-3 rounded-2xl gradient-primary text-white font-semibold text-[14px] disabled:opacity-50">{saving ? '...' : 'Pay'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
