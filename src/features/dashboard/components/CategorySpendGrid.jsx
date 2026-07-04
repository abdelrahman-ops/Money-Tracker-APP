import { motion } from 'framer-motion';
import { formatCurrency } from '../../../utils/helpers';
import { 
  UtensilsCrossed, 
  Car, 
  Gamepad2, 
  ShoppingBag, 
  Tv, 
  Heart, 
  DollarSign, 
  BookOpen, 
  Briefcase, 
  Gift, 
  Compass, 
  HelpCircle 
} from 'lucide-react';

const IconMap = {
  UtensilsCrossed,
  Car,
  Gamepad2,
  ShoppingBag,
  Tv,
  Heart,
  DollarSign,
  BookOpen,
  Briefcase,
  Gift,
  Compass,
  HelpCircle
};

const PRESETS = [
  { name: 'Food & Dining', icon: 'UtensilsCrossed', color: '#AF52DE' }, // Purple
  { name: 'Transport', icon: 'Car', color: '#007AFF' }, // Blue
  { name: 'Entertainment', icon: 'Gamepad2', color: '#22c55e' }, // Green
  { name: 'Shopping', icon: 'ShoppingBag', color: '#FF9500' }, // Orange
];

const THEMES = [
  {
    bgLight: 'bg-[#f3e8ff]',
    bgDark: 'dark:bg-[#201140]',
    textLight: 'text-[#7e22ce]',
    textDark: 'dark:text-[#d8b4fe]',
    accentColor: '#7e22ce'
  },
  {
    bgLight: 'bg-[#e0f2fe]',
    bgDark: 'dark:bg-[#083050]',
    textLight: 'text-[#0369a1]',
    textDark: 'dark:text-[#7dd3fc]',
    accentColor: '#0369a1'
  },
  {
    bgLight: 'bg-[#dcfce7]',
    bgDark: 'dark:bg-[#053020]',
    textLight: 'text-[#15803d]',
    textDark: 'dark:text-[#86efac]',
    accentColor: '#15803d'
  },
  {
    bgLight: 'bg-[#ffedd5]',
    bgDark: 'dark:bg-[#481c0c]',
    textLight: 'text-[#c2410c]',
    textDark: 'dark:text-[#ffb74d]',
    accentColor: '#c2410c'
  }
];

export default function CategorySpendGrid({ topCategories = [], balanceVisible }) {
  // Combine top categories with presets to ensure we always have 4 cards in the grid
  const items = Array.from({ length: 4 }).map((_, idx) => {
    const cat = topCategories[idx];
    if (cat) {
      const preset = PRESETS[idx % PRESETS.length];
      return {
        id: cat._id || cat.id,
        name: cat.name,
        icon: cat.icon || preset.icon,
        color: cat.color || preset.color,
        total: cat.total || 0,
      };
    } else {
      const preset = PRESETS[idx];
      return {
        id: `preset-${idx}`,
        name: preset.name,
        icon: preset.icon,
        color: preset.color,
        total: 0,
      };
    }
  });

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-[15px] font-semibold text-[var(--color-text)] tracking-tight">Quick actions</h3>
        <span className="text-[11px] font-medium text-[var(--color-muted)] uppercase tracking-wider">Top Spends</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item, idx) => {
          // Resolve icon from our tree-shakable map
          const IconComponent = IconMap[item.icon] || HelpCircle;
          const theme = THEMES[idx % THEMES.length];

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-3xl ${theme.bgLight} ${theme.bgDark} flex flex-col justify-between h-[122px] shadow-sm relative overflow-hidden group border border-transparent transition-colors duration-200`}
            >
              {/* Subtle top indicator bar matching the category color */}
              <div 
                className="absolute top-0 left-0 right-0 h-1.5 opacity-80" 
                style={{ backgroundColor: theme.accentColor }} 
              />
              
              <div className="flex items-start gap-2.5 mt-1">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/40 dark:bg-black/20"
                >
                  <IconComponent className="w-4.5 h-4.5" style={{ color: item.color }} />
                </div>
                <div className="min-w-0">
                  <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-200 truncate block leading-tight mt-0.5">
                    {item.name}
                  </span>
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider block">
                    Category
                  </span>
                </div>
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <span className={`text-[16px] font-bold ${theme.textLight} ${theme.textDark} tracking-tight`}>
                  {balanceVisible ? formatCurrency(item.total) : '••••'}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Spent</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
