import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '../config/animations';

const entrance = fadeUp(0.2);

/**
 * Currency selection card — encapsulated with glassmorphism.
 * @param {{ currencies: Array, selected: string, onSelect: Function, accent: string, accentGlow: string }} props
 */
function CurrencyPicker({ currencies, selected, onSelect, accent, accentGlow }) {
  return (
    <motion.div
      {...entrance}
      className="mt-2 w-full p-4 rounded-3xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-md"
    >
      <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-3">
        Choose Primary Currency
      </p>
      <div
        className="grid grid-cols-3 gap-2 max-h-[140px] overflow-y-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {currencies.map((cur) => (
          <button
            key={cur.code}
            onClick={() => {
              onSelect(cur.code);
              if (navigator.vibrate) navigator.vibrate(5);
            }}
            className={`px-2 py-2.5 rounded-xl text-center transition-all haptic ${
              selected === cur.code
                ? 'text-white font-bold ring-2 ring-white/20'
                : 'text-white/40 hover:bg-white/10'
            }`}
            style={
              selected === cur.code
                ? {
                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                    boxShadow: `0 4px 15px -5px ${accentGlow}`,
                  }
                : undefined
            }
          >
            <span className="text-[15px] block">{cur.symbol}</span>
            <span className="text-[10px] block mt-0.5 opacity-70 tracking-wide">
              {cur.code}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export default React.memo(CurrencyPicker);
