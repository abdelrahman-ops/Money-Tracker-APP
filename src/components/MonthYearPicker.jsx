import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function MonthYearPicker({ currentMonth, currentYear, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentYear);
  const ref = useRef(null);

  useEffect(() => {
    setPickerYear(currentYear);
  }, [currentYear]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (monthIdx) => {
    onChange(monthIdx, pickerYear);
    setIsOpen(false);
  };

  const goToToday = () => {
    const now = new Date();
    onChange(now.getMonth(), now.getFullYear());
    setIsOpen(false);
  };

  const monthLabel = MONTHS_FULL[currentMonth];
  const isCurrentMonthYear = currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();

  return (
    <div className="relative flex justify-center w-full" ref={ref}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 haptic active:opacity-70 transition-opacity"
      >
        <span className="text-[18px] font-bold tracking-tight">{monthLabel} {currentYear}</span>
        <ChevronDown className={`w-4 h-4 text-[var(--color-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Picker Modal / Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Quick invisible backdrop to catch outside clicks on mobile smoothly */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0, duration: 0.2 }}
              className="absolute top-full mt-2 z-50 bg-[var(--color-card)] rounded-[24px] shadow-2xl border border-[var(--color-border)] p-4 sm:p-5 w-[calc(100vw-32px)] max-w-[320px] origin-top"
            >
              {/* Year Row */}
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <button
                  onClick={() => setPickerYear(pickerYear - 1)}
                  className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[var(--color-surface)] flex items-center justify-center haptic active:scale-90 transition-transform"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4 text-[var(--color-text)]" />
                </button>
                <span className="text-[17px] sm:text-[16px] font-bold">{pickerYear}</span>
                <button
                  onClick={() => setPickerYear(pickerYear + 1)}
                  className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[var(--color-surface)] flex items-center justify-center haptic active:scale-90 transition-transform"
                >
                  <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4 text-[var(--color-text)]" />
                </button>
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {MONTHS.map((m, idx) => {
                  const isSelected = idx === currentMonth && pickerYear === currentYear;
                  const isNow = idx === new Date().getMonth() && pickerYear === new Date().getFullYear();
                  return (
                    <button
                      key={m}
                      onClick={() => handleSelect(idx)}
                      className={`py-3 sm:py-2.5 rounded-2xl sm:rounded-xl text-[14px] sm:text-[13px] font-semibold transition-all haptic active:scale-95 ${
                        isSelected
                          ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/30'
                          : isNow
                            ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold'
                            : 'text-[var(--color-text)] hover:bg-[var(--color-surface)] active:bg-[var(--color-surface)]'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>

              {/* Today shortcut */}
              {!isCurrentMonthYear && (
                <button
                  onClick={goToToday}
                  className="w-full mt-4 sm:mt-3 py-3 sm:py-2.5 rounded-2xl sm:rounded-xl text-[14px] sm:text-[13px] font-bold text-white bg-[var(--color-primary)] haptic active:scale-[0.98] transition-transform shadow-lg shadow-[var(--color-primary)]/30"
                >
                  Jump to Today
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
