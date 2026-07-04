import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Brain, Lock, AlertCircle, CheckCircle, TrendingUp, Compass, Check } from 'lucide-react';
import apiClient from '../api/client';
import { useCategoryStore } from '../store/categoryStore';

export default function AICoachDrawer({ isOpen, onClose, userName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [budgetPlan, setBudgetPlan] = useState(null);
  const [applyingBudgets, setApplyingBudgets] = useState(false);
  const [notification, setNotification] = useState(null);
  const categories = useCategoryStore((s) => s.categories);

  // Admin access validation state
  const [isAdminVerified, setIsAdminVerified] = useState(
    () => localStorage.getItem('finora_ai_verified') === 'true'
  );
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (isOpen && messages.length === 0 && isAdminVerified) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hi ${userName || 'there'}! I'm your Finora AI Coach. Ask me anything about your finances, or let me recommend a custom budget plan for you.`,
          time: new Date(),
        },
      ]);
    }
  }, [isOpen, userName, messages.length, isAdminVerified]);

  const handleVerifyPassword = (e) => {
    e.preventDefault();
    if (adminPassword === 'finora-admin-ai' || adminPassword === 'admin123' || adminPassword === 'finora2026') {
      localStorage.setItem('finora_ai_verified', 'true');
      setIsAdminVerified(true);
      setPasswordError('');
      // Trigger initial message
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hi ${userName || 'there'}! Access granted to Finora AI Coach. Ask me anything about your finances or request a custom budget plan.`,
          time: new Date(),
        },
      ]);
    } else {
      setPasswordError('Invalid admin passcode');
    }
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    if (!textToSend) setInput('');

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setBudgetPlan(null); // Clear budget plans for normal queries

    try {
      const { data } = await apiClient.post('/ai/advice', { question: query });
      if (data.success && data.data) {
        const payload = data.data;
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: payload.advice,
          insights: payload.insights,
          actionItems: payload.actionItems,
          time: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('API returned failure');
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "I'm having some trouble connecting right now. Here is a friendly suggestion: keep an eye on your categories this week and ensure your balances are healthy!",
          isError: true,
          time: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetBudgetPlan = async () => {
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: 'Generate a personalized budget recommendation plan.',
      time: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setBudgetPlan(null);

    try {
      const { data } = await apiClient.get('/ai/budget-plan');
      if (data.success && Array.isArray(data.data)) {
        setBudgetPlan(data.data);
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "I've analyzed your category spending and wallets history. Here is a custom monthly budget plan tailored to your habits. You can apply it directly below!",
          time: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('Failed to fetch budget recommendation');
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "I couldn't generate a budget plan right now. Please try again when you have more transactions recorded.",
          isError: true,
          time: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBudgets = async () => {
    if (!budgetPlan || budgetPlan.length === 0) return;
    setApplyingBudgets(true);
    
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    try {
      const promises = budgetPlan.map((rec) => {
        const matchedCat = categories.find(
          (c) => c.name.toLowerCase() === rec.categoryName.toLowerCase()
        );
        return apiClient.post('/budgets', {
          name: `${rec.categoryName} Budget`,
          type: 'category',
          categoryId: matchedCat ? matchedCat._id || matchedCat.id : null,
          monthKey,
          limit: rec.amount,
          rollover: false,
          alertThreshold: 80,
          isRecurring: true,
        });
      });

      await Promise.all(promises);
      
      setNotification({
        type: 'success',
        message: 'Successfully applied AI budget plan!',
      });
      setTimeout(() => setNotification(null), 4000);
      setBudgetPlan(null);
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: 'Failed to apply some budget recommendations.',
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setApplyingBudgets(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          />

          {/* Drawer (iOS slide-up bottom sheet) */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-[var(--color-bg)] rounded-t-[32px] border-t border-[var(--color-border-subtle)] shadow-2xl z-[101] flex flex-col max-h-[85vh] h-[720px] overflow-hidden safe-bottom"
          >
            {/* Grabber */}
            <div className="w-full flex justify-center py-3 shrink-0">
              <div className="w-12 h-1 bg-[var(--color-border-subtle)] rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 pb-3 flex items-center justify-between border-b border-[var(--color-border-subtle)] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white">
                  <Brain className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-white">Finora AI Coach</h3>
                  <p className="text-[10px] text-[var(--color-muted)] font-medium">Fintech Advisor & Wealth Planner</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[var(--color-card)] flex items-center justify-center text-[var(--color-muted)] hover:text-white active:scale-90 transition-transform duration-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Verification Block if not admin-verified */}
            {!isAdminVerified ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-card)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-primary)] mb-4">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-[18px] font-black text-white mb-2">Admin Lock</h4>
                <p className="text-[13px] text-[var(--color-muted)] mb-5 max-w-xs leading-relaxed">
                  Finora AI features are restricted to Administrators. Please enter the admin password to unlock.
                </p>
                <form onSubmit={handleVerifyPassword} className="w-full max-w-xs space-y-3">
                  <input
                    type="password"
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border-subtle)] text-center text-[14px] text-white placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
                  />
                  {passwordError && (
                    <p className="text-[12px] font-semibold text-[var(--color-danger)]">{passwordError}</p>
                  )}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl gradient-primary text-white text-[14px] font-bold active:scale-[0.98] transition-transform"
                  >
                    Unlock AI Coach
                  </button>
                </form>
              </div>
            ) : (
              <>
                {/* Messages body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-[20px] px-4 py-3 text-[13.5px] leading-relaxed shadow-sm ${
                          m.sender === 'user'
                            ? 'bg-[var(--color-primary)] text-white rounded-tr-sm'
                            : 'bg-[var(--color-card)] text-[var(--color-text)] border border-[var(--color-border-subtle)] rounded-tl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.text}</p>

                        {m.insights && m.insights.length > 0 && (
                          <div className="mt-3.5 pt-3 border-t border-[var(--color-border-subtle)] space-y-2">
                            <p className="text-[11px] font-bold text-[var(--color-muted)] uppercase tracking-wider">Analysis Insights</p>
                            <ul className="space-y-1.5">
                              {m.insights.map((insight, idx) => (
                                <li key={idx} className="flex gap-2 items-start text-[12.5px] text-[var(--color-text)]">
                                  <TrendingUp className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0 mt-0.5" />
                                  <span>{insight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {m.actionItems && m.actionItems.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] space-y-2">
                            <p className="text-[11px] font-bold text-[var(--color-muted)] uppercase tracking-wider">Action Plan</p>
                            <ul className="space-y-1.5">
                              {m.actionItems.map((item, idx) => (
                                <li key={idx} className="flex gap-2 items-start text-[12.5px] text-[var(--color-text)]">
                                  <Compass className="w-3.5 h-3.5 text-[var(--color-success)] shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Loader */}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-[var(--color-card)] rounded-[20px] rounded-tl-sm px-4 py-3 border border-[var(--color-border-subtle)] flex items-center gap-2">
                        <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}

                  {/* Recommended Budget plan list */}
                  {budgetPlan && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-gradient-to-b from-[var(--color-card)] to-[var(--color-bg)] border border-[var(--color-border-subtle)] space-y-3"
                    >
                      <h4 className="text-[13px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Brain className="w-4.5 h-4.5 text-[var(--color-primary)]" />
                        Recommended Limits
                      </h4>
                      
                      <div className="space-y-3">
                        {budgetPlan.map((rec, idx) => (
                          <div key={idx} className="p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border-subtle)]">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[13px] font-semibold text-white">{rec.categoryName}</span>
                              <span className="text-[13px] font-bold text-[var(--color-primary)]">${rec.amount}</span>
                            </div>
                            <p className="text-[11px] text-[var(--color-muted)] leading-relaxed">{rec.reason}</p>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleApplyBudgets}
                        disabled={applyingBudgets}
                        className="w-full py-2.5 rounded-xl gradient-primary text-white text-[13px] font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-transform duration-100 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {applyingBudgets ? (
                          <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Apply Recommended Budgets
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Notification alert banner */}
                {notification && (
                  <div className="px-5 shrink-0">
                    <div
                      className={`p-3 rounded-xl flex items-center gap-2 text-[12px] font-semibold ${
                        notification.type === 'success'
                          ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20'
                          : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20'
                      }`}
                    >
                      {notification.type === 'success' ? (
                        <CheckCircle className="w-4.5 h-4.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                      )}
                      <span>{notification.message}</span>
                    </div>
                  </div>
                )}

                {/* Suggestions & Pill buttons */}
                <div className="px-5 py-2 overflow-x-auto flex gap-2 shrink-0 no-scrollbar">
                  <button
                    onClick={() => handleSend('Give me a financial checkup and feedback.')}
                    className="px-3 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border-subtle)] text-[12px] font-medium text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-white shrink-0 active:scale-95 transition-all duration-100"
                  >
                    Financial Checkup 🔍
                  </button>
                  <button
                    onClick={handleGetBudgetPlan}
                    className="px-3 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border-subtle)] text-[12px] font-medium text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-white shrink-0 active:scale-95 transition-all duration-100"
                  >
                    Suggest Budget Plan 📊
                  </button>
                  <button
                    onClick={() => handleSend('What are some effective tips to spend less and save more?')}
                    className="px-3 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border-subtle)] text-[12px] font-medium text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-white shrink-0 active:scale-95 transition-all duration-100"
                  >
                    Saving Tips 💡
                  </button>
                </div>

                {/* Input Footer */}
                <div className="p-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)] shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask your coach a question..."
                      className="flex-1 bg-[var(--color-card)] border border-[var(--color-border-subtle)] rounded-2xl px-4 py-3 text-[13.5px] placeholder:text-[var(--color-muted)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="w-11 h-11 rounded-2xl gradient-primary text-white flex items-center justify-center shrink-0 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                    >
                      <Send className="w-4.5 h-4.5" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
