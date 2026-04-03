import { useNavigate } from 'react-router-dom';
import { Target, HandCoins, Users, Repeat, FileText, Wallet } from 'lucide-react';

export default function QuickActions() {
  const navigate = useNavigate();
  
  const actions = [
    { icon: Target, label: 'Budgets', color: '#FF9500', action: () => navigate('/analytics') },
    { icon: HandCoins, label: 'Savings', color: '#22c55e', action: () => navigate('/savings') },
    { icon: Users, label: 'Debts', color: '#ef4444', action: () => navigate('/debts') },
    { icon: Repeat, label: 'Transfer', color: '#5AC8FA', action: () => navigate('/add?type=transfer') },
    { icon: FileText, label: 'Templates', color: '#AF52DE', action: () => navigate('/templates') },
    { icon: Wallet, label: 'Wallets', color: '#34C759', action: () => navigate('/wallets') },
  ];

  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      {actions.map((item) => (
        <button
          key={item.label}
          onClick={item.action}
          className="ios-card flex items-center gap-2.5 px-4 py-3 haptic shrink-0"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: item.color + '18' }}
          >
            <item.icon className="w-4 h-4" style={{ color: item.color }} />
          </div>
          <span className="text-[13px] font-semibold">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
