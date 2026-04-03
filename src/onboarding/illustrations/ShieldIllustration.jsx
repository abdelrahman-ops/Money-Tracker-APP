import React from 'react';
import { motion } from 'framer-motion';

const RINGS = [80, 110, 140];

function ShieldIllustration({ accent }) {
  return (
    <div className="relative w-64 h-48 flex items-center justify-center">
      {/* Rings */}
      {RINGS.map((size, i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.05 - i * 0.01, 0.1 - i * 0.01, 0.05 - i * 0.01],
          }}
          transition={{ repeat: Infinity, duration: 3 + i, delay: i * 0.3 }}
          className="absolute rounded-full border"
          style={{
            width: size,
            height: size,
            borderColor: accent,
            opacity: 0.05,
          }}
        />
      ))}
      {/* Shield */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="relative"
      >
        <svg width="72" height="86" viewBox="0 0 72 86" fill="none">
          <path
            d="M36 2L4 18V40C4 62 18 78 36 84C54 78 68 62 68 40V18L36 2Z"
            fill={accent}
            fillOpacity="0.2"
            stroke={accent}
            strokeWidth="2"
          />
          <motion.path
            d="M24 42L32 50L48 34"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          />
        </svg>
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: accent, filter: 'blur(30px)', opacity: 0.15 }}
        />
      </motion.div>
    </div>
  );
}

export default React.memo(ShieldIllustration);
