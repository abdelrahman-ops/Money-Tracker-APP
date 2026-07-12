import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ShieldCheck, WifiOff, Code } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import splashVideo from '../assets/splash.mp4';
import clsx from 'clsx';

export default function SplashScreen({ onFinish }) {
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const darkMode = useAppStore((s) => s.darkMode);

  const [step, setStep] = useState(0); // 0: Logo, 1: Video Preview, 2: Pillars
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [direction, setDirection] = useState(1); // 1: forward, -1: backward
  const exitedRef = useRef(false);

  // If already onboarded, run a fast logo animation and enter the app
  useEffect(() => {
    if (hasOnboarded) {
      const timer = setTimeout(() => {
        if (!exitedRef.current) {
          exitedRef.current = true;
          onFinish();
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hasOnboarded, onFinish]);

  const handleNext = () => {
    if (step < 2) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const handleComplete = () => {
    if (exitedRef.current) return;
    exitedRef.current = true;
    if (navigator.vibrate) navigator.vibrate(12);
    completeOnboarding();
    onFinish();
  };

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    exit: (dir) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: { duration: 0.35, ease: 'easeIn' },
    }),
  };

  return (
    <div className={clsx('fixed', 'inset-0', 'z-[200]', 'bg-[#090d16]', 'text-[#f8fafc]', 'flex', 'flex-col', 'justify-between', 'overflow-hidden', 'p-6', 'sm:p-8', 'select-none')}>
      {/* Top Header Row (Back & Skip) */}
      <div className={clsx('flex', 'items-center', 'justify-between', 'min-h-[44px]', 'z-50')}>
        {!hasOnboarded && step > 0 ? (
          <button
            onClick={handleBack}
            className={clsx('flex', 'items-center', 'gap-1.5', 'px-3', 'py-2', 'rounded-xl', 'bg-white/5', 'active:bg-white/10', 'text-white/70', 'hover:text-white', 'transition-colors', 'text-[14px]', 'font-semibold', 'haptic')}
          >
            <ArrowLeft className={clsx('w-4', 'h-4')} />
            Back
          </button>
        ) : (
          <div className="w-10" />
        )}

        {!hasOnboarded && (
          <button
            onClick={handleComplete}
            className={clsx('px-4', 'py-2', 'rounded-xl', 'bg-white/5', 'active:bg-white/10', 'text-white/60', 'hover:text-white', 'transition-colors', 'text-[13px]', 'font-semibold', 'tracking-wide', 'haptic')}
          >
            Skip
          </button>
        )}
      </div>

      {/* Main Slide Area */}
      <div className={clsx('flex-1', 'flex', 'flex-col', 'items-center', 'justify-center', 'relative', 'w-full', 'my-4')}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {/* Step 0: Welcome & Logo Reveal */}
          {step === 0 && (
            <motion.div
              key="step0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className={clsx('absolute', 'inset-0', 'flex', 'flex-col', 'items-center', 'justify-center', 'text-center', 'space-y-6')}
            >
              <div className="relative">
                <div className={clsx('absolute', 'inset-0', 'm-auto', 'w-32', 'h-32', 'bg-[var(--color-primary)]/20', 'rounded-full', 'blur-3xl')} />
                <motion.img
                  src={darkMode ? '/logo-blank.png' : '/logo-blank.png'}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.6, type: 'spring' }}
                  className={clsx('relative', 'w-24', 'h-24', 'sm:w-28', 'sm:h-28', 'object-contain', 'drop-shadow-[0_10px_15px_rgba(114,91,208,0.2)]')}
                  alt="Finora Logo"
                />
              </div>

              <div className="space-y-2">
                <motion.h1
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={clsx('text-[42px]', 'sm:text-[48px]', 'font-black', 'tracking-tight', 'bg-gradient-to-r', 'from-[var(--color-primary)]', 'to-[var(--color-primary-light)]', 'bg-clip-text', 'text-transparent', 'leading-none')}
                >
                  Finora
                </motion.h1>
                <motion.p
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={clsx('text-[15px]', 'sm:text-[17px]', 'text-white/70', 'max-w-[280px]', 'sm:max-w-sm', 'mx-auto', 'font-medium')}
                >
                  Your wealth, clearly defined. Private, simple, and secure.
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* Step 1: Video Feature Preview */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className={clsx('absolute', 'inset-0', 'flex', 'flex-col', 'items-center', 'justify-center', 'text-center')}
            >
              <div className={clsx('w-full', 'max-w-[280px]', 'sm:max-w-[320px]', 'aspect-[9/16]', 'relative', 'flex', 'items-center', 'justify-center', 'mb-6')}>
                {/* Simulated Phone Frame */}
                <div className={clsx('absolute', 'inset-0', 'border-[6px]', 'border-slate-800', 'rounded-[38px]', 'bg-slate-950', 'shadow-2xl', 'overflow-hidden', 'flex', 'items-center', 'justify-center')}>
                  <video
                    src={splashVideo}
                    className={clsx('w-full', 'h-full', 'object-cover')}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    onCanPlay={() => setVideoLoaded(true)}
                  />
                  {!videoLoaded && (
                    <div className={clsx('absolute', 'inset-0', 'bg-[#090d16]', 'flex', 'items-center', 'justify-center')}>
                      <div className={clsx('w-8', 'h-8', 'rounded-full', 'border-2', 'border-white/20', 'border-t-white', 'animate-spin')} />
                    </div>
                  )}
                </div>
              </div>

              <div className={clsx('space-y-1', 'px-4')}>
                <h3 className={clsx('text-[18px]', 'sm:text-[20px]', 'font-bold', 'tracking-tight', 'text-white')}>
                  Fast, Beautiful Wealth Mapping
                </h3>
                <p className={clsx('text-[13px]', 'sm:text-[14px]', 'text-white/60', 'max-w-xs', 'mx-auto', 'leading-relaxed')}>
                  Track transactions, monitor targets, and visualize categories with zero clutter.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 2: Pillars of Commitment */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className={clsx('absolute', 'inset-0', 'flex', 'flex-col', 'items-center', 'justify-center', 'text-center', 'space-y-8')}
            >
              <div className="space-y-2">
                <h3 className={clsx('text-[24px]', 'sm:text-[28px]', 'font-black', 'tracking-tight', 'text-white')}>
                  Our Privacy Standards
                </h3>
                <p className={clsx('text-[14px]', 'text-white/60', 'max-w-xs', 'mx-auto', 'font-medium')}>
                  We built Finora to protect your financial freedom, which is why we enforce three rules:
                </p>
              </div>

              {/* Pillars list */}
              <div className={clsx('w-full', 'max-w-sm', 'space-y-3.5', 'px-4')}>
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={clsx('flex', 'items-center', 'gap-4', 'p-4', 'rounded-2xl', 'bg-white/5', 'border', 'border-white/10', 'text-left')}
                >
                  <div className={clsx('w-10', 'h-10', 'rounded-xl', 'bg-purple-500/10', 'text-purple-400', 'flex', 'items-center', 'justify-center', 'flex-shrink-0')}>
                    <ShieldCheck className={clsx('w-5', 'h-5')} />
                  </div>
                  <div>
                    <h4 className={clsx('text-[14px]', 'font-bold', 'text-white')}>100% Client-Side Encryption</h4>
                    <p className={clsx('text-[12px]', 'text-white/50', 'leading-normal')}>Your transactions are encrypted locally on your own key.</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={clsx('flex', 'items-center', 'gap-4', 'p-4', 'rounded-2xl', 'bg-white/5', 'border', 'border-white/10', 'text-left')}
                >
                  <div className={clsx('w-10', 'h-10', 'rounded-xl', 'bg-blue-500/10', 'text-blue-400', 'flex', 'items-center', 'justify-center', 'flex-shrink-0')}>
                    <WifiOff className={clsx('w-5', 'h-5')} />
                  </div>
                  <div>
                    <h4 className={clsx('text-[14px]', 'font-bold', 'text-white')}>Offline-First Resilience</h4>
                    <p className={clsx('text-[12px]', 'text-white/50', 'leading-normal')}>Works offline seamlessly, syncs safely only when you authorize.</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={clsx('flex', 'items-center', 'gap-4', 'p-4', 'rounded-2xl', 'bg-white/5', 'border', 'border-white/10', 'text-left')}
                >
                  <div className={clsx('w-10', 'h-10', 'rounded-xl', 'bg-emerald-500/10', 'text-emerald-400', 'flex', 'items-center', 'justify-center', 'flex-shrink-0')}>
                    <Code className={clsx('w-5', 'h-5')} />
                  </div>
                  <div>
                    <h4 className={clsx('text-[14px]', 'font-bold', 'text-white')}>Open Source & Audited</h4>
                    <p className={clsx('text-[12px]', 'text-white/50', 'leading-normal')}>Transparent code architecture with zero trackers or cookies.</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls (Continue Button & Progress dots) */}
      <div className={clsx('flex', 'flex-col', 'items-center', 'gap-6', 'z-50')}>
        {!hasOnboarded ? (
          <>
            {/* Step Indicators */}
            <div className={clsx('flex', 'items-center', 'gap-2')}>
              {[0, 1, 2].map((s) => (
                <div
                  key={s}
                  onClick={() => {
                    setDirection(s > step ? 1 : -1);
                    setStep(s);
                  }}
                  className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${s === step ? 'w-6 bg-[var(--color-primary)]' : 'w-2 bg-white/20'
                    }`}
                />
              ))}
            </div>

            {/* Action Button */}
            <button
              onClick={handleNext}
              className={clsx('w-full', 'sm:max-w-xs', 'py-4', 'px-6', 'rounded-2xl', 'gradient-primary', 'text-white', 'font-bold', 'text-[16px]', 'flex', 'items-center', 'justify-center', 'gap-2', 'shadow-lg', 'shadow-[var(--color-primary)]/20', 'active:scale-98', 'transition-transform', 'duration-150', 'haptic')}
            >
              {step === 2 ? 'Enter Finora' : 'Continue'}
              <ArrowRight className={clsx('w-4', 'h-4')} />
            </button>
          </>
        ) : (
          /* Returning user loading placeholder */
          <div className={clsx('h-10', 'flex', 'items-center', 'justify-center')}>
            <div className={clsx('w-6', 'h-6', 'rounded-full', 'border-2', 'border-white/20', 'border-t-white', 'animate-spin')} />
          </div>
        )}
      </div>
    </div>
  );
}
