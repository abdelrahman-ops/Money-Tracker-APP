import { useWalletStore } from '../store/walletStore';
import { useTransactionStore } from '../store/transactionStore';
import { useFinancialStore } from '../store/financialStore';
import { useNotificationStore } from '../store/notificationStore';

/**
 * Triggers a global re-fetch of all critical app state.
 * Call this after any mutation (adding a transaction, modifying a wallet, etc.)
 * to ensure the dashboard, insights, and badges all show fresh data immediately.
 */
export const refreshAllData = async () => {
  const fs = useFinancialStore.getState();
  
  // Fire all fetches in parallel
  await Promise.allSettled([
    useWalletStore.getState().fetchWallets(),
    useTransactionStore.getState().fetchTransactions(),
    fs.loadInsights(),
    fs.loadHealthScore(),
    fs.loadProjection(),
    fs.loadDailyLimit(),
    useNotificationStore.getState().fetchNotifications()
  ]);
  
  // console.log('[refreshAllData] Global state synchronized with server.');
};
