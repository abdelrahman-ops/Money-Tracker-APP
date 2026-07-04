import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import { useWalletStore } from '../store/walletStore';
import { useCategoryStore } from '../store/categoryStore';
import { useTransactionStore } from '../store/transactionStore';
import { createTransaction, updateTransaction, deleteTransaction, fetchTransaction } from '../services/transactionService';
import { fetchTemplates as apiFetchTemplates } from '../services/apiServices';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Delete, Calendar, FileText, Repeat, StickyNote, CheckCheck,
  ChevronRight, ChevronDown, ArrowDownCircle, ArrowUpCircle, RefreshCw, FolderOpen
} from 'lucide-react';
import LucideIcon from '../components/LucideIcon';
import { refreshAllData } from '../utils/refreshData';

const TYPES = [
  { key: 'expense', label: 'Expense', color: '#FF3B30', bgLight: '#FFF0EF', icon: ArrowDownCircle },
  { key: 'income', label: 'Income', color: '#22c55e', bgLight: '#EEFBF3', icon: ArrowUpCircle },
  { key: 'transfer', label: 'Transfer', color: '#007AFF', bgLight: '#EDF4FF', icon: RefreshCw },
];

export default function AddTransaction() {
  const navigate = useNavigate();
  const { editId } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = !!editId;
  const noteRef = useRef(null);

  const returnMonth = searchParams.get('returnMonth');
  const returnDate = searchParams.get('returnDate');

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
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showAccountSheet, setShowAccountSheet] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [justSaved, setJustSaved] = useState(false);
  const [shakeAmount, setShakeAmount] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const categories = allCategories.filter((c) => c.type === type);
  const catMap = {};
  allCategories.forEach((c) => { catMap[c._id] = c; });
  const activeCategory = categoryId ? catMap[categoryId] : null;
  const activeType = TYPES.find((t) => t.key === type);
  const activeAccount = accounts.find((a) => a._id === accountId);

  useEffect(() => { apiFetchTemplates().then(setTemplates).catch(() => {}); }, []);

  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      const paramAccountId = searchParams.get('accountId');
      setAccountId(paramAccountId || accounts[0]._id);
      if (accounts.length > 1) setToAccountId(accounts[1]._id);
    }
  }, [accounts, accountId, searchParams]);

  useEffect(() => {
    const pAmt = searchParams.get('amount');
    const pName = searchParams.get('name');
    const pCat = searchParams.get('categoryId');
    if (pAmt) setAmount(pAmt);
    if (pName) setName(pName);
    if (pCat) setCategoryId(pCat);
  }, [searchParams]);

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
  }, [editId, isEditing]);

  const resetForm = () => { setAmount('0'); setName(''); setNote(''); setCategoryId(null); setShowNotes(false); };
  const triggerShake = () => { setShakeAmount(true); setTimeout(() => setShakeAmount(false), 500); };

  const doSave = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) { triggerShake(); return false; }
    if (!accountId) return false;
    if (type === 'transfer' && !toAccountId) return false;
    if (type === 'transfer' && accountId === toAccountId) return false;

    const txnData = {
      amount: numAmount, type,
      name: name.trim() || (type === 'transfer' ? 'Transfer' : activeCategory?.name || 'Other'),
      note: note.trim() || undefined, accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      categoryId: type !== 'transfer' ? categoryId : undefined,
      date,
    };

    if (isEditing) { const r = await updateTransaction(editId, txnData); if (!r.success) return false; }
    else { const r = await createTransaction(txnData); if (!r.success) return false; }
    refreshAllData();
    return true;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const ok = await doSave();
      if (ok) {
        setShowSuccessOverlay(true);
        setTimeout(() => {
          if (returnDate) navigate('/calendar?returnDate=' + returnDate, { replace: true });
          else if (returnMonth) navigate('/calendar?returnMonth=' + returnMonth, { replace: true });
          else navigate('/dashboard', { replace: true });
        }, 800);
      }
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleSaveAndAnother = async () => {
    setSaving(true);
    try {
      const ok = await doSave();
      if (ok) { setSavedCount((c) => c + 1); setJustSaved(true); setTimeout(() => setJustSaved(false), 1200); resetForm(); }
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    const result = await deleteTransaction(editId);
    if (!result.success) return;
    refreshAllData();
    if (returnDate) navigate('/calendar?returnDate=' + returnDate, { replace: true });
    else if (returnMonth) navigate('/calendar?returnMonth=' + returnMonth, { replace: true });
    else navigate('/dashboard', { replace: true });
  };

  const handleApplyTemplate = (t) => {
    setType(t.type); setAmount(String(t.amount)); setName(t.title);
    setCategoryId(t.categoryId || null);
    if (t.defaultAccountId) setAccountId(t.defaultAccountId);
    setShowTemplates(false);
  };

  // Keypad handler
  const handleKeyPress = (key) => {
    if (key === 'backspace') {
      setAmount((prev) => {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      });
    } else if (key === '.') {
      if (amount.includes('.')) return;
      setAmount((prev) => prev + '.');
    } else {
      setAmount((prev) => {
        if (prev === '0') return key;
        // Max 2 decimal digits
        const parts = prev.split('.');
        if (parts[1] && parts[1].length >= 2) return prev;
        if (prev.length >= 12) return prev;
        return prev + key;
      });
    }
  };

  const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'];
  const visibleCategories = categories.slice(0, 7);
  const hasMoreCategories = categories.length > 7;

  // Format display amount
  const getAmountFontSize = () => {
    if (amount.length > 10) return 'text-[26px]';
    if (amount.length > 7) return 'text-[32px]';
    return 'text-[40px]';
  };

  const formatDisplayDate = (d) => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (d === today) return 'Today';
    if (d === yesterday) return 'Yesterday';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-50 flex flex-col safe-top safe-bottom select-none"
      style={{ backgroundColor: activeType.bgLight }}
    >
      {/* ─── Top Bar ─── */}
      <div className="flex items-center justify-between px-4 py-2.5 shrink-0">
        <button
          onClick={() => {
            if (returnDate) navigate('/calendar?returnDate=' + returnDate);
            else if (returnMonth) navigate('/calendar?returnMonth=' + returnMonth);
            else navigate(-1);
          }}
          className="w-9 h-9 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-all"
        >
          <X className="w-4.5 h-4.5 text-gray-600" />
        </button>

        <h2 className="text-[15px] font-semibold text-gray-700">
          {isEditing ? 'Edit Transaction' : 'New Transaction'}
        </h2>

        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <button onClick={handleDelete} className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center active:scale-90 transition-all">
              <Delete className="w-4.5 h-4.5 text-red-500" />
            </button>
          ) : (
            <button onClick={() => setShowTemplates(true)} className="w-9 h-9 rounded-full bg-white/60 flex items-center justify-center active:scale-90 transition-all">
              <FileText className="w-4.5 h-4.5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* ─── Type Tabs ─── */}
      <div className="flex gap-2 px-4 mb-3 shrink-0">
        {TYPES.map((t) => {
          const Icon = t.icon;
          const active = type === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setType(t.key); setCategoryId(null); }}
              className="flex-1 py-2 rounded-2xl flex items-center justify-center gap-1.5 text-[13px] font-medium transition-all active:scale-[0.97]"
              style={{
                backgroundColor: active ? t.color : 'rgba(255,255,255,0.55)',
                color: active ? '#fff' : '#6b7280',
                boxShadow: active ? `0 4px 14px -4px ${t.color}40` : 'none',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ─── Meta Row: Date + Note + Account ─── */}
      <div className="flex gap-2 px-4 mb-3 shrink-0">
        {/* Date chip */}
        <label className="relative flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/60 backdrop-blur-sm cursor-pointer active:scale-[0.98] transition-all">
          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-[12px] text-gray-600 font-medium truncate">{formatDisplayDate(date)}</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </label>

        {/* Note chip */}
        <button
          onClick={() => { setShowNotes(!showNotes); if (!showNotes) setTimeout(() => noteRef.current?.focus(), 150); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl active:scale-[0.98] transition-all"
          style={{ backgroundColor: note ? `${activeType.color}15` : 'rgba(255,255,255,0.55)' }}
        >
          <StickyNote className="w-3.5 h-3.5" style={{ color: note ? activeType.color : '#9ca3af' }} />
          <span className="text-[12px] font-medium truncate max-w-[60px]" style={{ color: note ? activeType.color : '#6b7280' }}>
            {note || 'Note'}
          </span>
        </button>

        {/* Account chip */}
        <button
          onClick={() => setShowAccountSheet(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/60 backdrop-blur-sm active:scale-[0.98] transition-all"
        >
          <span className="w-5 h-5 rounded-md text-[9px] font-bold flex items-center justify-center shrink-0" style={{ backgroundColor: `${activeType.color}15`, color: activeType.color }}>
            {activeAccount?.name?.charAt(0) || '?'}
          </span>
          <span className="text-[12px] text-gray-600 font-medium truncate max-w-[60px]">{activeAccount?.name || 'Account'}</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>
      </div>

      {/* ─── Note Expansion ─── */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="px-4 mb-2 shrink-0 overflow-hidden"
          >
            <input
              ref={noteRef}
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/70 text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Description Input ─── */}
      <div className="px-4 mb-2 shrink-0">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={type === 'transfer' ? 'Transfer note...' : 'What was it for?'}
          className="w-full px-4 py-2.5 rounded-xl bg-white/70 text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all text-center"
        />
      </div>

      {/* ─── Saved count pill ─── */}
      <AnimatePresence>
        {savedCount > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex justify-center mb-1 shrink-0"
          >
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium shadow-sm transition-colors ${
              justSaved ? 'bg-emerald-500 text-white' : 'bg-white/60 text-gray-500'
            }`}>
              <CheckCheck className="w-3.5 h-3.5" />
              {savedCount} saved
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Amount Display ─── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 shrink min-h-0">
        <motion.div
          animate={shakeAmount ? { x: [0, -8, 8, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-baseline justify-center"
        >
          <span className={`${getAmountFontSize()} font-bold tracking-tight`} style={{ color: activeType.color }}>
            {type === 'expense' ? '-' : type === 'income' ? '+' : ''}
            {amount === '0' ? '0' : amount}
          </span>
        </motion.div>

        {/* Category Scroll (non-transfer only) */}
        {type !== 'transfer' && categories.length > 0 && (
          <div className="w-full mt-4">
            <div className="flex gap-2 overflow-x-auto pb-1 px-1" style={{ scrollbarWidth: 'none' }}>
              {visibleCategories.map((cat) => {
                const isSelected = categoryId === cat._id;
                return (
                  <button
                    key={cat._id}
                    onClick={() => setCategoryId(cat._id)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-95"
                    style={{
                      backgroundColor: isSelected ? cat.color : 'rgba(255,255,255,0.65)',
                      color: isSelected ? '#fff' : '#4b5563',
                      boxShadow: isSelected ? `0 3px 10px -3px ${cat.color}50` : 'none',
                    }}
                  >
                    <LucideIcon name={cat.icon} className="w-3.5 h-3.5" style={{ color: isSelected ? '#fff' : cat.color }} />
                    <span className="text-[11px] font-medium whitespace-nowrap">{cat.name}</span>
                  </button>
                );
              })}
              {hasMoreCategories && (
                <button
                  onClick={() => setShowCategorySheet(true)}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/50 text-gray-400 active:scale-95 transition-all"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">More</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Transfer destination account */}
        {type === 'transfer' && (
          <div className="w-full mt-4">
            <p className="text-[11px] text-gray-400 font-medium text-center mb-2">To Account</p>
            <div className="flex gap-2 justify-center">
              {accounts.filter((a) => a._id !== accountId).map((acc) => (
                <button
                  key={acc._id}
                  onClick={() => setToAccountId(acc._id)}
                  className="px-4 py-2 rounded-xl text-[12px] font-medium transition-all active:scale-95"
                  style={{
                    backgroundColor: toAccountId === acc._id ? activeType.color : 'rgba(255,255,255,0.65)',
                    color: toAccountId === acc._id ? '#fff' : '#4b5563',
                  }}
                >
                  {acc.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Keypad + Save ─── */}
      <div className="bg-white rounded-t-[28px] shadow-[0_-4px_30px_rgba(0,0,0,0.06)] shrink-0 pb-2">
        <div className="grid grid-cols-3 gap-px px-3 pt-3 pb-1.5">
          {keypadKeys.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="h-[52px] rounded-2xl flex items-center justify-center active:scale-[0.93] active:bg-gray-100 transition-all"
            >
              {key === 'backspace' ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
              ) : (
                <span className="text-[20px] font-medium text-gray-700">{key}</span>
              )}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 px-4 pb-2 pt-1">
          {!isEditing && (
            <button
              onClick={handleSaveAndAnother}
              disabled={saving || parseFloat(amount) <= 0}
              className="flex-1 py-3.5 rounded-2xl text-[14px] font-semibold flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all disabled:opacity-40 border"
              style={{ borderColor: `${activeType.color}30`, color: activeType.color, backgroundColor: `${activeType.color}08` }}
            >
              <Repeat className="w-4 h-4" /> Save & Next
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || parseFloat(amount) <= 0}
            className={`${isEditing ? 'w-full' : 'flex-1'} py-3.5 rounded-2xl text-white text-[14px] font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-40`}
            style={{ backgroundColor: activeType.color, boxShadow: `0 6px 20px -6px ${activeType.color}50` }}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isEditing ? 'Update' : savedCount > 0 ? 'Save & Done' : 'Save'}
          </button>
        </div>
      </div>

      {/* ─── Category Bottom Sheet ─── */}
      <AnimatePresence>
        {showCategorySheet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-end" onClick={() => setShowCategorySheet(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-[28px] w-full max-w-lg pb-8 max-h-[70vh] flex flex-col shadow-2xl">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
              <div className="flex items-center justify-between px-5 mb-3">
                <h3 className="text-[16px] font-semibold text-gray-800">All Categories</h3>
                <button onClick={() => setShowCategorySheet(false)} className="p-1.5 rounded-full bg-gray-100 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto px-5 grid grid-cols-4 gap-3 pb-6">
                {categories.map((cat) => {
                  const isSelected = categoryId === cat._id;
                  return (
                    <button key={cat._id} onClick={() => { setCategoryId(cat._id); setShowCategorySheet(false); }}
                      className="flex flex-col items-center gap-1.5 p-1.5 rounded-2xl active:scale-95 transition-transform">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all"
                        style={{ backgroundColor: isSelected ? cat.color : `${cat.color}15` }}>
                        <LucideIcon name={cat.icon} className="w-5 h-5" style={{ color: isSelected ? '#fff' : cat.color }} />
                      </div>
                      <span className="text-[10px] font-medium truncate max-w-full text-gray-600">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Account Bottom Sheet ─── */}
      <AnimatePresence>
        {showAccountSheet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-end" onClick={() => setShowAccountSheet(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-[28px] w-full max-w-lg pb-8 flex flex-col shadow-2xl">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
              <h3 className="text-[16px] font-semibold text-gray-800 text-center mb-3">Select Account</h3>
              <div className="px-5 space-y-2 pb-4">
                {accounts.map((acc) => (
                  <button key={acc._id} onClick={() => { setAccountId(acc._id); setShowAccountSheet(false); }}
                    className={`w-full p-4 rounded-2xl text-left flex justify-between items-center active:scale-[0.98] transition-all ${
                      accountId === acc._id ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 border-2 border-transparent'
                    }`}>
                    <div>
                      <p className="text-[14px] font-medium text-gray-800">{acc.name}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">{formatCurrency(acc.balance || 0)}</p>
                    </div>
                    {accountId === acc._id && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Templates Modal ─── */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-end" onClick={() => setShowTemplates(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-[28px] w-full max-w-lg pb-8 max-h-[70vh] flex flex-col shadow-2xl">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
              <h3 className="text-[16px] font-semibold text-gray-800 text-center mb-3">Templates</h3>
              <div className="overflow-y-auto px-5 space-y-2 pb-4">
                {templates.length === 0 ? (
                  <p className="text-center py-6 text-[13px] text-gray-400">No templates yet</p>
                ) : (
                  templates.map((t) => (
                    <button key={t._id} onClick={() => handleApplyTemplate(t)}
                      className="w-full p-4 rounded-2xl bg-gray-50 text-left flex justify-between items-center active:scale-[0.98] transition-all">
                      <div>
                        <p className="text-[14px] font-medium text-gray-800">{t.title}</p>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">{t.type}</p>
                      </div>
                      <span className="text-[14px] font-semibold" style={{ color: activeType.color }}>{formatCurrency(t.amount)}</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Success Overlay ─── */}
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-white">
            <motion.div initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 15 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg"
              style={{ backgroundColor: activeType.color }}>
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.15 }}
                  strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-lg font-semibold">
              {isEditing ? 'Updated!' : 'Saved!'}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
