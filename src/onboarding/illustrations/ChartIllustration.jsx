import React from 'react';
import { motion } from 'framer-motion';

const BARS = [40, 65, 45, 80, 55, 70, 90];

function ChartIllustration({ accent }) {
  return (
    <div className="relative w-64 h-48 flex items-end justify-center gap-2.5 pb-4">
      {BARS.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: `${h}%`, opacity: 1 }}
          transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
          className="w-6 rounded-xl"
          style={{
            background:
              i === BARS.length - 1
                ? `linear-gradient(180deg, ${accent}, ${accent}88)`
                : 'rgba(255,255,255,0.08)',
            boxShadow: i === BARS.length - 1 ? `0 8px 20px ${accent}44` : 'none',
          }}
        />
      ))}
      {/* Trend line */}
      <motion.div
        className="absolute top-6 left-6 right-6"
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 200 40" className="w-full" fill="none">
          <path
            d="M0 35 Q30 25, 50 20 T100 15 T150 8 T200 5"
            stroke={accent}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
          <circle cx="200" cy="5" r="4" fill={accent} opacity="0.8" />
        </svg>
      </motion.div>
      {/* Subtle glow */}
      <motion.div
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 rounded-full"
        style={{ background: accent, filter: 'blur(24px)' }}
      />
    </div>
  );
}

export default React.memo(ChartIllustration);
