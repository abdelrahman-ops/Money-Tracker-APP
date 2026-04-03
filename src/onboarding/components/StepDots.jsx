import React from 'react';
import { motion } from 'framer-motion';
import { dotSpring } from '../config/animations';

/**
 * Premium step progress indicator.
 * @param {{ step: number, total: number, accentColor: string }} props
 */
function StepDots({ step, total, accentColor }) {
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === step ? 24 : 8,
            opacity: i === step ? 1 : 0.3,
          }}
          className="h-[6px] rounded-full"
          style={{
            backgroundColor: i === step ? accentColor : 'rgba(255,255,255,1)',
          }}
          transition={dotSpring}
        />
      ))}
    </div>
  );
}

export default React.memo(StepDots);
