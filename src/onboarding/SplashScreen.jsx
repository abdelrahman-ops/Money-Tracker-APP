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
    <motion.div className="fixed inset-0 z-[200] bg-black overflow-hidden">
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/45 to-black/20 backdrop-blur-[1.5px] pointer-events-none" />

      {/* Skip */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: videoLoaded ? 1 : 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        onClick={handleFinish}
        className="absolute top-5 right-5 sm:top-8 sm:right-8 lg:top-10 lg:right-12 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-[13px] font-bold tracking-wide haptic active:scale-95 transition-colors z-50"
      >
        Skip
      </motion.button>

      {/* Content */}
      <AnimatePresence>
        {videoLoaded && (
          <div className="absolute inset-0 z-10 pointer-events-none flex items-end lg:items-center">
            <div className="w-full px-6 sm:px-10 lg:px-16 pb-14 sm:pb-16 lg:pb-0">
              <div className="max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto lg:mx-0 text-center lg:text-left text-white">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-[22px] sm:rounded-[24px] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl mb-5 sm:mb-6 shadow-black/50 mx-auto lg:mx-0"
                >
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 text-white drop-shadow-md" strokeWidth={2.5} />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="text-[44px] sm:text-[56px] lg:text-[72px] font-extrabold tracking-tight leading-[0.95] mb-2 sm:mb-3 drop-shadow-lg"
                >
                  Finora
                </motion.h1>

                <div className="h-[30px] sm:h-[34px] w-full relative flex justify-center lg:justify-start mt-1">
                  <AnimatePresence mode="wait">
                    {textStep === 1 && (
                      <motion.p
                        key="t1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="absolute text-[16px] sm:text-[18px] lg:text-[22px] text-white/92 font-medium tracking-wide drop-shadow-md"
                      >
                        Welcome to Finora
                      </motion.p>
                    )}
                    {textStep === 2 && (
                      <motion.p
                        key="t2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="absolute text-[16px] sm:text-[18px] lg:text-[22px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#5AC8FA] to-[#AF52DE] tracking-wide drop-shadow-md"
                      >
                        Track. Control. Grow.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
