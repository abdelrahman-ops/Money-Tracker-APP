import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { ctaPulse } from '../config/animations';

/**
 * Unified CTA button with tactile feedback and last-step pulse.
 * @param {{ onClick: Function, isLast: boolean, accent: string, accentGlow: string }} props
 */
function ContinueButton({ onClick, isLast, accent, accentGlow }) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full max-w-sm py-4 rounded-[20px] text-white font-bold text-[17px] flex items-center justify-center gap-2 transition-colors active:scale-[0.97] haptic"
      style={{
        background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
        boxShadow: `0 8px 30px -4px ${accentGlow}`,
        border: '1px solid rgba(255,255,255,0.1)',
      }}
      animate={isLast ? ctaPulse.animate : undefined}
      transition={isLast ? ctaPulse.transition : undefined}
    >
      {isLast ? 'Get Started' : 'Continue'}
      {isLast ? <Check className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
    </motion.button>
  );
}

export default React.memo(ContinueButton);
