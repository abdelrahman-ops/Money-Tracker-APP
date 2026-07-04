import { motion, AnimatePresence } from 'framer-motion';
import { Eye } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import PasscodeInput from './PasscodeInput';

export default function GlobalPasscodeModal() {
  const pendingBalanceReveal = useAppStore((s) => s.pendingBalanceReveal);
  const verifyPasscode = useAppStore((s) => s.verifyPasscode);
  const confirmBalanceReveal = useAppStore((s) => s.confirmBalanceReveal);
  const clearPendingBalanceReveal = useAppStore((s) => s.clearPendingBalanceReveal);

  const handleComplete = async (code) => {
    const success = await verifyPasscode(code);
    if (success) {
      confirmBalanceReveal();
      return true;
    }
    return false;
  };

  const cancelPasscode = () => {
    clearPendingBalanceReveal();
  };

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

            <PasscodeInput
              title="Show Balance"
              subtitle="Enter passcode to reveal sensitive amounts"
              onComplete={handleComplete}
              onCancel={cancelPasscode}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

