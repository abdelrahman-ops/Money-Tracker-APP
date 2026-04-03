import { useEffect, useState, useCallback, useRef } from 'react';
import { SPLASH_TIMELINE } from '../config/steps';

/**
 * Orchestrated splash screen state machine.
 * Returns the timeline state + video control handlers.
 *
 * @param {Function} onFinish — called when splash should unmount
 */
export function useSplashTimeline(onFinish) {
  const [textStep, setTextStep] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const finishRef = useRef(false);

  const handleFinish = useCallback(() => {
    if (finishRef.current) return;
    finishRef.current = true;
    setIsFinishing(true);

    if (navigator.vibrate) navigator.vibrate(10);

    setTimeout(() => {
      onFinish();
    }, SPLASH_TIMELINE.EXIT_TRANSITION);
  }, [onFinish]);

  useEffect(() => {
    const t1 = setTimeout(() => setTextStep(1), SPLASH_TIMELINE.TEXT_1_DELAY);
    const t2 = setTimeout(() => setTextStep(2), SPLASH_TIMELINE.TEXT_2_DELAY);
    const t3 = setTimeout(() => {
      if (!finishRef.current) handleFinish();
    }, SPLASH_TIMELINE.AUTO_EXIT);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [handleFinish]);

  return {
    textStep,
    isFinishing,
    videoLoaded,
    setVideoLoaded,
    handleFinish,
  };
}
