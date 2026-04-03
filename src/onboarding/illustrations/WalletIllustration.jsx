import React from 'react';
import { motion } from 'framer-motion';
import { subtleFloat } from '../config/animations';

const floatMain = subtleFloat(3.5, 0.3);

function WalletIllustration({ accent }) {
  return (
    <div className="relative w-64 h-48">
      {/* Back card */}
      <motion.div
        animate={{ rotate: -8, y: [0, -4, 0] }}
        transition={{ y: { repeat: Infinity, duration: 3, ease: 'easeInOut' } }}
        className="absolute top-4 left-4 w-52 h-32 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
      />
      {/* Main card */}
      <motion.div
        {...floatMain}
        animate={{ rotate: 4, ...floatMain.animate }}
        className="absolute top-2 left-6 w-52 h-32 rounded-2xl p-4 text-white"
        style={{
          background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
          boxShadow: `0 20px 40px -10px ${accent}55`,
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-white/20" />
          <div className="flex gap-[3px]">
            {[0, 1, 2, 3].map(i => (
              <span key={i} className="w-1.5 h-1.5 bg-white/40 rounded-full" />
            ))}
          </div>
        </div>
        <div className="w-20 h-2 bg-white/20 rounded mb-2" />
        <div className="w-32 h-3 bg-white/30 rounded mb-4" />
        <div className="flex justify-between">
          <div className="w-16 h-2 bg-white/15 rounded" />
          <div className="w-12 h-2 bg-white/15 rounded" />
        </div>
      </motion.div>
      {/* Subtle accent orb */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute -top-2 -right-2 w-8 h-8 rounded-full"
        style={{ background: accent, filter: 'blur(8px)' }}
      />
    </div>
  );
}

export default React.memo(WalletIllustration);
