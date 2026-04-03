import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Hooks
import { useDashboardData } from './hooks/useDashboardData';
import { useTodayTransactions } from './hooks/useTodayTransactions';
import { useBudgetStats } from './hooks/useBudgetStats';
import { useNotificationStore } from '../../store/notificationStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useTransactionStore } from '../../store/transactionStore';

// Components
import DashboardHeader from './components/DashboardHeader';
import BalanceCard from './components/BalanceCard';
import QuickActions from './components/QuickActions';
import InsightsGrid from './components/InsightsGrid';
import TodaySpending from './components/TodaySpending';
import BudgetStatus from './components/BudgetStatus';
import TopCategories from './components/TopCategories';
import TodayTransactions from './components/TodayTransactions';
import AccountsCarousel from './components/AccountsCarousel';
import QuickInput from '../../components/QuickInput'; 

export default function DashboardPage() {
  const navigate = useNavigate();
  
  // Custom hooks fetch and compute necessary data aggregations natively via zustand slices and APIs
  const dashboard = useDashboardData();
  const { todayTransactions, todaySpent, catMap } = useTodayTransactions();
  const { totalBudget, budgetRemaining, budgetPct, topCategories } = useBudgetStats(dashboard.monthExpense);

  const fetchNotifications = useNotificationStore(s => s.fetchNotifications);
  const categories = useCategoryStore(s => s.categories);

  // Clear any date filters from the Transactions calendar page 
  // so the dashboard gets the true most recent transactions globally
  const filters = useTransactionStore(s => s.filters);
  const setFilters = useTransactionStore(s => s.setFilters);

  useEffect(() => {
    fetchNotifications();
    
    if (Object.keys(filters).length > 0) {
      setFilters({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <div className="gradient-card rounded-3xl p-5 h-48 animate-pulse" />
        <div className="flex gap-2">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="ios-card flex-1 h-14 animate-pulse" />
          ))}
        </div>
        <div className="ios-card h-24 animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl h-28 bg-[var(--color-surface)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5">
      <DashboardHeader greeting={dashboard.greeting} />

      <QuickInput
        categories={categories}
        accounts={dashboard.accounts}
        onParsed={(parsed) => {
          const params = new URLSearchParams();
          if (parsed.amount) params.set('amount', parsed.amount);
          if (parsed.type) params.set('type', parsed.type);
          if (parsed.name) params.set('name', parsed.name);
          if (parsed.resolvedCategoryId || parsed.resolvedCategory?._id) params.set('categoryId', parsed.resolvedCategoryId || parsed.resolvedCategory?._id);
          if (parsed.resolvedAccountId || parsed.resolvedAccount?._id) params.set('accountId', parsed.resolvedAccountId || parsed.resolvedAccount?._id);
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
      />

      <QuickActions />

      <InsightsGrid 
        insights={dashboard.insights}
        balanceVisible={dashboard.balanceVisible}
        streakDays={dashboard.streakDays}
        monthTransactionCount={dashboard.monthTransactionCount}
      />

      <TodaySpending 
        todaySpent={todaySpent} 
        dailyLimit={dashboard.dailyLimit} 
        balanceVisible={dashboard.balanceVisible} 
        todayTxnCount={todayTransactions.length} 
      />

      <BudgetStatus 
        totalBudget={totalBudget} 
        budgetRemaining={budgetRemaining} 
        budgetPct={budgetPct} 
        monthExpense={dashboard.monthExpense} 
      />

      <TopCategories 
        topCategories={topCategories} 
        balanceVisible={dashboard.balanceVisible} 
      />

      <TodayTransactions 
        todayTransactions={todayTransactions} 
        todaySpent={todaySpent} 
        balanceVisible={dashboard.balanceVisible} 
        catMap={catMap} 
      />

      <AccountsCarousel 
        accounts={dashboard.accounts} 
        balanceVisible={dashboard.balanceVisible} 
      />
    </div>
  );
}
