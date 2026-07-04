import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  AlertTriangle,
  Repeat,
  Info,
  Sliders,
  CheckCircle,
  X,
  Target,
  ArrowRight,
  Sparkles,
  Bookmark
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { useAppStore } from '../store/appStore';
import { useCategoryStore } from '../store/categoryStore';
import {
  fetchBudgetSummary,
  upsertBudget,
  deleteBudget,
  copyBudgetsForward
} from '../services/budgetService';
import LucideIcon from '../components/LucideIcon';
import MonthYearPicker from '../components/MonthYearPicker';

export default function Budgets() {
  const navigate = useNavigate();
  const balanceVisible = useAppStore((s) => s.balanceVisible);
  const categories = useCategoryStore((s) => s.categories);

  // Month navigation
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Bottom Sheet State
  const [showEditor, setShowEditor] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null); // null means new

  // Form states
  const [budgetType, setBudgetType] = useState('category');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [budgetName, setBudgetName] = useState('');
  const [rollover, setRollover] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [isRecurring, setIsRecurring] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copyStatus, setCopyStatus] = useState(null); // 'success' | 'error' | null

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  const prevMonthKey = useMemo(() => {
    const d = new Date(year, month - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, [year, month]);

  const catMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c._id] = c;
    });
    return map;
  }, [categories]);

  const loadSummary = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBudgetSummary(monthKey);
      setSummaryData(data);
    } catch (e) {
      console.error('Failed to load budget summary:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey]);

  const handleMonthYearChange = (monthIdx, yr) => {
    setCurrentMonth(new Date(yr, monthIdx, 1));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const openNewBudget = () => {
    setEditingBudget(null);
    setBudgetType('category');
    setSelectedCategoryId(categories.length > 0 ? categories[0]._id : '');
    setBudgetLimit('');
    setBudgetName('');
    setRollover(false);
    setAlertThreshold(80);
    setIsRecurring(true);
    setShowEditor(true);
  };

  const openEditBudget = (budget) => {
    setEditingBudget(budget);
    setBudgetType(budget.type);
    setSelectedCategoryId(budget.categoryId || '');
    setBudgetLimit(String(budget.limit));
    setBudgetName(budget.name || '');
    setRollover(budget.rollover || false);
    setAlertThreshold(budget.alertThreshold || 80);
    setIsRecurring(budget.isRecurring !== false);
    setShowEditor(true);
  };

  const handleSaveBudget = async () => {
    const limitNum = parseFloat(budgetLimit);
    if (isNaN(limitNum) || limitNum <= 0) return;
    if (budgetType === 'category' && !selectedCategoryId) return;

    setIsSaving(true);
    try {
      await upsertBudget({
        name: budgetName.trim() || undefined,
        type: budgetType,
        categoryId: budgetType === 'category' ? selectedCategoryId : null,
        monthKey,
        limit: limitNum,
        rollover,
        alertThreshold,
        isRecurring,
      });
      setShowEditor(false);
      loadSummary();
    } catch (e) {
      console.error('Failed to save budget:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!editingBudget) return;
    if (!window.confirm('Are you sure you want to delete this budget?')) return;

    setIsSaving(true);
    try {
      await deleteBudget(editingBudget._id);
      setShowEditor(false);
      loadSummary();
    } catch (e) {
      console.error('Failed to delete budget:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyForward = async () => {
    setIsCopying(true);
    setCopyStatus(null);
    try {
      const res = await copyBudgetsForward(prevMonthKey, monthKey);
      if (res.copiedCount > 0) {
        setCopyStatus('success');
        setTimeout(() => setCopyStatus(null), 2000);
        loadSummary();
      } else {
        alert('No budgets found in the previous month to copy.');
      }
    } catch (e) {
      console.error('Failed to copy budgets forward:', e);
      setCopyStatus('error');
    } finally {
      setIsCopying(false);
    }
  };

  // Split budgets into total vs category-specific
  const totalBudgetObj = useMemo(() => {
    if (!summaryData) return null;
    return summaryData.budgets.find((b) => b.type === 'total');
  }, [summaryData]);

  const categoryBudgets = useMemo(() => {
    if (!summaryData) return [];
    return summaryData.budgets.filter((b) => b.type === 'category');
  }, [summaryData]);

  return (
    <div className="px-4 pt-5 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-black tracking-tight">Budgets</h1>
          <p className="text-[12px] text-[var(--color-muted)] font-semibold mt-0.5">
            Plan and monitor your spending limits
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={openNewBudget}
          className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-95 haptic"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </motion.button>
      </div>

      {/* Month Year Selection Header */}
      <div className="flex items-center justify-between bg-[var(--color-card)] border border-[var(--color-border)]/55 rounded-[22px] p-3 mb-6 shadow-sm">
        <button
          onClick={handlePrevMonth}
          className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]/20 flex items-center justify-center haptic active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <MonthYearPicker
          currentMonth={month}
          currentYear={year}
          onChange={handleMonthYearChange}
        />
        <button
          onClick={handleNextMonth}
          className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]/20 flex items-center justify-center haptic active:scale-90 transition-transform"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-32 bg-[var(--color-card)] border border-[var(--color-border)]/45 rounded-3xl animate-pulse" />
          <div className="h-6 w-32 bg-[var(--color-surface)] rounded-full animate-pulse mt-6" />
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 bg-[var(--color-card)] border border-[var(--color-border)]/45 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Overall Monthly Budget Card */}
          {totalBudgetObj ? (
            <motion.div
              whileHover={{ scale: 1.01 }}
              onClick={() => openEditBudget(totalBudgetObj)}
              className="rounded-3xl border border-[var(--color-border)]/60 bg-gradient-to-br from-[var(--color-card)] to-[var(--color-bg)] p-5 relative overflow-hidden shadow-sm cursor-pointer"
            >
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-[var(--color-primary)]/[0.04] rounded-full pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4.5 h-4.5 text-[var(--color-primary)] animate-pulse" />
                    <span className="text-[14px] font-bold">Overall Monthly Limit</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-[var(--color-primary)] uppercase tracking-wider bg-[var(--color-primary)]/10 px-2.5 py-0.5 rounded-full">
                    Total
                  </span>
                </div>

                <div className="flex justify-between items-baseline mb-2">
                  <h2 className="text-[28px] font-black tracking-tight text-[var(--color-text)]">
                    {balanceVisible ? formatCurrency(summaryData.totalSpent) : '••••'}
                    <span className="text-[14px] font-semibold text-[var(--color-muted)]">
                      {' '}
                      / {formatCurrency(totalBudgetObj.limit)}
                    </span>
                  </h2>
                  <span className={`text-[12px] font-extrabold px-2 py-0.5 rounded-lg ${
                    totalBudgetObj.pct > 100
                      ? 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
                      : totalBudgetObj.pct > totalBudgetObj.alertThreshold
                      ? 'bg-orange-500/10 text-orange-500'
                      : 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                  }`}>
                    {Math.round(totalBudgetObj.pct)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-3 bg-[var(--color-surface)] rounded-full overflow-hidden mb-2 shadow-inner border border-[var(--color-border)]/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(totalBudgetObj.pct, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor:
                        totalBudgetObj.pct > 100
                          ? 'var(--color-danger)'
                          : totalBudgetObj.pct > totalBudgetObj.alertThreshold
                          ? '#f59e0b'
                          : 'var(--color-success)',
                    }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-[var(--color-muted)] font-semibold mt-1">
                  <span>
                    {totalBudgetObj.limit - summaryData.totalSpent >= 0
                      ? `${formatCurrency(totalBudgetObj.limit - summaryData.totalSpent)} left`
                      : `Over by ${formatCurrency(Math.abs(totalBudgetObj.limit - summaryData.totalSpent))}`}
                  </span>
                  {totalBudgetObj.alertThreshold < 100 && (
                    <span className="flex items-center gap-1">
                      <Info className="w-3 h-3" /> Alert at {totalBudgetObj.alertThreshold}%
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.01 }}
              onClick={() => {
                setEditingBudget(null);
                setBudgetType('total');
                setBudgetLimit('');
                setBudgetName('Overall Budget');
                setRollover(false);
                setAlertThreshold(85);
                setIsRecurring(true);
                setShowEditor(true);
              }}
              className="rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)]/30 hover:bg-[var(--color-card)]/60 transition-colors p-5 text-center cursor-pointer shadow-sm"
            >
              <Target className="w-8 h-8 text-[var(--color-muted)] mx-auto mb-2 opacity-50" />
              <p className="text-[14px] font-bold text-[var(--color-text)]">Set overall monthly spending cap</p>
              <p className="text-[11px] text-[var(--color-muted)] mt-1 max-w-[280px] mx-auto leading-relaxed">
                Establish a total spending ceiling for the month to stay on top of your financial health automatically.
              </p>
            </motion.div>
          )}

          {/* Empty State Banner / Copy from Prev Month */}
          {summaryData?.budgets.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--color-card)] border border-[var(--color-border)]/55 rounded-[28px] p-6 text-center shadow-sm mt-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface)] flex items-center justify-center mx-auto mb-4 border border-[var(--color-border)]/45">
                <Bookmark className="w-6 h-6 text-[var(--color-muted)]" />
              </div>
              <p className="text-[16px] font-bold">No budgets for this month</p>
              <p className="text-[12px] text-[var(--color-muted)] mt-1.5 mb-6 max-w-[280px] mx-auto leading-relaxed">
                Track limits for specific categories or copy over budgets you defined in previous months.
              </p>
              <div className="flex gap-2.5 max-w-[280px] mx-auto">
                <button
                  onClick={handleCopyForward}
                  disabled={isCopying}
                  className="flex-1 py-3 px-4 rounded-xl border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 disabled:opacity-40 text-[13px] font-bold haptic transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isCopying ? (
                    'Copying...'
                  ) : copyStatus === 'success' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-[var(--color-success)]" /> Copied!
                    </>
                  ) : (
                    <>
                      <Repeat className="w-4 h-4" /> Copy Prev Month
                    </>
                  )}
                </button>
                <button
                  onClick={openNewBudget}
                  className="flex-1 py-3 px-4 rounded-xl gradient-primary text-white text-[13px] font-bold haptic shadow-md shadow-blue-500/15"
                >
                  Create New
                </button>
              </div>
            </motion.div>
          )}

          {/* Category Budgets Grid/List */}
          {categoryBudgets.length > 0 && (
            <div className="mt-8">
              <h3 className="text-[16px] font-black tracking-tight mb-4 px-1">Category Limits</h3>
              <div className="space-y-3.5">
                {categoryBudgets.map((b) => {
                  const cat = catMap[b.categoryId];
                  const overspent = b.spent > b.limit;
                  const approaching = b.spent > b.limit * (b.alertThreshold / 100);

                  return (
                    <motion.div
                      key={b._id}
                      onClick={() => openEditBudget(b)}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      className="ios-card p-4 cursor-pointer relative overflow-hidden border border-transparent hover:border-[var(--color-border)]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                          style={{ backgroundColor: (cat?.color || '#007AFF') + '15' }}
                        >
                          {cat ? (
                            <LucideIcon name={cat.icon} className="w-5 h-5" style={{ color: cat.color }} />
                          ) : (
                            <Sliders className="w-5 h-5 text-[var(--color-primary)]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14.5px] font-bold truncate">
                            {b.name || cat?.name || 'Category Limit'}
                          </p>
                          <p className="text-[11px] text-[var(--color-muted)] font-semibold mt-0.5">
                            {balanceVisible ? formatCurrency(b.spent) : '••••'} of {formatCurrency(b.limit)} limit
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[12px] font-extrabold px-2 py-0.5 rounded-lg ${
                            overspent
                              ? 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
                              : approaching
                              ? 'bg-orange-500/10 text-orange-500'
                              : 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                          }`}>
                            {Math.round(b.pct)}%
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2 bg-[var(--color-surface)] rounded-full overflow-hidden mb-1 border border-[var(--color-border)]/5 shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(b.pct, 100)}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{
                            backgroundColor:
                              overspent
                                ? 'var(--color-danger)'
                                : approaching
                                ? '#f59e0b'
                                : cat?.color || 'var(--color-success)',
                          }}
                        />
                      </div>

                      {/* Alert warnings */}
                      <div className="flex justify-between text-[10px] font-semibold text-[var(--color-muted)] px-0.5">
                        <span>
                          {b.limit - b.spent >= 0
                            ? `${formatCurrency(b.limit - b.spent)} remaining`
                            : `Over Limit by ${formatCurrency(Math.abs(b.limit - b.spent))}`}
                        </span>
                        {overspent && (
                          <span className="text-[var(--color-danger)] flex items-center gap-0.5 animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> Over Limit
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Editor Modal Bottom Sheet */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center"
            onClick={() => setShowEditor(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-card)] rounded-t-[32px] border-t border-[var(--color-border)]/45 w-full max-w-lg pb-8 max-h-[85vh] flex flex-col shadow-2xl overflow-y-auto"
            >
              <div className="w-10 h-1 bg-[var(--color-border)]/70 rounded-full mx-auto mt-3.5 mb-4" />

              <div className="flex items-center justify-between px-6 mb-5">
                <h3 className="text-[19px] font-black tracking-tight">
                  {editingBudget ? 'Edit Limit' : 'New Spending Limit'}
                </h3>
                <button
                  onClick={() => setShowEditor(false)}
                  className="p-1.5 rounded-full bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 space-y-5">
                {/* Switcher: Category vs Total */}
                {!editingBudget && (
                  <div className="flex bg-[var(--color-surface)] border border-[var(--color-border)]/40 rounded-2xl p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => setBudgetType('category')}
                      className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold transition-all ${
                        budgetType === 'category'
                          ? 'bg-[var(--color-card)] text-[var(--color-primary)] shadow-sm'
                          : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      Category Limit
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudgetType('total')}
                      className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold transition-all ${
                        budgetType === 'total'
                          ? 'bg-[var(--color-card)] text-[var(--color-primary)] shadow-sm'
                          : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      Overall Month Cap
                    </button>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-0.5">
                    Budget Name / Label
                  </label>
                  <input
                    type="text"
                    value={budgetName}
                    onChange={(e) => setBudgetName(e.target.value)}
                    placeholder={budgetType === 'total' ? 'Overall Budget' : 'e.g. Grocery Limit'}
                    className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]/55 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 text-[14px] font-semibold text-[var(--color-text)] placeholder:text-[var(--color-muted)]"
                  />
                </div>

                {/* Category Picker (only for category budgets) */}
                {budgetType === 'category' && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-0.5">
                      Category
                    </label>
                    <div className="grid grid-cols-4 gap-2.5 bg-[var(--color-surface)] p-3.5 rounded-3xl border border-[var(--color-border)]/45">
                      {categories
                        .filter((c) => c.type === 'expense')
                        .map((cat) => {
                          const isSelected = selectedCategoryId === cat._id;
                          return (
                            <button
                              key={cat._id}
                              type="button"
                              onClick={() => setSelectedCategoryId(cat._id)}
                              disabled={editingBudget && editingBudget.categoryId === cat._id}
                              className="flex flex-col items-center gap-1.5 p-1 rounded-2xl active:scale-95 transition-transform disabled:opacity-40"
                            >
                              <div
                                className="w-11 h-11 rounded-2xl flex items-center justify-center border transition-all"
                                style={{
                                  backgroundColor: isSelected ? cat.color : `${cat.color}15`,
                                  borderColor: isSelected ? cat.color : 'transparent',
                                }}
                              >
                                <LucideIcon
                                  name={cat.icon}
                                  className="w-5 h-5"
                                  style={{ color: isSelected ? '#ffffff' : cat.color }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-center truncate max-w-full text-[var(--color-text)]">
                                {cat.name}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Limit amount */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-0.5">
                    Limit Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-bold text-[var(--color-muted)]">
                      $
                    </span>
                    <input
                      type="number"
                      value={budgetLimit}
                      onChange={(e) => setBudgetLimit(e.target.value)}
                      placeholder="Enter amount limit"
                      className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]/55 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 text-[14px] font-black text-[var(--color-text)]"
                    />
                  </div>
                </div>

                {/* Rollover Toggle */}
                <div className="flex items-center justify-between py-1 px-1 bg-[var(--color-surface)]/40 p-3 rounded-2xl border border-[var(--color-border)]/20">
                  <div>
                    <p className="text-[13.5px] font-bold">Rollover Remaining Budget</p>
                    <p className="text-[11px] text-[var(--color-muted)] font-medium mt-0.5">
                      Carry over unused limit to the next month
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRollover(!rollover)}
                    className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                      rollover ? 'bg-[var(--color-success)]' : 'bg-[var(--color-surface)] border border-[var(--color-border)]/80'
                    }`}
                  >
                    <div
                      className={`w-5.5 h-5.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        rollover ? 'translate-x-5.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Alert Threshold Slider */}
                <div className="space-y-2 bg-[var(--color-surface)]/40 p-4 rounded-3xl border border-[var(--color-border)]/20">
                  <div className="flex justify-between items-baseline px-0.5">
                    <div>
                      <p className="text-[13.5px] font-bold">Alert Threshold</p>
                      <p className="text-[10px] text-[var(--color-muted)] font-medium">
                        Warn when spending reaches this percent
                      </p>
                    </div>
                    <span className="text-[14px] font-black text-[var(--color-primary)]">
                      {alertThreshold}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                    className="w-full accent-[var(--color-primary)] cursor-pointer"
                  />
                </div>

                {/* Recurring Toggle */}
                <div className="flex items-center justify-between py-1 px-1 bg-[var(--color-surface)]/40 p-3 rounded-2xl border border-[var(--color-border)]/20">
                  <div>
                    <p className="text-[13.5px] font-bold">Recurring Budget</p>
                    <p className="text-[11px] text-[var(--color-muted)] font-medium mt-0.5">
                      Auto-renew this budget rule every month
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                      isRecurring ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface)] border border-[var(--color-border)]/80'
                    }`}
                  >
                    <div
                      className={`w-5.5 h-5.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        isRecurring ? 'translate-x-5.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3.5 pt-3">
                  {editingBudget && (
                    <button
                      type="button"
                      onClick={handleDeleteBudget}
                      disabled={isSaving}
                      className="w-12.5 h-[52px] rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 hover:bg-red-500/15 disabled:opacity-40 transition-colors haptic shadow-sm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveBudget}
                    disabled={
                      isSaving ||
                      parseFloat(budgetLimit) <= 0 ||
                      isNaN(parseFloat(budgetLimit)) ||
                      (budgetType === 'category' && !selectedCategoryId)
                    }
                    className="flex-1 h-[52px] rounded-2xl gradient-primary text-white font-extrabold text-[15px] active:scale-95 disabled:opacity-45 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-transform"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Save Budget Rule'
                    )}
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
