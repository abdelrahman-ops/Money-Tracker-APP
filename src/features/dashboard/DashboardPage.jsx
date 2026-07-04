import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Hooks
import { useDashboardData } from './hooks/useDashboardData';
import { useBudgetStats } from './hooks/useBudgetStats';
import { useNotificationStore } from '../../store/notificationStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useTransactionStore } from '../../store/transactionStore';
import { useAuthStore } from '../../store/authStore';

// Components
import DashboardHeader from './components/DashboardHeader';
import BalanceCard from './components/BalanceCard';
import CategorySpendGrid from './components/CategorySpendGrid';
import RecentTransactions from './components/RecentTransactions';
import QuickInput from '../../components/QuickInput'; 
import AICoachDrawer from '../../components/AICoachDrawer';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const userName = user?.name || user?.email?.split('@')[0] || '';
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  
  const dashboard = useDashboardData();
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  
  const categories = useCategoryStore((s) => s.categories);
  const transactions = useTransactionStore((s) => s.transactions);
  
  // Get top categories from budget stats for the 2x2 spend grid
  const { topCategories } = useBudgetStats(dashboard.monthExpense);

  const filters = useTransactionStore((s) => s.filters);
  const setFilters = useTransactionStore((s) => s.setFilters);

  useEffect(() => {
    fetchNotifications();
    
    if (Object.keys(filters).length > 0) {
      setFilters({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Map of categories by ID for quick lookups
  const catMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c._id || c.id] = c;
    });
    return map;
  }, [categories]);

  // Top 3 most recent transactions
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 3);
  }, [transactions]);

  // Loading skeleton matching original implementation
  if (dashboard.isLoadingAccounts && dashboard.accounts.length === 0) {
    return (
      <div className="px-4 pt-5 space-y-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="h-3 w-24 bg-[var(--color-surface)] rounded-full animate-pulse" />
            <div className="h-7 w-20 bg-[var(--color-surface)] rounded-full animate-pulse mt-2" />
          </div>
        </div>
        <div className="h-28 bg-[var(--color-surface)] rounded-3xl animate-pulse" />
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-3xl h-[120px] bg-[var(--color-surface)] animate-pulse" />
          ))}
        </div>
        <div className="rounded-3xl h-36 bg-[var(--color-surface)] animate-pulse mt-4" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-5">
      <DashboardHeader greeting={dashboard.greeting} />

      <QuickInput
        categories={categories}
        accounts={dashboard.accounts}
        onOpenCoach={() => setIsCoachOpen(true)}
        onParsed={(parsed) => {
          const params = new URLSearchParams();
          if (parsed.amount) params.set('amount', parsed.amount);
          if (parsed.type) params.set('type', parsed.type);
          if (parsed.name) params.set('name', parsed.name);
          if (parsed.resolvedCategoryId || parsed.resolvedCategory?._id) {
            params.set('categoryId', parsed.resolvedCategoryId || parsed.resolvedCategory?._id);
          }
          if (parsed.resolvedAccountId || parsed.resolvedAccount?._id) {
            params.set('accountId', parsed.resolvedAccountId || parsed.resolvedAccount?._id);
          }
          navigate('/add?' + params.toString());
        }}
      />

      <BalanceCard 
        monthName={dashboard.monthName}
        balanceVisible={dashboard.balanceVisible}
        toggleBalanceVisible={dashboard.toggleBalanceVisible}
        totalBalance={dashboard.totalBalance}
        monthIncome={dashboard.monthIncome}
        monthExpense={dashboard.monthExpense}
        onOpenCoach={() => setIsCoachOpen(true)}
      />

      <CategorySpendGrid
        topCategories={topCategories}
        balanceVisible={dashboard.balanceVisible}
      />

      <RecentTransactions
        transactions={recentTransactions}
        balanceVisible={dashboard.balanceVisible}
        catMap={catMap}
      />

      <AICoachDrawer 
        isOpen={isCoachOpen} 
        onClose={() => setIsCoachOpen(false)} 
        userName={userName} 
      />
    </div>
  );
}
