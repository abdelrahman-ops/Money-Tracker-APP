import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import moneyImg from '../assets/money.png';
import ChartIllustration from './illustrations/ChartIllustration';

/**
 * Steps 2 & 3 of the 3-step intro flow.
 *  Step 1 (Welcome) — money.png hero, bold headline, circular CTA
 *  Step 2 (Feature)  — chart illustration, feature copy, Get Started
 *
 * All backgrounds are dark grey/charcoal to match the video splash.
 */
const BG = 'linear-gradient(160deg, #0a0a0f, #111118, #0e0e14)';

export default function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0);

  const handleExit = useCallback(() => {
    window.history.replaceState(null, '', '/wallet/new');
    onFinish();
  }, [onFinish]);

  // =================== STEP 1: WELCOME ===================
  if (step === 0) {
    return (
      <motion.div
        className="fixed inset-0 z-[300] flex flex-col overflow-hidden touch-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ background: BG }}
      >
        {/* Subtle texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="topo" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M20 80 Q60 20, 100 60 T180 40" stroke="white" strokeWidth="1" fill="none" />
              <path d="M0 120 Q40 80, 80 100 T160 80 T200 100" stroke="white" strokeWidth="1" fill="none" />
              <path d="M10 160 Q50 120, 90 140 T170 120 T200 150" stroke="white" strokeWidth="0.8" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topo)" />
        </svg>

        {/* Ambient glow */}
        <div className="absolute top-[15%] right-[-5%] w-[280px] h-[280px] rounded-full bg-white/[0.02] blur-[80px] pointer-events-none" />

        {/* Skip */}
        <div className="flex justify-end px-5 pt-4 relative z-20">
          <button
            onClick={handleExit}
            className="text-[13px] font-semibold text-white/30 px-3 py-1.5 rounded-xl active:bg-white/5 transition-colors haptic"
          >
            Skip
          </button>
        </div>

        {/* Hero image */}
        <div className="flex-1 flex items-center justify-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, type: 'spring', stiffness: 180, damping: 20 }}
            className="relative"
          >
            <div className="absolute inset-0 m-auto w-[180px] h-[180px] rounded-full blur-[50px]" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <motion.img
              src={moneyImg}
              alt="Financial illustration"
              className="relative w-[240px] h-[240px] object-contain drop-shadow-2xl"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>

        {/* Headline + CTA */}
        <div className="relative z-10 px-7 pb-14">
          <motion.h1
            className="text-[30px] font-extrabold text-white leading-[1.15] tracking-tight mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            Managing your{'\n'}money is about to{'\n'}get a lot{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/90 to-white/50">
              better.
            </span>
          </motion.h1>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mb-6">
            <div className="w-6 h-[5px] rounded-full bg-white/80" />
            <div className="w-2 h-[5px] rounded-full bg-white/20" />
          </div>

          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5, type: 'spring', stiffness: 200 }}
          >
            <motion.button
              onClick={() => setStep(1)}
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl shadow-white/10 haptic active:scale-95 transition-transform"
              whileTap={{ scale: 0.92 }}
            >
              <ArrowRight className="w-6 h-6 text-[#111118]" strokeWidth={2.5} />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // =================== STEP 2: FEATURE ===================
  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col overflow-hidden touch-none"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ background: BG }}
    >
      {/* Subtle texture (same as step 1) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="topo2" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M20 80 Q60 20, 100 60 T180 40" stroke="white" strokeWidth="1" fill="none" />
            <path d="M0 120 Q40 80, 80 100 T160 80 T200 100" stroke="white" strokeWidth="1" fill="none" />
            <path d="M10 160 Q50 120, 90 140 T170 120 T200 150" stroke="white" strokeWidth="0.8" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#topo2)" />
      </svg>

      {/* Ambient glow matching purple */}
      <div className="absolute top-[15%] right-[-5%] w-[280px] h-[280px] rounded-full bg-[#AF52DE]/[0.04] blur-[80px] pointer-events-none" />

      {/* Skip */}
      <div className="flex justify-end px-5 pt-4 relative z-20">
        <div className="h-[30px]" /> {/* Spacer to match Step 1 Skip layout */}
      </div>

      {/* Hero image/illustration */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8, type: 'spring', stiffness: 180, damping: 20 }}
          className="relative"
        >
          <div className="absolute inset-0 m-auto w-[180px] h-[180px] rounded-full blur-[50px]" style={{ background: 'rgba(175,82,222,0.06)' }} />
          <div className="relative drop-shadow-2xl">
            <ChartIllustration accent="#AF52DE" />
          </div>
        </motion.div>
      </div>

      {/* Headline + CTA (Matching Step 1 Layout exactly) */}
      <div className="relative z-10 px-7 pb-14 text-left">
        <motion.h1
          className="text-[30px] font-extrabold text-white leading-[1.15] tracking-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          Smart Analytics.{'\n'}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#AF52DE] to-purple-400">
            Insights at a glance.
          </span>
        </motion.h1>

        <motion.p
          className="text-[15.5px] font-medium text-white/50 leading-relaxed mb-10 pr-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Beautiful charts, monthly trends, and budget breakdowns — all in real-time.
        </motion.p>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mb-6">
          <div className="w-2 h-[5px] rounded-full bg-white/20" />
          <div className="w-6 h-[5px] rounded-full bg-[#AF52DE]" />
        </div>

        <motion.div
           className="flex justify-center w-full"
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.button
            onClick={handleExit}
            className="w-full py-[18px] rounded-2xl text-white font-bold text-[17px] flex items-center justify-center gap-2 shadow-2xl shadow-[#AF52DE]/20 active:scale-[0.98] haptic transition-transform"
            style={{
              background: 'linear-gradient(135deg, #AF52DE, #9833cc)',
              border: '1px solid rgba(175,82,222,0.4)',
            }}
          >
            Get Started
            <ChevronRight className="w-5 h-5 opacity-80" strokeWidth={3} />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
