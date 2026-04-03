/**
 * Centralized Framer Motion variants for the onboarding system.
 * Imported by containers and UI components — eliminates inline duplication.
 */

// --- Screen transitions (onboarding step changes) ---

export const slideVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export const slideTransition = {
  duration: 0.35,
  ease: 'easeOut',
};

// --- Splash text crossfade ---

export const crossfadeVariants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const crossfadeTransition = { duration: 0.4 };

// --- Splash logo entrance ---

export const logoEntrance = {
  initial: { opacity: 0, scale: 0.8, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: { delay: 0.3, duration: 0.8, type: 'spring', stiffness: 200 },
};

// --- Splash title entrance ---

export const titleEntrance = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.6, duration: 0.8 },
};

// --- Illustration subtle float (idle loop) ---

export const subtleFloat = (duration = 3, delay = 0) => ({
  animate: { y: [0, -6, 0] },
  transition: {
    y: { repeat: Infinity, duration, ease: 'easeInOut', delay },
  },
});

// --- Step dot spring ---

export const dotSpring = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

// --- CTA pulse (last step only) ---

export const ctaPulse = {
  animate: { scale: [1, 1.02, 1] },
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
};

// --- Fade up (generic content entrance) ---

export const fadeUp = (delay = 0.2) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay },
});

// --- Splash video scale ---

export const videoScale = {
  initial: { scale: 1.1 },
  animate: { scale: 1 },
  transition: { duration: 3.5, ease: 'easeOut' },
};

// --- Exit bridge ---

export const exitBridge = {
  initial: { opacity: 0 },
  transition: { duration: 0.3 },
};
