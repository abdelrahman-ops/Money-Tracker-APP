import { useAppStore } from '../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

export default function InstallBanner() {
  const showInstallBanner = useAppStore((s) => s.showInstallBanner);
  const installPromptEvent = useAppStore((s) => s.installPromptEvent);
  const dismissInstallBanner = useAppStore((s) => s.dismissInstallBanner);

  const handleInstall = async (e) => {
    e.stopPropagation();
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    const result = await installPromptEvent.userChoice;
    if (result.outcome === 'accepted') {
      dismissInstallBanner();
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    e.preventDefault();
    dismissInstallBanner();
  };

  if (!showInstallBanner) return null;

  return (
    <AnimatePresence>
      {showInstallBanner && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[50] p-3"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="gradient-primary rounded-2xl p-3 flex items-center gap-3 mx-2 shadow-lg">
            <Download className="w-5 h-5 text-white shrink-0" />
            <p className="text-sm text-white flex-1">Install app for quick access</p>
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-sm font-medium active:scale-95 transition-transform"
            >
              Install
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg active:scale-90 transition-transform relative z-10"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
