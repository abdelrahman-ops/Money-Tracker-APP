import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, RefreshCw } from 'lucide-react';
import NotificationBell from '../../../components/NotificationBell';
import { refreshAllData } from '../../../utils/refreshData';

export default function DashboardHeader({ greeting }) {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <p className="text-[13px] text-[var(--color-muted)]">{greeting}</p>
        <h1 className="text-[28px] font-bold tracking-tight mt-0.5">Finora</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={async () => {
            setIsRefreshing(true);
            await refreshAllData();
            setTimeout(() => setIsRefreshing(false), 600);
          }}
          disabled={isRefreshing}
          className="p-2.5 rounded-2xl bg-[var(--color-card)] min-w-touch min-h-touch flex items-center justify-center haptic ios-card disabled:opacity-70"
        >
          <RefreshCw className={`w-5 h-5 text-[var(--color-muted)] ${isRefreshing ? 'animate-spin text-[var(--color-primary)]' : ''}`} />
        </button>
        <NotificationBell />
        <button
          onClick={() => navigate('/analytics')}
          className="p-2.5 rounded-2xl bg-[var(--color-card)] min-w-touch min-h-touch flex items-center justify-center haptic ios-card"
        >
          <BarChart3 className="w-5 h-5 text-[var(--color-primary)]" />
        </button>
      </div>
    </div>
  );
}
