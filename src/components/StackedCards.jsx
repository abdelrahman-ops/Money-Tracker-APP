import React, { useState, useRef } from 'react';
import { motion, animate } from 'framer-motion';
import CreditCardUI from './CreditCardUI';

export default function StackedCards({ accounts, balanceVisible, navigate }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const didDrag = useRef(false);

  const sortedAccounts = (accounts || []).slice().sort((a, b) => a._id.localeCompare(b._id));

  const VISIBLE_STACK_COUNT = 6;
  const PEEK_PER_CARD = 37; // Increased for better 3D effect
  const STACK_HEIGHT_STEP = 37; // Adjusted for 3D depth
  const STACK_BOTTOM_SPACE = 30;
  const INACTIVE_SCALE_STEP = 0.06;

  const cycleCard = (dir) => {
    if (!sortedAccounts.length) return;
    setActiveIndex((prev) => (prev + dir + sortedAccounts.length) % sortedAccounts.length);
  };

  const handleDragStart = () => {
    didDrag.current = false;
  };

  const handleDrag = (_, info) => {
    if (Math.abs(info.offset.y) > 5) didDrag.current = true;
  };

  const handleDragEnd = (_, info) => {
    const threshold = 40;
    const vThreshold = 200;
    if (info.offset.y < -threshold || info.velocity.y < -vThreshold) {
      cycleCard(-1);
    } else if (info.offset.y > threshold || info.velocity.y > vThreshold) {
      cycleCard(1);
    }
  };

  const handleCardTap = (item, e) => {
    // Ignore taps that originated from interactive children (e.g. Add button)
    if (didDrag.current) return;
    if (e?.target?.closest?.('[data-stop-card-tap]')) return;
    navigate('/wallet/insights/' + item._id);
  };

  const cardHeight = 210;

  if (!sortedAccounts.length) return null;
  
  return (
    <div>
      {/* 3D Stacked card area */}
      <div
        className="relative mx-auto mt-2"
        style={{ 
          height: `${cardHeight + STACK_BOTTOM_SPACE}px`,
          perspective: '1800px', // Increased perspective for more dramatic 3D
          perspectiveOrigin: 'center 20%'
        }}
      >
        {sortedAccounts.map((item, idx) => {
          const offset = (idx - activeIndex + sortedAccounts.length) % sortedAccounts.length;
          const isActive = offset === 0;
          
          // Calculate 3D transforms for stacking
          const rotateX = isActive ? 0 : offset * 12; // More aggressive tilt
          const rotateY = isActive ? 0 : (offset % 2 === 0 ? 2 : -2); // Alternating Y rotation
          const translateY = isActive ? 0 : -(offset * PEEK_PER_CARD) + (offset * 5); // Adjusted Y position
          
          return (
            <motion.div
              key={item._id}
              className="absolute inset-x-0"
              style={{
                transformStyle: 'preserve-3d',
                transformOrigin: 'center bottom'
              }}
              animate={{
                zIndex: isActive ? 20 : 10 - offset,
                y: isActive ? 0 : translateY,
                scale: isActive ? 1 : 1 - offset * INACTIVE_SCALE_STEP,
                rotateX: rotateX,
                rotateY: rotateY,
                z: isActive ? 40 : 0,
                opacity: offset > VISIBLE_STACK_COUNT - 1 ? 0 : 1 - offset * 0.15,
              }}
              transition={{ 
                type: 'spring', 
                stiffness: 400, 
                damping: 40,
                mass: 1.2
              }}
              {...(isActive
                ? {
                    drag: 'y',
                    dragConstraints: { top: 0, bottom: 0 },
                    dragElastic: 0.5,
                    onDragStart: handleDragStart,
                    onDrag: handleDrag,
                    onDragEnd: handleDragEnd,
                    onTap: (e) => handleCardTap(item, e),
                  }
                : {
                    onClick: () => setActiveIndex(idx),
                    whileHover: {
                      rotateX: rotateX - 2,
                      rotateY: rotateY * 1.5,
                      scale: 1 - offset * INACTIVE_SCALE_STEP + 0.02,
                      transition: { duration: 0.2 }
                    }
                  })}
            >
              {/* Card shadow for depth */}
              {!isActive && (
                <div 
                  className="absolute inset-x-4 bottom-0 h-20 rounded-full opacity-30"
                  style={{
                    background: `radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, transparent 70%)`,
                    transform: `rotateX(80deg) translateZ(-20px) translateY(10px)`,
                    filter: 'blur(8px)'
                  }}
                />
              )}
              
              <CreditCardUI
                account={item}
                balanceVisible={balanceVisible}
                isActive={isActive}
                onAddClick={() => navigate('/wallet/new')}
              />
            </motion.div>
          );
        })}
      </div>

      {/* 3D Dots */}
      {sortedAccounts.length > 1 && (
        <div className="flex justify-center gap-2" style={{ perspective: '500px' }}>
          {sortedAccounts.map((item, i) => (
            <motion.button
              key={item._id}
              onClick={() => setActiveIndex(i)}
              className="haptic p-1 outline-none"
              whileHover={{ scale: 1.2, z: 10 }}
              whileTap={{ scale: 0.9 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === activeIndex ? 24 : 8,
                  height: 8,
                  background: i === activeIndex
                    ? (item.color || 'var(--color-primary)')
                    : 'var(--color-border)',
                  transform: i === activeIndex ? 'translateZ(10px)' : 'translateZ(0)'
                }}
                animate={i === activeIndex ? {
                  boxShadow: [
                    `0 0 0 0 ${item.color || 'var(--color-primary)'}40`,
                    `0 0 0 8px ${item.color || 'var(--color-primary)'}00`,
                  ],
                } : {}}
                transition={{
                  boxShadow: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }}
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
