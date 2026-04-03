import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye } from 'lucide-react';
import { useAppStore } from '../store/appStore';

export default function GlobalPasscodeModal() {
  const pendingBalanceReveal = useAppStore((s) => s.pendingBalanceReveal);
  const passcode = useAppStore((s) => s.passcode);
  const confirmBalanceReveal = useAppStore((s) => s.confirmBalanceReveal);
  const clearPendingBalanceReveal = useAppStore((s) => s.clearPendingBalanceReveal);

  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  const handlePasscodeDigit = (digit) => {
    if (passcodeInput.length >= 4) return;
    const next = passcodeInput + digit;
    setPasscodeInput(next);
    setPasscodeError(false);
    
    if (next.length === 4) {
      setTimeout(() => {
        if (next === passcode) {
          confirmBalanceReveal();
          setPasscodeInput('');
        } else {
          setPasscodeError(true);
          setPasscodeInput('');
        }
      }, 150);
    }
  };

  const handlePasscodeDelete = () => {
    setPasscodeInput((p) => p.slice(0, -1));
    setPasscodeError(false);
  };

  const cancelPasscode = () => {
    clearPendingBalanceReveal();
    setPasscodeInput('');
    setPasscodeError(false);
  };

  const passcodeKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <AnimatePresence>
      {pendingBalanceReveal && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
           onClick={cancelPasscode}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--color-card)] rounded-[32px] p-6 w-full max-w-xs shadow-2xl"
          >
            <div className="flex items-center justify-center mb-4 mt-2">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Eye className="w-7 h-7 text-white" />
              </div>
            </div>
            <h3 className="text-[20px] font-bold tracking-tight text-center mb-1">Show Balance</h3>
            <p className="text-[13px] text-[var(--color-muted)] text-center mb-6">
              Enter passcode to reveal sensitive amounts
            </p>

            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={passcodeError ? { x: [-5, 5, -5, 5, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className={'w-4 h-4 rounded-full transition-colors ' +
                    (passcodeError ? 'bg-[var(--color-danger)]' : passcodeInput.length > i ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface)]')
                  }
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {passcodeKeys.map((key, i) => {
                if (!key) return <div key={i} />;
                if (key === 'del') {
                  return (
                    <button
                       key={i}
                       onClick={handlePasscodeDelete}
                       className="h-14 font-semibold text-[17px] rounded-2xl active:bg-[var(--color-surface)] transition-colors haptic"
                    >
                      Del
                    </button>
                  );
                }
                return (
                  <button
                     key={i}
                     onClick={() => handlePasscodeDigit(key)}
                     className="h-14 font-bold text-[22px] rounded-2xl active:bg-[var(--color-surface)] transition-colors haptic"
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
