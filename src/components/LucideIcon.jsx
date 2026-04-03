import {
  Utensils, Car, ShoppingBag, Zap, Gamepad2, HeartPulse,
  GraduationCap, ShoppingCart, Home, Package, Banknote, Laptop,
  TrendingUp, Gift, PlusCircle, Wallet, Landmark, CreditCard,
  Briefcase, Coins, Circle, BadgeDollarSign, Building2, Vault, Gem,
} from 'lucide-react';

const iconMap = {
  'utensils': Utensils,
  'car': Car,
  'shopping-bag': ShoppingBag,
  'zap': Zap,
  'gamepad-2': Gamepad2,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  'shopping-cart': ShoppingCart,
  'home': Home,
  'package': Package,
  'banknote': Banknote,
  'laptop': Laptop,
  'trending-up': TrendingUp,
  'gift': Gift,
  'plus-circle': PlusCircle,
  'wallet': Wallet,
  'landmark': Landmark,
  'credit-card': CreditCard,
  'briefcase': Briefcase,
  'coins': Coins,
  'badge-dollar-sign': BadgeDollarSign,
  'building-2': Building2,
  'vault': Vault,
  'gem': Gem,
};

export default function LucideIcon({ name, ...props }) {
  const Icon = iconMap[name] || Circle;
  return <Icon {...props} />;
}

export const ICON_NAMES = Object.keys(iconMap);
