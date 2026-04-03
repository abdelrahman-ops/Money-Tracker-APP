import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import moneyImg from '../assets/money.png';
import ChartIllustration from './illustrations/ChartIllustration';

/**
 * Steps 2 & 3 of the 3-step intro flow.
 *  Step 1 (Welcome)  — money hero + core value
 *  Step 2 (Insights) — analytics hero + confidence message
 *
 * Both pages share one visual language for continuity,
 * while each keeps a different accent and story.
 */
const BG = 'linear-gradient(160deg, #0a0a0f, #111118, #0e0e14)';

const STEPS = [
  {
    id: 'welcome',
    accent: '#5AC8FA',
    glow: 'rgba(90,200,250,0.08)',
    title: 'Managing your money is about to get a lot',
    emphasis: 'better.',
    description:
      'Track income, expenses, and wallets with a flow that feels fast, focused, and clear from day one.',
    cta: 'Continue',
    visual: 'money',
  },
  {
    id: 'insights',
    accent: '#AF52DE',
    glow: 'rgba(175,82,222,0.10)',
    title: 'Smart analytics designed for daily',
    emphasis: 'clarity.',
    description:
      'See trends, understand categories, and stay on top of your budget without digging through noisy data.',
    cta: 'Get Started',
    visual: 'chart',
  },
];

function Texture({ id }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={id} x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          <path d="M20 80 Q60 20, 100 60 T180 40" stroke="white" strokeWidth="1" fill="none" />
          <path d="M0 120 Q40 80, 80 100 T160 80 T200 100" stroke="white" strokeWidth="1" fill="none" />
          <path d="M10 160 Q50 120, 90 140 T170 120 T200 150" stroke="white" strokeWidth="0.8" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

export default function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  const handleExit = useCallback(() => {
    window.history.replaceState(null, '', '/wallet/new');
    onFinish();
  }, [onFinish]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleExit();
      return;
    }
    setStep((s) => s + 1);
  }, [handleExit, isLastStep]);

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col overflow-hidden touch-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      style={{ background: BG }}
    >
      <Texture id={`topo-${current.id}`} />

      <div
        className="absolute top-[16%] right-[-4%] w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] rounded-full blur-[90px] pointer-events-none"
        style={{ backgroundColor: current.glow }}
      />
      <div
        className="absolute bottom-[10%] left-[-6%] w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] rounded-full blur-[90px] pointer-events-none"
        style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
      />

      <div className="relative z-20 flex justify-end px-5 sm:px-8 lg:px-12 pt-4 sm:pt-6">
        <button
          onClick={handleExit}
          className="text-[13px] sm:text-[14px] font-semibold text-white/35 px-3 py-1.5 rounded-xl active:bg-white/5 transition-colors haptic"
        >
          Skip
        </button>
      </div>

      <div className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 pb-10 sm:pb-12 lg:pb-14">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="h-full flex flex-col lg:flex-row lg:items-center lg:gap-12 xl:gap-16"
        >
          <div className="flex-1 flex items-center justify-center min-h-[38vh] sm:min-h-[42vh] lg:min-h-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.86, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.75, type: 'spring', stiffness: 185, damping: 20 }}
              className="relative"
            >
              <div
                className="absolute inset-0 m-auto w-[170px] h-[170px] sm:w-[210px] sm:h-[210px] rounded-full blur-[56px]"
                style={{ backgroundColor: current.glow }}
              />

              {current.visual === 'money' ? (
                <motion.img
                  src={moneyImg}
                  alt="Financial illustration"
                  className="relative w-[230px] h-[230px] sm:w-[300px] sm:h-[300px] lg:w-[360px] lg:h-[360px] object-contain drop-shadow-2xl"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              ) : (
                <div className="relative scale-[0.92] sm:scale-100 lg:scale-110 xl:scale-[1.18]">
                  <ChartIllustration accent={current.accent} />
                </div>
              )}
            </motion.div>
          </div>

          <div className="w-full lg:max-w-[520px] text-left lg:pt-4">
            <motion.h1
              className="text-[32px] sm:text-[40px] lg:text-[52px] font-extrabold text-white leading-[1.08] tracking-tight mb-4 sm:mb-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.65 }}
            >
              {current.title}{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: `linear-gradient(90deg, ${current.accent}, #f8fafc)` }}
              >
                {current.emphasis}
              </span>
            </motion.h1>

            <motion.p
              className="text-[15px] sm:text-[17px] font-medium text-white/56 leading-relaxed mb-9 sm:mb-10 lg:mb-12 max-w-[520px]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.55 }}
            >
              {current.description}
            </motion.p>

            <div className="flex justify-center lg:justify-start gap-2 mb-6 sm:mb-7">
              {STEPS.map((s, idx) => (
                <div
                  key={s.id}
                  className="h-[5px] rounded-full transition-all duration-300"
                  style={{
                    width: idx === step ? 24 : 8,
                    backgroundColor: idx === step ? current.accent : 'rgba(255,255,255,0.22)',
                  }}
                />
              ))}
            </div>

            <motion.button
              onClick={handleNext}
              className="w-full sm:max-w-[360px] py-[16px] sm:py-[18px] rounded-2xl text-white font-bold text-[17px] flex items-center justify-center gap-2 shadow-2xl active:scale-[0.98] haptic transition-transform"
              style={{
                background: `linear-gradient(135deg, ${current.accent}, ${current.accent}cc)`,
                border: `1px solid ${current.accent}66`,
                boxShadow: `0 20px 45px -18px ${current.accent}80`,
              }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34, duration: 0.5 }}
            >
              {current.cta}
              {isLastStep ? (
                <ChevronRight className="w-5 h-5 opacity-85" strokeWidth={3} />
              ) : (
                <ArrowRight className="w-5 h-5 opacity-85" strokeWidth={3} />
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
