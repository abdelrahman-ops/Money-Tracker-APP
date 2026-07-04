import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatCurrency, formatTime, formatDateShort } from '../utils/helpers';
import { useTransactionStore } from '../store/transactionStore';
import { useCategoryStore } from '../store/categoryStore';
import { useWalletStore } from '../store/walletStore';
import { ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight, CalendarDays, Plus, StickyNote, ArrowLeftRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LucideIcon from '../components/LucideIcon';
import MonthYearPicker from '../components/MonthYearPicker';
import { useAppStore } from '../store/appStore';

export default function Transactions() {
  const balanceVisible = useAppStore((s) => s.balanceVisible);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    const rd = searchParams.get('returnDate');
    if (rd) {
      const [y, m] = rd.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    const rm = searchParams.get('returnMonth');
    if (rm) {
      const [y, m] = rm.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    const rd = searchParams.get('returnDate');
    if (rd) {
      const [y, m, d] = rd.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    const rm = searchParams.get('returnMonth');
    if (rm) {
      const [y, m] = rm.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });

  const [swipeDirection, setSwipeDirection] = useState(0);

  // Stores
  const categories = useCategoryStore((s) => s.categories);
  const allTransactions = useTransactionStore((s) => s.transactions);
  const setFilters = useTransactionStore((s) => s.setFilters);
  const wallets = useWalletStore((s) => s.wallets);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Sync date range
  useEffect(() => {
    const start = new Date(year, month, 1, 0, 0, 0, 0);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    setFilters({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      limit: 1000,
    });
  }, [year, month, setFilters]);

  // Map category IDs to objects
  const catMap = useMemo(() => {
    const m = {};
    categories.forEach((c) => { m[c._id] = c; });
    return m;
  }, [categories]);

  // Map wallet IDs to objects
  const walletMap = useMemo(() => {
    const m = {};
    wallets.forEach((w) => { m[w._id] = w; });
    return m;
  }, [wallets]);

  const handleMonthYearChange = (monthIdx, yr) => {
    setSwipeDirection(0);
    setCurrentMonth(new Date(yr, monthIdx, 1));
  };

  const txnByDate = useMemo(() => {
    const map = {};
    allTransactions.forEach((t) => {
      const key = new Date(t.date).toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [allTransactions]);

  const selectedKey = selectedDate.toDateString();
  const selectedTxns = txnByDate[selectedKey] || [];
  const selectedDayExpense = selectedTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const selectedDayIncome = selectedTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

  const monthTxnDates = useMemo(() => {
    const dates = new Set();
    allTransactions.forEach((t) => {
      const d = new Date(t.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        dates.add(d.getDate());
      }
    });
    return dates;
  }, [allTransactions, year, month]);

  const prevMonth = useCallback(() => {
    setSwipeDirection(-1);
    setCurrentMonth(new Date(year, month - 1, 1));
  }, [year, month]);

  const nextMonth = useCallback(() => {
    setSwipeDirection(1);
    setCurrentMonth(new Date(year, month + 1, 1));
  }, [year, month]);

  const goToToday = () => {
    const now = new Date();
    setSwipeDirection(0);
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isSelected = (day) => {
    return day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
  };

  const handleDayClick = (day) => {
    setSelectedDate(new Date(year, month, day));
  };

  const handleDragEnd = (e, info) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      nextMonth();
    } else if (info.offset.x > threshold) {
      prevMonth();
    }
  };

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const todayNow = new Date();
  const isCurrentMonth = year === todayNow.getFullYear() && month === todayNow.getMonth();

  const monthExpense = useMemo(() => {
    return allTransactions
      .filter(t => t.type === 'expense' && new Date(t.date).getFullYear() === year && new Date(t.date).getMonth() === month)
      .reduce((s, t) => s + t.amount, 0);
  }, [allTransactions, year, month]);

  const monthIncome = useMemo(() => {
    return allTransactions
      .filter(t => t.type === 'income' && new Date(t.date).getFullYear() === year && new Date(t.date).getMonth() === month)
      .reduce((s, t) => s + t.amount, 0);
  }, [allTransactions, year, month]);

  const returnDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  return (
    <div className="px-4 pt-4 pb-20 max-w-lg mx-auto">
      {/* Month Header with Picker */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-9 h-9 rounded-full bg-[var(--color-card)] border border-[var(--color-border)]/45 flex items-center justify-center haptic active:scale-90 transition-transform shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-[var(--color-text)]" />
        </button>
        <MonthYearPicker
          currentMonth={month}
          currentYear={year}
          onChange={handleMonthYearChange}
        />
        <button
          onClick={nextMonth}
          className="w-9 h-9 rounded-full bg-[var(--color-card)] border border-[var(--color-border)]/45 flex items-center justify-center haptic active:scale-90 transition-transform shadow-sm"
        >
          <ChevronRight className="w-5 h-5 text-[var(--color-text)]" />
        </button>
      </div>

      {!isCurrentMonth && (
        <div className="flex justify-center mb-3">
          <button
            onClick={goToToday}
            className="text-[12px] font-bold text-white bg-[var(--color-primary)] px-4 py-1.5 rounded-full haptic active:scale-95 transition-all shadow-md shadow-blue-500/15"
          >
            <CalendarDays className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
            Back to Today
          </button>
        </div>
      )}

      {/* Swipeable Calendar Grid */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 rounded-[24px] mb-4 overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 px-3 pt-4 pb-1 border-b border-[var(--color-border)]/20 bg-[var(--color-surface)]/30">
          {weekDays.map((d, i) => (
            <div key={i} className="text-center text-[11px] font-black text-[var(--color-muted)] uppercase tracking-wider">{d}</div>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${year}-${month}`}
            initial={{ x: swipeDirection * 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: swipeDirection * -200, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className="grid grid-cols-7 gap-y-1 px-3 pb-4 pt-3 cursor-grab active:cursor-grabbing"
          >
            {Array.from({ length: firstDayOfWeek }, (_, i) => (
              <div key={'empty-' + i} className="h-11" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const hasTxn = monthTxnDates.has(day);
              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <div key={day} className="flex justify-center">
                  <button
                    onClick={() => handleDayClick(day)}
                    className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-2xl text-[14px] transition-all haptic ${
                      selected
                        ? 'bg-[var(--color-primary)] text-white font-black shadow-lg shadow-blue-500/25'
                        : today
                          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-black border border-[var(--color-primary)]/20'
                          : 'text-[var(--color-text)] font-semibold hover:bg-[var(--color-surface)]/60'
                    }`}
                  >
                    {day}
                    {hasTxn && (
                      <div className={`absolute bottom-1 w-1 h-1 rounded-full ${selected ? 'bg-white/85' : 'bg-[var(--color-primary)]'}`} />
                    )}
                  </button>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Month Summary Bar */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 rounded-[22px] p-3.5 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/10">
            <ArrowDownLeft className="w-5 h-5 text-green-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-[var(--color-muted)] font-extrabold uppercase tracking-wider">Income</p>
            <p className="text-[15px] font-black text-[var(--color-success)] truncate mt-0.5">
              {balanceVisible ? formatCurrency(monthIncome) : '••••••'}
            </p>
          </div>
        </div>
        
        <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 rounded-[22px] p-3.5 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/10">
            <ArrowUpRight className="w-5 h-5 text-red-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-[var(--color-muted)] font-extrabold uppercase tracking-wider">Spent</p>
            <p className="text-[15px] font-black text-[var(--color-danger)] truncate mt-0.5">
              {balanceVisible ? formatCurrency(monthExpense) : '••••••'}
            </p>
          </div>
        </div>
      </div>

      {/* Selected Day Header */}
      <div className="flex items-center justify-between mb-3 mt-4 pr-1 pl-1">
        <h2 className="text-[16px] font-black tracking-tight text-[var(--color-text)]">
          {formatDateShort(selectedDate.toISOString())}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-[11px] font-extrabold tracking-tight">
            {selectedDayIncome > 0 && (
              <span className="text-[var(--color-success)] px-2 py-0.5 rounded-full bg-[var(--color-success)]/10 border border-[var(--color-success)]/10">
                +{balanceVisible ? formatCurrency(selectedDayIncome) : '••••••'}
              </span>
            )}
            {selectedDayExpense > 0 && (
              <span className="text-[var(--color-danger)] px-2 py-0.5 rounded-full bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/10">
                -{balanceVisible ? formatCurrency(selectedDayExpense) : '••••••'}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              navigate('/add?date=' + returnDateStr + '&returnDate=' + returnDateStr);
            }}
            className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 flex items-center justify-center active:scale-90 transition-all haptic"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Day Transactions */}
      {selectedTxns.length === 0 ? (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 rounded-[24px] text-center py-10 px-4 flex flex-col items-center justify-center shadow-sm">
          <CalendarDays className="w-10 h-10 text-[var(--color-muted)] mx-auto mb-3 opacity-25" />
          <p className="text-[15px] font-bold mb-1">No Entries Added</p>
          <p className="text-[12px] text-[var(--color-muted)] mb-5 max-w-[240px]">
            No records tracked for this day. Tap the button below to add one.
          </p>
          <button
            onClick={() => {
              navigate('/add?date=' + returnDateStr + '&returnDate=' + returnDateStr);
            }}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-[var(--color-primary)] text-white rounded-2xl text-[13px] font-extrabold haptic hover:opacity-90 active:scale-95 transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" strokeWidth={3} />
            Add Transaction
          </button>
        </div>
      ) : (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 rounded-[24px] overflow-hidden divide-y divide-[var(--color-border)]/40 shadow-sm">
          {selectedTxns.map((txn, idx) => {
            const cat = catMap[txn.categoryId];
            const wallet = walletMap[txn.accountId];
            const destWallet = txn.toAccountId ? walletMap[txn.toAccountId] : null;

            return (
              <motion.div
                key={txn._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, type: 'spring', damping: 20 }}
                onClick={() => navigate('/add/' + txn._id + '?returnDate=' + returnDateStr)}
                className="flex items-center gap-3.5 p-4 cursor-pointer hover:bg-[var(--color-surface)]/40 active:bg-[var(--color-surface)]/70 transition-colors"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm transition-all"
                  style={{
                    backgroundColor: (cat?.color || (txn.type === 'transfer' ? '#007AFF' : txn.type === 'income' ? '#34c759' : '#ff3b30')) + '15',
                    borderColor: (cat?.color || (txn.type === 'transfer' ? '#007AFF' : txn.type === 'income' ? '#34c759' : '#ff3b30')) + '25',
                  }}
                >
                  {cat ? (
                    <LucideIcon name={cat.icon} className="w-5.5 h-5.5" style={{ color: cat.color }} />
                  ) : txn.type === 'transfer' ? (
                    <ArrowLeftRight className="w-5 h-5 text-[var(--color-primary)]" />
                  ) : txn.type === 'income' ? (
                    <ArrowDownLeft className="w-5 h-5 text-[var(--color-success)]" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-[var(--color-danger)]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-[14.5px] truncate text-[var(--color-text)]">
                      {txn.name || (cat?.name || (txn.type === 'transfer' ? 'Transfer' : txn.type))}
                    </p>
                    {txn.note && (
                      <StickyNote className="w-3.5 h-3.5 text-[var(--color-muted)] shrink-0 opacity-70" />
                    )}
                  </div>
                  
                  {/* Account badge & details */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span className="text-[10px] text-[var(--color-muted)] font-semibold">
                      {formatTime(txn.date)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
                    <span className="text-[10px] bg-[var(--color-surface)] border border-[var(--color-border)]/50 px-1.5 py-0.5 rounded-md text-[var(--color-muted)] font-bold truncate max-w-[120px]">
                      {txn.type === 'transfer' && destWallet
                        ? `${wallet?.name || 'Account'} → ${destWallet.name}`
                        : wallet?.name || 'Account'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`text-[15px] font-black ${
                    txn.type === 'income'
                      ? 'text-[var(--color-success)]'
                      : txn.type === 'expense'
                      ? 'text-[var(--color-danger)]'
                      : 'text-[var(--color-primary)]'
                  }`}>
                    {txn.type === 'income' ? '+' : txn.type === 'expense' ? '-' : ''}
                    {balanceVisible ? formatCurrency(txn.amount) : '••••••'}
                  </p>
                  {txn.note && (
                    <p className="text-[10px] text-[var(--color-muted)] truncate max-w-[80px] mt-0.5 italic font-medium">
                      {txn.note}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
