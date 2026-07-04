import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Target,
  Shield,
  ArrowRight,
  Sun,
  Moon,
  PiggyBank,
  CheckCircle2,
  DollarSign,
  ChevronRight,
  PieChart,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

export default function Landing() {
  const navigate = useNavigate();
  const darkMode = useAppStore((s) => s.darkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // For the interactive budget demo
  const [budgetLimit, setBudgetLimit] = useState(500);
  const [spentAmount, setSpentAmount] = useState(380);

  const budgetProgress = (spentAmount / budgetLimit) * 100;
  const isOverBudget = spentAmount > budgetLimit;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  const handleStartClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass border-b border-[var(--color-border)]/50 px-6 py-4 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center shadow-md shadow-[var(--color-primary)]/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-[22px] font-black tracking-tight bg-gradient-to-r from-[var(--color-primary)] to-purple-600 bg-clip-text text-transparent">
              Finora
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]/60 flex items-center justify-center active:scale-95 transition-all text-[var(--color-text)] hover:bg-[var(--color-border)]/20"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn-primary py-2 px-5 text-[14px] flex items-center gap-1 shadow-lg shadow-[var(--color-primary)]/25"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[14px] font-semibold hover:text-[var(--color-primary)] transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex btn-primary py-2.5 px-5 text-[14px] shadow-lg shadow-[var(--color-primary)]/25"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-12 pb-20 sm:pt-20 sm:pb-32">
        {/* Abstract blurred background shapes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[12px] font-semibold border border-[var(--color-primary)]/20">
              <Sparkles className="w-3.5 h-3.5" /> Introducing Finora 2.0
            </div>

            <h1 className="text-[40px] sm:text-[56px] leading-[1.08] font-black tracking-tight text-[var(--color-text)]">
              Take control of your money,{' '}
              <span className="bg-gradient-to-r from-[var(--color-primary)] to-purple-600 bg-clip-text text-transparent">
                effortlessly.
              </span>
            </h1>

            <p className="text-[16px] sm:text-[18px] text-[var(--color-muted)] max-w-lg leading-relaxed font-medium">
              Finora is an enterprise-grade personal finance companion. Build budgets, secure your assets, automate savings, and unlock model-agnostic AI insights.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={handleStartClick}
                className="btn-primary py-4 px-8 text-[16px] flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-primary)]/30 haptic"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started for Free'}
                <ArrowRight className="w-5 h-5" />
              </button>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="btn-secondary py-4 px-8 text-[16px] flex items-center justify-center gap-2 haptic"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Micro Trust Indicators */}
            <div className="flex items-center gap-6 pt-6 border-t border-[var(--color-border)]/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
                <span className="text-[12px] font-medium text-[var(--color-muted)]">100% Client-Side Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
                <span className="text-[12px] font-medium text-[var(--color-muted)]">Open Source & Audit-Ready</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Illustration / Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, type: 'spring', delay: 0.2 }}
            className="lg:col-span-5 w-full flex justify-center lg:justify-end"
          >
            {/* Visual Glass Cards */}
            <div className="relative w-full max-w-md bg-[var(--color-card)]/50 backdrop-blur-xl border border-[var(--color-border)]/60 rounded-[32px] p-6 shadow-2xl shadow-black/15 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Main Balance Card */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-[24px] p-5 shadow-lg relative overflow-hidden"
              >
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Net Worth</span>
                  <div className="px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-bold">★ Primary</div>
                </div>
                <h3 className="text-[28px] font-black tracking-tight mb-3">$142,504.80</h3>
                <div className="flex justify-between items-center text-[12px] text-slate-400">
                  <span>•••• 8829</span>
                  <span className="text-emerald-400 font-semibold">+12.4% this month</span>
                </div>
              </motion.div>

              {/* Recent Transaction Item */}
              <div className="mt-6 space-y-3">
                <span className="text-[12px] font-bold text-[var(--color-muted)] uppercase tracking-wider block">Recent Activity</span>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]/40 hover:bg-[var(--color-border)]/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                      🛍
                    </div>
                    <div className="text-left">
                      <p className="text-[14px] font-bold">Apple Store Online</p>
                      <p className="text-[11px] text-[var(--color-muted)]">Shopping • Just Now</p>
                    </div>
                  </div>
                  <span className="text-[14px] font-bold text-[var(--color-danger)]">-$1,299.00</span>
                </div>

                {/* Savings goal card */}
                <div className="p-4 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] font-bold flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-sky-500" /> Model 3 Fund
                    </span>
                    <span className="text-[12px] font-semibold text-[var(--color-muted)]">$48,200 / $55,000</span>
                  </div>
                  <div className="w-full bg-[var(--color-surface)] h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full" style={{ width: '87%' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Feature: Budget Preview Demo */}
      <section className="bg-[var(--color-surface)] border-y border-[var(--color-border)]/60 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <div className="space-y-3">
            <h2 className="text-[28px] sm:text-[36px] font-black tracking-tight">Experience Dynamic Budgeting</h2>
            <p className="text-[14px] sm:text-[16px] text-[var(--color-muted)] max-w-lg mx-auto leading-relaxed">
              Drag the sliders below to see how Finora adjusts your budget allocations and warns you when you approach limits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[var(--color-card)] rounded-[32px] p-6 sm:p-8 border border-[var(--color-border)] shadow-xl shadow-black/5 text-left">
            {/* Control Panel */}
            <div className="space-y-6">
              <div>
                <label className="text-[13px] font-bold text-[var(--color-muted)] uppercase tracking-wider block mb-2">
                  Monthly Budget Limit: ${budgetLimit}
                </label>
                <input
                  type="range"
                  min="200"
                  max="1000"
                  step="50"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(Number(e.target.value))}
                  className="w-full h-2 bg-[var(--color-surface)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="text-[13px] font-bold text-[var(--color-muted)] uppercase tracking-wider block mb-2">
                  Spent Amount: ${spentAmount}
                </label>
                <input
                  type="range"
                  min="50"
                  max="1200"
                  step="25"
                  value={spentAmount}
                  onChange={(e) => setSpentAmount(Number(e.target.value))}
                  className="w-full h-2 bg-[var(--color-surface)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSpentAmount(Math.round(budgetLimit * 0.7))}
                  className="text-[13px] text-[var(--color-primary)] font-semibold flex items-center gap-1 hover:underline"
                >
                  Reset Demo
                </button>
              </div>
            </div>

            {/* Visual Indicator */}
            <div className="flex flex-col items-center justify-center p-6 border border-[var(--color-border)]/50 rounded-2xl bg-[var(--color-surface)]/50">
              <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    className="stroke-[var(--color-border)]/40 fill-none"
                    strokeWidth="10"
                  />
                  <motion.circle
                    cx="72"
                    cy="72"
                    r="64"
                    className={`fill-none stroke-linecap-round ${
                      isOverBudget ? 'stroke-[var(--color-danger)]' : 'stroke-[var(--color-primary)]'
                    }`}
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 64}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 64 * (1 - Math.min(budgetProgress, 100) / 100),
                    }}
                    transition={{ type: 'spring', damping: 20 }}
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-[24px] font-black tracking-tight">{Math.round(budgetProgress)}%</span>
                  <p className="text-[10px] uppercase font-bold text-[var(--color-muted)]">Spent</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isOverBudget ? (
                  <motion.div
                    key="over"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="px-4 py-2 rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-center text-[12px] font-bold border border-[var(--color-danger)]/20 animate-pulse"
                  >
                    ⚠️ Exceeded by ${spentAmount - budgetLimit}!
                  </motion.div>
                ) : (
                  <motion.div
                    key="under"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="px-4 py-2 rounded-xl bg-blue-500/10 text-[var(--color-primary)] text-center text-[12px] font-bold border border-blue-500/20"
                  >
                    👍 Safe: ${budgetLimit - spentAmount} left
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-3">
          <h2 className="text-[28px] sm:text-[36px] font-black tracking-tight">
            Engineered for Modern Finance
          </h2>
          <p className="text-[14px] sm:text-[16px] text-[var(--color-muted)] max-w-md mx-auto leading-relaxed">
            Beautifully designed widgets, robust database synchronizations, and advanced AI capabilities.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Card 1 */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-[24px] bg-[var(--color-card)] border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-2 text-left">
                <h3 className="text-[17px] font-bold">AI Financial Insights</h3>
                <p className="text-[13px] text-[var(--color-muted)] leading-relaxed">
                  Analyze your transaction patterns with model-agnostic Gemini AI. Receive personalized weekly roundups and tips.
                </p>
              </div>
            </div>
            <Link to="/register" className="mt-6 text-[13px] font-bold text-[var(--color-primary)] flex items-center gap-1 group-hover:gap-2 transition-all">
              Learn more <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-[24px] bg-[var(--color-card)] border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PieChart className="w-6 h-6" />
              </div>
              <div className="space-y-2 text-left">
                <h3 className="text-[17px] font-bold">Advanced Budgets</h3>
                <p className="text-[13px] text-[var(--color-muted)] leading-relaxed">
                  Support for total and category budgets. Configure automatic rollover options and smart limit warning notifications.
                </p>
              </div>
            </div>
            <Link to="/register" className="mt-6 text-[13px] font-bold text-[var(--color-primary)] flex items-center gap-1 group-hover:gap-2 transition-all">
              Learn more <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-[24px] bg-[var(--color-card)] border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PiggyBank className="w-6 h-6" />
              </div>
              <div className="space-y-2 text-left">
                <h3 className="text-[17px] font-bold">Milestone Savings</h3>
                <p className="text-[13px] text-[var(--color-muted)] leading-relaxed">
                  Link transaction transfers directly to active savings targets. Monitor projected dates and contribute with a tap.
                </p>
              </div>
            </div>
            <Link to="/register" className="mt-6 text-[13px] font-bold text-[var(--color-primary)] flex items-center gap-1 group-hover:gap-2 transition-all">
              Learn more <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-[24px] bg-[var(--color-card)] border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <div className="space-y-2 text-left">
                <h3 className="text-[17px] font-bold">Hardened Security</h3>
                <p className="text-[13px] text-[var(--color-muted)] leading-relaxed">
                  Cookie-based state checks, Web Crypto SHA-256 local passcode locks with automated lockouts, and Better Auth architecture.
                </p>
              </div>
            </div>
            <Link to="/register" className="mt-6 text-[13px] font-bold text-[var(--color-primary)] flex items-center gap-1 group-hover:gap-2 transition-all">
              Learn more <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Bottom Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-indigo-900/90 to-purple-950 text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-[32px] sm:text-[48px] font-black tracking-tight leading-none">
            Ready to upgrade your budgeting game?
          </h2>
          <p className="text-[15px] sm:text-[17px] text-indigo-200 max-w-lg mx-auto leading-relaxed font-medium">
            Join thousands of users tracking, budgeting, and securing their finances with the smartest open-source fintech app.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartClick}
              className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-white text-indigo-950 font-bold text-[16px] hover:bg-slate-100 transition-all flex items-center justify-center gap-2 haptic shadow-xl"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </button>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-[16px] border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                Sign In to Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)]/50 bg-[var(--color-card)] px-6 py-12 text-[var(--color-text)] transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-[17px] font-extrabold tracking-tight bg-gradient-to-r from-[var(--color-primary)] to-purple-600 bg-clip-text text-transparent">
              Finora
            </span>
          </div>

          <p className="text-[12px] text-[var(--color-muted)] font-medium">
            © {new Date().getFullYear()} Finora Money Tracker. Built for secure, modern wealth mapping.
          </p>
        </div>
      </footer>
    </div>
  );
}
