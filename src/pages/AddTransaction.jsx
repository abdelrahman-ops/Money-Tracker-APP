import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import { useWalletStore } from '../store/walletStore';
import { useCategoryStore } from '../store/categoryStore';
import { useTransactionStore } from '../store/transactionStore';
import { createTransaction, updateTransaction, deleteTransaction, fetchTransaction } from '../services/transactionService';
import { fetchTemplates as apiFetchTemplates } from '../services/apiServices';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Delete, Calendar, FileText, Repeat, StickyNote, CheckCheck, Plus } from 'lucide-react';
import LucideIcon from '../components/LucideIcon';
import { refreshAllData } from '../utils/refreshData';

const TYPES = [
  { key: 'expense', label: 'Expense', color: 'text-[var(--color-danger)]', activeBg: 'bg-red-500/10' },
  { key: 'income', label: 'Income', color: 'text-[var(--color-success)]', activeBg: 'bg-emerald-500/10' },
  { key: 'transfer', label: 'Transfer', color: 'text-[var(--color-primary)]', activeBg: 'bg-blue-500/10' },
];

export default function AddTransaction() {
  const navigate = useNavigate();
  const { editId } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = !!editId;
  const nameRef = useRef(null);
  const returnMonth = searchParams.get('returnMonth');
  const returnDate = searchParams.get('returnDate');

  // API-backed stores
  const accounts = useWalletStore((s) => s.wallets);
  const allCategories = useCategoryStore((s) => s.categories);

  const [templates, setTemplates] = useState([]);
  const [type, setType] = useState(searchParams.get('type') || 'expense');
  const [amount, setAmount] = useState('0');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [toAccountId, setToAccountId] = useState(null);
  const [date, setDate] = useState(searchParams.get('date') || new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [justSaved, setJustSaved] = useState(false);

  const categories = allCategories.filter((c) => c.type === type);

  const catMap = {};
  allCategories.forEach((c) => { catMap[c._id] = c; });

  // Load templates from API
  useEffect(() => {
    apiFetchTemplates().then(setTemplates).catch(() => {});
  }, []);

  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      const paramAccountId = searchParams.get('accountId');
      if (paramAccountId) {
        setAccountId(paramAccountId);
      } else {
        setAccountId(accounts[0]._id);
      }
      if (accounts.length > 1) setToAccountId(accounts[1]._id);
    }
  }, [accounts]);

  // Read QuickInput pre-fill params
  useEffect(() => {
    const paramAmount = searchParams.get('amount');
    const paramName = searchParams.get('name');
    const paramCategoryId = searchParams.get('categoryId');

    if (paramAmount) setAmount(paramAmount);
    if (paramName) setName(paramName);
    if (paramCategoryId) setCategoryId(paramCategoryId);
  }, []);

  // Load existing transaction for editing
  useEffect(() => {
    if (isEditing) {
      fetchTransaction(editId).then((txn) => {
        if (txn) {
          setType(txn.type);
          setAmount(String(txn.amount));
          setName(txn.name || '');
          setNote(txn.note || '');
          setCategoryId(txn.categoryId || null);
          setAccountId(txn.accountId);
          setToAccountId(txn.toAccountId || null);
          setDate(txn.date.slice(0, 10));
          if (txn.note) setShowNotes(true);
        }
      });
    }
  }, [editId]);

  const resetForm = () => {
    setAmount('0');
    setName('');
    setNote('');
    setCategoryId(null);
    setShowNotes(false);
  };

  const handleKeyPress = useCallback((key) => {
    setAmount((prev) => {
      if (key === 'C') return '0';
      if (key === 'backspace') {
        const next = prev.slice(0, -1);
        return next === '' ? '0' : next;
      }
      if (key === '.') {
        if (prev.includes('.')) return prev;
        return prev + '.';
      }
      if (prev === '0' && key !== '.') return key;
      const parts = prev.split('.');
      if (parts.length === 2 && parts[1].length >= 2) return prev;
      if (prev.replace('.', '').length >= 10) return prev;
      return prev + key;
    });
  }, []);

  const doSave = async () => {
    const numAmount = parseFloat(amount);
    if (numAmount <= 0 || !accountId) return false;
    if (type === 'transfer' && !toAccountId) return false;
    if (type === 'transfer' && accountId === toAccountId) return false;

    const txnData = {
      amount: numAmount,
      type,
      name,
      note: note || undefined,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      categoryId: type !== 'transfer' ? categoryId : undefined,
      date: date,
    };

    // console.log('[AddTransaction] Saving:', txnData);

    if (isEditing) {
      const result = await updateTransaction(editId, txnData);
      if (!result.success) {
        console.error('Update failed:', result.error);
        return false;
      }
    } else {
      const result = await createTransaction(txnData);
      if (!result.success) {
        if (result.blocked) {
          console.warn('Blocked:', result.reason);
        } else {
          console.error('Create failed:', result.error);
        }
        return false;
      }
    }

    // Refresh all global state (Insights, Wallets, Transactions, etc)
    refreshAllData();

    return true;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const ok = await doSave();
      if (ok) {
        if (returnDate) {
          navigate('/calendar?returnDate=' + returnDate, { replace: true });
        } else if (returnMonth) {
          navigate('/calendar?returnMonth=' + returnMonth, { replace: true });
        } else {
          navigate(-1);
        }
      }
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndAnother = async () => {
    setSaving(true);
    try {
      const ok = await doSave();
      if (ok) {
        setSavedCount((c) => c + 1);
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 1200);
        resetForm();
      }
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    const result = await deleteTransaction(editId);
    if (!result.success) {
      console.error('Delete failed:', result.error);
      return;
    }
    refreshAllData();
    if (returnDate) {
      navigate('/calendar?returnDate=' + returnDate, { replace: true });
    } else if (returnMonth) {
      navigate('/calendar?returnMonth=' + returnMonth, { replace: true });
    } else {
      navigate(-1);
    }
  };

  const handleApplyTemplate = (t) => {
    setType(t.type);
    setAmount(String(t.amount));
    setName(t.title);
    setCategoryId(t.categoryId || null);
    if (t.defaultAccountId) setAccountId(t.defaultAccountId);
    setShowTemplates(false);
  };

  const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'];

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed inset-0 bg-[var(--color-bg)] z-50 flex flex-col safe-top safe-bottom"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => {
            if (returnDate) navigate('/calendar?returnDate=' + returnDate);
            else if (returnMonth) navigate('/calendar?returnMonth=' + returnMonth);
            else navigate(-1);
          }}
          className="p-2 rounded-2xl min-w-touch min-h-touch flex items-center justify-center active:scale-90 transition-transform"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex bg-[var(--color-surface)] rounded-2xl p-1 gap-0.5">
          {TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => { setType(t.key); setCategoryId(null); }}
              className={'px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all ' +
                (type === t.key ? t.activeBg + ' ' + t.color : 'text-[var(--color-muted)]')
              }
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {isEditing ? (
            <button onClick={handleDelete} className="p-2 rounded-2xl text-[var(--color-danger)] min-w-touch min-h-touch flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setShowTemplates(true)}
              className="p-2 rounded-2xl min-w-touch min-h-touch flex items-center justify-center active:scale-90 transition-transform"
            >
              <FileText className="w-5 h-5 text-[var(--color-primary)]" />
            </button>
          )}
        </div>
      </div>

      {/* Saved counter badge */}
      <AnimatePresence>
        {savedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-1"
          >
            <div className={'flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold transition-colors ' +
              (justSaved ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]' : 'bg-[var(--color-surface)] text-[var(--color-muted)]')
            }>
              <CheckCheck className="w-3.5 h-3.5" />
              {savedCount} saved
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Amount Display */}
      <div className="px-6 py-3 text-center">
        <p className={'text-[42px] font-bold tracking-tight ' +
          (type === 'expense' ? 'text-[var(--color-danger)]' : type === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-primary)]')
        }>
          {type === 'expense' ? '-' : type === 'income' ? '+' : ''}{formatCurrency(parseFloat(amount) || 0)}
        </p>
      </div>

      {/* Name Input */}
      <div className="px-4 mb-2">
        <input
          ref={nameRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What was this for?"
          className="w-full px-4 py-3 rounded-2xl bg-[var(--color-card)] text-center text-[15px] font-medium placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all ios-card"
        />
      </div>

      {/* Notes toggle + input */}
      <div className="px-4 mb-2">
        {!showNotes ? (
          <button
            onClick={() => setShowNotes(true)}
            className="flex items-center gap-1.5 text-[12px] text-[var(--color-muted)] px-1 py-1"
          >
            <StickyNote className="w-3.5 h-3.5" /> Add note
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              autoFocus
              className="w-full px-4 py-2.5 rounded-2xl bg-[var(--color-card)] text-center text-[13px] placeholder:text-[var(--color-muted)] focus:outline-none ios-card"
            />
          </motion.div>
        )}
      </div>

      {/* Category Chips + Account + Date */}
      <div className="px-4 space-y-2 mb-2">
        {type !== 'transfer' && categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setCategoryId(null)}
              className={'shrink-0 px-3.5 py-2 rounded-2xl text-[13px] font-medium transition-all ' +
                (!categoryId ? 'gradient-primary text-white' : 'bg-[var(--color-card)] text-[var(--color-muted)] ios-card')
              }
            >
              None
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setCategoryId(cat._id)}
                className={'shrink-0 px-3.5 py-2 rounded-2xl text-[13px] font-medium transition-all flex items-center gap-1.5 ' +
                  (categoryId === cat._id ? 'gradient-primary text-white' : 'bg-[var(--color-card)] text-[var(--color-muted)] ios-card')
                }
              >
                <LucideIcon name={cat.icon} className="w-3.5 h-3.5" style={{ color: categoryId === cat._id ? '#fff' : cat.color }} />
                {cat.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <select
            value={accountId || ''}
            onChange={(e) => setAccountId(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-2xl bg-[var(--color-card)] text-[13px] focus:outline-none ios-card"
          >
            {accounts.map((a) => (
              <option key={a._id} value={a._id}>{a.name}</option>
            ))}
          </select>
          {type === 'transfer' && (
            <select
              value={toAccountId || ''}
              onChange={(e) => setToAccountId(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-2xl bg-[var(--color-card)] text-[13px] focus:outline-none ios-card"
            >
              {accounts.filter((a) => a._id !== accountId).map((a) => (
                <option key={a._id} value={a._id}>{a.name}</option>
              ))}
            </select>
          )}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-[var(--color-card)] text-[13px] focus:outline-none w-auto ios-card"
          />
        </div>
      </div>

      {/* Keypad */}
      <div className="mt-auto px-4 pb-4">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {keypadKeys.map((key) => (
            <button
              key={key}
              onClick={() => key === 'backspace' ? handleKeyPress('backspace') : handleKeyPress(key)}
              className="h-[48px] rounded-2xl bg-[var(--color-card)] flex items-center justify-center text-xl font-semibold active:bg-[var(--color-surface)] transition-colors ios-card"
            >
              {key === 'backspace' ? <Delete className="w-5 h-5 text-[var(--color-muted)]" /> : key}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <button
              onClick={handleSaveAndAnother}
              disabled={saving || parseFloat(amount) <= 0}
              className="flex-1 py-3.5 rounded-2xl bg-[var(--color-card)] border border-[var(--color-primary)]/30 text-[var(--color-primary)] font-bold text-[15px] active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Repeat className="w-4 h-4" /> Save & Next
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || parseFloat(amount) <= 0}
            className={(isEditing ? 'w-full' : 'flex-1') + ' py-3.5 rounded-2xl gradient-primary text-white font-bold text-[15px] active:scale-[0.98] transition-transform disabled:opacity-50'}
          >
            {saving ? 'Saving...' : isEditing ? 'Update' : (savedCount > 0 ? 'Save & Done' : 'Save Entry')}
          </button>
        </div>
      </div>

      {/* Template Picker Sheet */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-end justify-center"
            onClick={() => setShowTemplates(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-card)] rounded-t-3xl w-full max-w-lg pb-8 max-h-[60vh]"
            >
              <div className="w-10 h-1 bg-[var(--color-border)] rounded-full mx-auto mt-3 mb-4" />
              <h3 className="text-lg font-bold text-center mb-4">Use Template</h3>
              {templates.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Repeat className="w-8 h-8 text-[var(--color-muted)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--color-muted)]">No templates yet</p>
                  <p className="text-xs text-[var(--color-muted)] mt-1 mb-4">Create one to speed up adding entries</p>
                  <button
                    onClick={() => { setShowTemplates(false); navigate('/templates'); }}
                    className="px-5 py-2.5 rounded-2xl gradient-primary text-white text-[13px] font-semibold"
                  >
                    Create Template
                  </button>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[40vh] px-4 space-y-1.5">
                  {templates.map((t) => {
                    const cat = catMap[t.categoryId];
                    return (
                      <button
                        key={t._id}
                        onClick={() => handleApplyTemplate(t)}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[var(--color-surface)] active:bg-[var(--color-border)] transition-colors"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: (cat?.color || '#007AFF') + '15' }}
                        >
                          {cat ? <LucideIcon name={cat.icon} className="w-5 h-5" style={{ color: cat.color }} /> : <Repeat className="w-5 h-5 text-[var(--color-primary)]" />}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-[14px] font-semibold truncate">{t.title}</p>
                          <p className="text-[11px] text-[var(--color-muted)]">{cat?.name || t.type}</p>
                        </div>
                        <p className={'text-[14px] font-bold ' + (t.type === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]')}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </p>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => { setShowTemplates(false); navigate('/templates'); }}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-[var(--color-border)] text-[13px] font-semibold text-[var(--color-primary)] active:bg-[var(--color-surface)] transition-colors mt-2"
                  >
                    <Plus className="w-4 h-4" /> New Template
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
