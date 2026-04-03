import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import splashVideo from '../assets/splash.mp4';

/**
 * Step 1 of 3: Cinematic video splash.
 * Auto-exits after 4s or on skip.
 */
export default function SplashScreen({ onFinish }) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [textStep, setTextStep] = useState(0);
  const exitedRef = useRef(false);

  const handleFinish = useCallback(() => {
    if (exitedRef.current) return;
    exitedRef.current = true;
    setIsExiting(true);
    if (navigator.vibrate) navigator.vibrate(10);
    setTimeout(() => onFinish(), 400);
  }, [onFinish]);

  useEffect(() => {
    const t1 = setTimeout(() => setTextStep(1), 1200);
    const t2 = setTimeout(() => setTextStep(2), 2500);
    const t3 = setTimeout(() => { if (!exitedRef.current) handleFinish(); }, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [handleFinish]);

  return (
    <motion.div className="fixed inset-0 z-[200] flex bg-black items-center justify-center overflow-hidden">
      {/* Exit fade */}
      <motion.div
        className="absolute inset-0 bg-black z-[210] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Video */}
      <motion.video
        src={splashVideo}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 3.5, ease: 'easeOut' }}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay muted playsInline preload="auto"
        onLoadedData={() => setVideoLoaded(true)}
      />

      {!videoLoaded && <div className="absolute inset-0 bg-black z-0 pointer-events-none" />}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 backdrop-blur-[1px] pointer-events-none" />

      {/* Skip */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: videoLoaded ? 1 : 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        onClick={handleFinish}
        className="absolute top-12 right-6 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-[13px] font-bold tracking-wide haptic active:scale-95 transition-colors z-50"
      >
        Skip
      </motion.button>

      {/* Content */}
      <AnimatePresence>
        {videoLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6 pointer-events-none z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-[24px] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl mb-6 shadow-black/50"
            >
              <Sparkles className="w-10 h-10 text-white drop-shadow-md" strokeWidth={2.5} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-4xl font-extrabold tracking-tight mb-3 drop-shadow-lg"
            >
              Finora
            </motion.h1>

            <div className="h-[30px] w-full relative flex justify-center mt-1">
              <AnimatePresence mode="wait">
                {textStep === 1 && (
                  <motion.p
                    key="t1"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="absolute text-[17px] text-white/90 font-medium tracking-wide drop-shadow-md"
                  >
                    Welcome to Finora
                  </motion.p>
                )}
                {textStep === 2 && (
                  <motion.p
                    key="t2"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="absolute text-[17px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200 tracking-wide drop-shadow-md"
                  >
                    Track. Control. Grow.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
