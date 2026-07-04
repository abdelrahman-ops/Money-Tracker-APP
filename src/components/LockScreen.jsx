import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { Lock } from 'lucide-react';
import PasscodeInput from './PasscodeInput';

export default function LockScreen() {
  const verifyPasscode = useAppStore((s) => s.verifyPasscode);
  const unlock = useAppStore((s) => s.unlock);

  const handleComplete = async (code) => {
    const success = await verifyPasscode(code);
    if (success) {
      unlock();
      return true;
    }
    return false;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--color-bg)] safe-top safe-bottom px-6"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="mb-6"
      >
        <div className="w-[72px] h-[72px] rounded-[22px] gradient-primary flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Lock className="w-8 h-8 text-white" />
        </div>
      </motion.div>

      {/* Unified Passcode Keypad Input */}
      <PasscodeInput
        title="Welcome Back"
        subtitle="Enter passcode to unlock Finora"
        onComplete={handleComplete}
      />
    </motion.div>
  );
}

