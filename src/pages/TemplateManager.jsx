import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import { useWalletStore } from '../store/walletStore';
import { useCategoryStore } from '../store/categoryStore';
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate as apiDeleteTemplate } from '../services/apiServices';
import { createTransaction } from '../services/transactionService';
import { ArrowLeft, Plus, Edit2, Trash2, X, Repeat, Check, Zap, Play } from 'lucide-react';
import { refreshAllData } from '../utils/refreshData';
import { motion, AnimatePresence } from 'framer-motion';
import LucideIcon from '../components/LucideIcon';

export default function TemplateManager() {
  const navigate = useNavigate();

  const categories = useCategoryStore((s) => s.categories);
  const accounts = useWalletStore((s) => s.wallets);
  const refreshWallets = useWalletStore((s) => s.fetchWallets);

  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [categoryId, setCategoryId] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDate, setRecurringDate] = useState(1);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await fetchTemplates();
      setTemplates(data || []);
    } catch (e) {
      console.error('Failed to load templates:', e);
    }
  };

  const catMap = useMemo(() => {
    const m = {};
    categories.forEach((c) => { m[c._id] = c; });
    return m;
  }, [categories]);

  const accMap = useMemo(() => {
    const m = {};
    accounts.forEach((a) => { m[a._id] = a; });
    return m;
  }, [accounts]);

  useEffect(() => {
    if (accounts.length > 0 && !accountId) setAccountId(accounts[0]._id);
  }, [accounts, accountId]);

  const filteredCategories = categories.filter((c) => c.type === type);

  const resetForm = () => {
    setEditId(null);
    setTitle('');
    setAmount('');
    setType('expense');
    setCategoryId(null);
    setAccountId(accounts[0]?._id || null);
    setIsRecurring(false);
    setRecurringDate(1);
  };

  const openNew = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (t) => {
    setEditId(t._id);
    setTitle(t.title);
    setAmount(String(t.amount));
    setType(t.type);
    setCategoryId(t.categoryId || null);
    setAccountId(t.defaultAccountId || accounts[0]?._id);
    setIsRecurring(!!t.isRecurring);
    setRecurringDate(t.recurringDate || 1);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !amount || parseFloat(amount) <= 0) return;
    const data = {
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      categoryId,
      defaultAccountId: accountId,
      isRecurring,
      recurringDate: isRecurring ? recurringDate : null,
    };
    try {
      if (editId) {
        await updateTemplate(editId, data);
      } else {
        await createTemplate(data);
      }
      setShowForm(false);
      resetForm();
      loadTemplates();
    } catch (e) {
      console.error('Failed to save template:', e);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await apiDeleteTemplate(id);
        loadTemplates();
      } catch (e) {
        console.error('Failed to delete template:', e);
      }
      if (editId === id) {
        setShowForm(false);
        resetForm();
      }
    }
  };

  const handleQuickAdd = async (template) => {
    const acc = accMap[template.defaultAccountId];
    if (!acc) return;

    const result = await createTransaction({
      amount: template.amount,
      type: template.type,
      name: template.title,
      accountId: template.defaultAccountId,
      categoryId: template.categoryId,
      date: new Date().toISOString(),
    });

    if (result.success) {
      refreshAllData();
      alert(`Applied template: "${template.title}"`);
    }
  };

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
        <h1 className="text-[17px] font-black tracking-tight text-[var(--color-text)]">Transaction Templates</h1>
        <button
          onClick={openNew}
          className="w-10 h-10 rounded-2xl gradient-primary text-white flex items-center justify-center haptic shadow-md shadow-blue-500/20 active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Actions Information Banner */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-4.5 rounded-[24px] shadow-sm mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/[0.03] rounded-full blur-xl pointer-events-none" />
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/10 shrink-0">
            <Zap className="w-4.5 h-4.5 text-blue-500" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[12.5px] font-bold text-[var(--color-text)]">One-Tap Execution</p>
            <p className="text-[11px] text-[var(--color-muted)] font-semibold mt-0.5 leading-relaxed">
              Tap the play button on any template row to instantly create a new transaction with its defaults.
            </p>
          </div>
        </div>
      </div>

      {/* Templates List container */}
      <div className="space-y-3.5">
        {templates.length === 0 ? (
          <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 text-center py-12 rounded-[28px] shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]/35 flex items-center justify-center mx-auto mb-3">
              <Repeat className="w-6 h-6 text-[var(--color-muted)]" />
            </div>
            <p className="text-[15px] font-bold mb-1 text-[var(--color-text)]">No Templates Configured</p>
            <p className="text-[12.5px] text-[var(--color-muted)] mb-5">Set up default models for frequent payments.</p>
            <button
              onClick={openNew}
              className="px-6 py-3 rounded-2xl gradient-primary text-white font-extrabold text-[13px] haptic shadow-md"
            >
              Create New Template
            </button>
          </div>
        ) : (
          templates.map((t, idx) => {
            const cat = catMap[t.categoryId];
            const acc = accMap[t.defaultAccountId];
            const isExpense = t.type === 'expense';
            
            return (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-[var(--color-card)] border border-[var(--color-border)]/55 p-4 rounded-[24px] shadow-sm flex items-center justify-between gap-3 relative overflow-hidden"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0" onClick={() => openEdit(t)}>
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border cursor-pointer"
                    style={{
                      backgroundColor: `${cat?.color || '#7c3aed'}12`,
                      borderColor: `${cat?.color || '#7c3aed'}20`
                    }}
                  >
                    {cat ? (
                      <LucideIcon name={cat.icon} className="w-5 h-5" style={{ color: cat.color }} />
                    ) : (
                      <Repeat className="w-5 h-5 text-[var(--color-primary)]" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <p className="text-[14.5px] font-bold truncate text-[var(--color-text)]">{t.title}</p>
                      {t.isRecurring && (
                        <span className="shrink-0 px-2 py-0.5 rounded-lg bg-violet-500/10 text-violet-500 text-[8.5px] font-black uppercase tracking-wider">
                          Day {t.recurringDate}
                        </span>
                      )}
                    </div>
                    <p className="text-[11.5px] text-[var(--color-muted)] font-semibold mt-0.5">
                      {cat?.name || t.type} {acc ? `• ${acc.name}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <p className={`text-[15px] font-black ${isExpense ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
                    {isExpense ? '-' : '+'}{formatCurrency(t.amount)}
                  </p>
                  
                  <button
                    onClick={() => handleQuickAdd(t)}
                    className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/10 flex items-center justify-center shrink-0 active:scale-95 transition-all hover:bg-green-500/15 haptic"
                    title="Quick Run"
                  >
                    <Play className="w-4 h-4 text-green-500 fill-green-500" strokeWidth={2.5} />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(t._id)}
                    className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/10 flex items-center justify-center shrink-0 active:scale-95 transition-all hover:bg-red-500/15 haptic"
                    title="Delete Template"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create/Edit Bottom Sheet Panel */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center px-4"
            onClick={() => { setShowForm(false); resetForm(); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-card)] rounded-t-[32px] border-t border-[var(--color-border)]/40 w-full max-w-md p-6 pb-8 max-h-[85vh] overflow-y-auto z-110 shadow-2xl flex flex-col"
            >
              <div className="w-12 h-1 bg-[var(--color-border)]/70 rounded-full mx-auto mb-5" />
              <h3 className="text-[17px] font-black text-center text-[var(--color-text)] mb-5">
                {editId ? 'Modify Template' : 'New Template Setup'}
              </h3>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Template Label</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Netflix, Rent Payment"
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)]/45 text-base font-semibold rounded-2xl focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Default Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)]/45 text-base font-bold rounded-2xl focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Flow Type</label>
                  <div className="flex bg-[var(--color-surface)] border border-[var(--color-border)]/35 p-1 rounded-2xl">
                    <button
                      onClick={() => { setType('expense'); setCategoryId(null); }}
                      className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all haptic ${
                        type === 'expense'
                          ? 'bg-[var(--color-danger)] text-white shadow-sm'
                          : 'text-[var(--color-muted)]'
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      onClick={() => { setType('income'); setCategoryId(null); }}
                      className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all haptic ${
                        type === 'income'
                          ? 'bg-[var(--color-success)] text-white shadow-sm'
                          : 'text-[var(--color-muted)]'
                      }`}
                    >
                      Income
                    </button>
                  </div>
                </div>

                {filteredCategories.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Default Category</label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)]/35 p-3 rounded-2xl">
                      {filteredCategories.map((cat) => (
                        <button
                          key={cat._id}
                          onClick={() => setCategoryId(cat._id === categoryId ? null : cat._id)}
                          className={`px-3 py-2 rounded-xl text-[12.5px] font-bold transition-all border flex items-center gap-1.5 haptic ${
                            categoryId === cat._id
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                              : 'border-[var(--color-border)]/45 text-[var(--color-muted)]'
                          }`}
                        >
                          <LucideIcon name={cat.icon} className="w-3.5 h-3.5" style={{ color: cat.color }} />
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Payment Method</label>
                  <select
                    value={accountId || ''}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)]/45 text-[13.5px] font-bold rounded-2xl focus:outline-none text-[var(--color-text)]"
                  >
                    {accounts.map((a) => (
                      <option key={a._id} value={a._id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                {/* Auto recurring controller */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-3 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]/35">
                    <div>
                      <p className="text-[13.5px] font-bold text-[var(--color-text)] flex items-center gap-1.5">
                        <Repeat className="w-4 h-4 text-[var(--color-primary)] animate-spin-slow" />
                        Auto-recurring Scheduler
                      </p>
                      <p className="text-[10px] text-[var(--color-muted)] font-semibold mt-0.5">Post automatically on a monthly date</p>
                    </div>
                    <button
                      onClick={() => setIsRecurring(!isRecurring)}
                      className={`w-11 h-6.5 rounded-full p-0.5 transition-colors duration-250 cursor-pointer outline-none relative flex items-center ${
                        isRecurring ? 'gradient-primary justify-end' : 'bg-[var(--color-border)]/65 justify-start'
                      }`}
                    >
                      <motion.div
                        layout
                        className="w-5 h-5 rounded-full bg-white shadow-sm"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {isRecurring && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 space-y-1.5"
                    >
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">Day of Month</label>
                      <div className="grid grid-cols-7 gap-1.5 bg-[var(--color-surface)] border border-[var(--color-border)]/35 p-3 rounded-2xl">
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                          <button
                            key={day}
                            onClick={() => setRecurringDate(day)}
                            className={`aspect-square rounded-xl text-[12px] font-extrabold transition-all haptic ${
                              recurringDate === day
                                ? 'gradient-primary text-white shadow-md'
                                : 'hover:bg-[var(--color-card)] text-[var(--color-muted)]'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                <button
                  onClick={handleSave}
                  disabled={!title.trim() || !amount || parseFloat(amount) <= 0}
                  className="w-full py-4 rounded-2xl gradient-primary text-white font-extrabold text-[15.5px] shadow-lg shadow-blue-500/25 haptic active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
                >
                  {editId ? 'Update Template Settings' : 'Create Template Model'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
