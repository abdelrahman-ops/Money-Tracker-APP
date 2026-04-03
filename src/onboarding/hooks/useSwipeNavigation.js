import { useCallback } from 'react';

/**
 * Reusable horizontal swipe navigation hook for Framer Motion.
 * Returns props to spread onto a motion.div container.
 *
 * @param {Object} config
 * @param {Function} config.onNext   — called on left swipe
 * @param {Function} config.onPrev   — called on right swipe
 * @param {boolean}  config.canGoBack — whether right swipe is allowed
 * @param {number}   [config.threshold=50] — minimum px offset to trigger
 * @param {number}   [config.velocity=200] — minimum px/s velocity to trigger
 */
export function useSwipeNavigation({
  onNext,
  onPrev,
  canGoBack = false,
  threshold = 50,
  velocity = 200,
}) {
  const handleDragEnd = useCallback(
    (_, info) => {
      const isSwipeLeft =
        info.offset.x < -threshold || info.velocity.x < -velocity;
      const isSwipeRight =
        info.offset.x > threshold || info.velocity.x > velocity;

      if (isSwipeLeft) onNext();
      if (isSwipeRight && canGoBack) onPrev();
    },
    [onNext, onPrev, canGoBack, threshold, velocity]
  );

  return {
    drag: 'x',
    dragConstraints: { left: 0, right: 0 },
    dragElastic: 0.15,
    onDragEnd: handleDragEnd,
  };
}
