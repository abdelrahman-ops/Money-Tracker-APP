import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import LucideIcon from './LucideIcon';
import { formatCurrency } from '../utils/helpers';

export default function CreditCardUI({ account, balanceVisible, isActive, onAddClick }) {
  const color = account.color || '#007AFF';
  
  // Generate 3D card style based on color
  const getCardStyles = () => {
    const rgb = hexToRgb(color);
    return {
      background: `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -30)} 100%)`,
      boxShadow: `
        0 20px 40px -10px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.1) inset,
        0 2px 0 0 rgba(255, 255, 255, 0.2) inset
      `,
      transform: isActive ? 'translateZ(20px)' : 'translateZ(0)',
    };
  };

  // Helper to convert hex to rgb
  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 122, b: 255 };
  };

  // Helper to adjust color brightness
  const adjustColor = (hex, percent) => {
    const rgb = hexToRgb(hex);
    const adjust = (c) => Math.min(255, Math.max(0, c + (c * percent / 100)));
    return `rgb(${adjust(rgb.r)}, ${adjust(rgb.g)}, ${adjust(rgb.b)})`;
  };

  return (
    <motion.div 
      className="relative flex flex-col justify-between p-5 text-white select-none rounded-[28px] overflow-hidden"
      style={{ 
        aspectRatio: '400/250', 
        ...getCardStyles()
      }}
      whileHover={isActive ? { 
        rotateX: 2, 
        rotateY: -1,
        transition: { duration: 0.2 }
      } : {}}
    >
      {/* 3D Floating Elements */}
      <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
        {/* Shimmer effect */}
        {/* <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
            ease: 'linear',
          }}
        /> */}
        
        {/* 3D Edge highlight */}
        <div className="absolute inset-0 rounded-[28px] border border-white/20" style={{ transform: 'translateZ(5px)' }} />
        
        {/* Depth layers */}
        <div className="absolute inset-[2px] rounded-[26px] bg-white/5" style={{ transform: 'translateZ(2px)' }} />
        <div className="absolute inset-[4px] rounded-[24px] bg-black/5" style={{ transform: 'translateZ(1px)' }} />
        
        {/* Decorative 3D blobs (Only render if active to save massive GPU load on mobile) */}
        {isActive && (
          <>
            <motion.div 
              className="absolute top-[-20%] right-[-10%] w-[60%] aspect-square bg-white/10 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ transform: 'translateZ(10px)' }}
            />
            <motion.div 
              className="absolute bottom-[-10%] left-[-10%] w-[50%] aspect-square bg-white/5 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
              style={{ transform: 'translateZ(5px)' }}
            />
          </>
        )}
      </div>

      {/* Top: icon + dots */}
      <motion.div 
        className="relative z-10 flex items-center justify-between"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.div 
          className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm"
          style={{ transform: 'translateZ(15px)' }}
          whileHover={{ scale: 1.1, transform: 'translateZ(20px)' }}
        >
          <LucideIcon name={account.icon} className="w-5 h-5 shadow-sm" />
        </motion.div>
        <div className="flex items-center gap-1.5" style={{ transform: 'translateZ(12px)' }}>
          {[0, 1].map((g) => (
            <span key={g} className="flex gap-[3px]">
              {[0, 1, 2, 3].map((d) => (
                <motion.span 
                  key={d} 
                  className="w-[5px] h-[5px] bg-white/50 rounded-full inline-block"
                  animate={isActive ? { opacity: [0.5, 0.8, 0.5] } : { opacity: 0.5 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: g * 0.2 + d * 0.1,
                  }}
                />
              ))}
            </span>
          ))}
          <span className="text-[13px] text-white/90 font-medium ml-1 tracking-wider drop-shadow-sm">
            {String(account._id || '0000').slice(-4)}
          </span>
        </div>
      </motion.div>

      {/* Balance */}
      <motion.div 
        className="relative z-10 my-auto"
        style={{ transform: 'translateZ(20px)' }}
      >
        <p className="text-[11px] text-white/60 font-medium uppercase tracking-wider mb-1">Balance</p>
        <div className="flex items-end justify-between">
          <motion.p 
            className="text-[34px] font-bold tracking-tight leading-none drop-shadow-sm"
            animate={{ 
              textShadow: isActive ? '0 2px 10px rgba(0,0,0,0.3)' : '0 1px 5px rgba(0,0,0,0.2)'
            }}
          >
            {balanceVisible ? formatCurrency(account.balance) : '••••••'}
          </motion.p>
          <div className="text-right" style={{ transform: 'translateZ(10px)' }}>
            <p className="text-[10px] text-white/50 uppercase">Exp. Date</p>
            <p className="text-[13px] text-white/80 font-semibold drop-shadow-sm">
              {String(new Date().getMonth() + 1).padStart(2, '0')}/{String(new Date().getFullYear() + 2).slice(2)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Bottom: name + Add Action */}
      <motion.div 
        className="relative z-10 flex items-end justify-between mt-auto"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div style={{ transform: 'translateZ(15px)' }}>
          <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">Name</p>
          <p className="text-[16px] font-semibold text-white/95 truncate drop-shadow-sm max-w-[160px]">{account.name}</p>
        </div>

        {/* The Action Button directly in the flex row! */}
        {isActive && (
          <button
            data-stop-card-tap="true"
            onClick={(e) => { 
              e.stopPropagation(); 
              if (onAddClick) onAddClick(); 
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white pl-3 pr-4 py-2 rounded-2xl text-[13px] font-bold haptic backdrop-blur-md border border-white/10 active:scale-95 transition-all shadow-lg shadow-black/10"
          >
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Plus className="w-3.5 h-3.5" strokeWidth={3} />
            </span>
            Add Card
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
