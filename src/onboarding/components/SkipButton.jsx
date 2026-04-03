import React from 'react';

/**
 * Minimal skip control.
 * @param {{ onSkip: Function, visible: boolean }} props
 */
function SkipButton({ onSkip, visible = true }) {
  if (!visible) return null;

  return (
    <button
      onClick={onSkip}
      className="text-[13px] font-semibold text-white/40 px-3 py-1.5 rounded-xl active:bg-white/5 transition-colors haptic"
    >
      Skip
    </button>
  );
}

export default React.memo(SkipButton);
