import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import { useWalletStore } from '../store/walletStore';
import { useCategoryStore } from '../store/categoryStore';
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate as apiDeleteTemplate } from '../services/apiServices';
import { createTransaction } from '../services/transactionService';
import { ArrowLeft, Plus, Edit2, Trash2, X, Repeat, Check } from 'lucide-react';
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
  }, [accounts]);

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
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)] safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-2xl min-w-touch min-h-touch active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Templates</h1>
        <button
          onClick={openNew}
          className="p-2.5 rounded-2xl gradient-primary text-white min-w-touch min-h-touch flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Actions Banner */}
      <div className="px-4 mb-4">
        <div className="ios-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">Quick Templates</span>
          </div>
          <p className="text-xs text-[var(--color-muted)]">Tap play to instantly add a transaction from any template.</p>
        </div>
      </div>

      {/* Template List */}
      <div className="px-4 space-y-2">
        {templates.length === 0 ? (
          <div className="ios-card text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface)] flex items-center justify-center mx-auto mb-3">
              <Repeat className="w-7 h-7 text-[var(--color-muted)]" />
            </div>
            <p className="text-sm text-[var(--color-muted)] mb-1">No templates yet</p>
            <p className="text-xs text-[var(--color-muted)] mb-4">Create templates for frequent transactions</p>
            <button onClick={openNew} className="btn-primary text-sm px-6 py-2.5">
              Create Template
            </button>
          </div>
        ) : (
          templates.map((t, idx) => {
            const cat = catMap[t.categoryId];
            const acc = accMap[t.defaultAccountId];
            return (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="ios-card flex items-center gap-3 p-3.5"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: (cat?.color || '#7c3aed') + '15' }}
                >
                  {cat ? (
                    <LucideIcon name={cat.icon} className="w-5 h-5" style={{ color: cat.color }} />
                  ) : (
                    <Repeat className="w-5 h-5 text-[var(--color-primary)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0" onClick={() => openEdit(t)}>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm truncate">{t.title}</p>
                    {t.isRecurring && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-purple-500/10 text-[var(--color-primary)] text-[9px] font-bold uppercase">
                        Day {t.recurringDate}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-muted)]">
                    {cat?.name || t.type} {acc ? '· ' + acc.name : ''}
                  </p>
                </div>
                <p className={'text-sm font-bold mr-1 ' + (t.type === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]')}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
                <button
                  onClick={() => handleQuickAdd(t)}
                  className="w-9 h-9 rounded-xl bg-[var(--color-success)]/10 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                >
                  <Play className="w-4 h-4 text-[var(--color-success)]" />
                </button>
                <button
                  onClick={() => handleDelete(t._id)}
                  className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                >
                  <Trash2 className="w-4 h-4 text-[var(--color-danger)]" />
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create/Edit Sheet */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-end justify-center"
            onClick={() => { setShowForm(false); resetForm(); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-card)] rounded-t-3xl w-full max-w-lg p-5 pb-8 max-h-[85vh] overflow-y-auto"
            >
              <div className="w-10 h-1 bg-[var(--color-border)] rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-bold text-center mb-5">
                {editId ? 'Edit Template' : 'New Template'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--color-muted)] uppercase mb-1.5 block">Name</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Morning Coffee, Gym, Netflix"
                    className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--color-muted)] uppercase mb-1.5 block">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--color-muted)] uppercase mb-1.5 block">Type</label>
                  <div className="flex gap-2">
                    {['expense', 'income'].map((t) => (
                      <button
                        key={t}
                        onClick={() => { setType(t); setCategoryId(null); }}
                        className={'flex-1 py-2.5 rounded-2xl text-sm font-semibold capitalize transition-all ' +
                          (type === t
                            ? (t === 'expense' ? 'bg-red-500/10 text-[var(--color-danger)]' : 'bg-emerald-500/10 text-[var(--color-success)]')
                            : 'bg-[var(--color-surface)] text-[var(--color-muted)]')
                        }
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredCategories.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-muted)] uppercase mb-1.5 block">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {filteredCategories.map((cat) => (
                        <button
                          key={cat._id}
                          onClick={() => setCategoryId(cat._id === categoryId ? null : cat._id)}
                          className={'px-3 py-2 rounded-2xl text-xs font-medium transition-all border flex items-center gap-1.5 ' +
                            (categoryId === cat._id
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                              : 'border-[var(--color-border)] text-[var(--color-muted)]')
                          }
                        >
                          <LucideIcon name={cat.icon} className="w-3.5 h-3.5" style={{ color: cat.color }} />
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-[var(--color-muted)] uppercase mb-1.5 block">Account</label>
                  <select
                    value={accountId || ''}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none"
                  >
                    {accounts.map((a) => (
                      <option key={a._id} value={a._id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <button
                    onClick={() => setIsRecurring(!isRecurring)}
                    className="w-full flex items-center gap-3 py-3"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                      <Repeat className="w-5 h-5 text-[var(--color-primary)]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">Auto-recurring</p>
                      <p className="text-xs text-[var(--color-muted)]">Auto-add on a specific day each month</p>
                    </div>
                    <div className={`w-11 h-6 rounded-full transition-colors ${isRecurring ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform shadow-sm ${isRecurring ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                    </div>
                  </button>

                  {isRecurring && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2"
                    >
                      <label className="text-xs font-semibold text-[var(--color-muted)] uppercase mb-1.5 block">Day of month</label>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                          <button
                            key={day}
                            onClick={() => setRecurringDate(day)}
                            className={'w-9 h-9 rounded-xl text-xs font-semibold transition-all ' +
                              (recurringDate === day ? 'gradient-primary text-white' : 'bg-[var(--color-surface)] text-[var(--color-muted)] hover:bg-[var(--color-border)]')
                            }
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
                  className="w-full py-3.5 rounded-2xl gradient-primary text-white font-bold text-base active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  {editId ? 'Update Template' : 'Save Template'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
