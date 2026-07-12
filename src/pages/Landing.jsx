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
import clsx from 'clsx';

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
    <div className={clsx('min-h-[100dvh]', 'bg-[var(--color-bg)]', 'text-[var(--color-text)]', 'transition-colors', 'duration-300')}>
      {/* Navigation Header */}
      <header className={clsx('sticky', 'top-0', 'z-50', 'glass', 'border-b', 'border-[var(--color-border)]/50', 'px-6', 'py-4', 'transition-all')}>
        <div className={clsx('max-w-6xl', 'mx-auto', 'flex', 'items-center', 'justify-between')}>
          <Link to="/" className={clsx('flex', 'items-center', 'gap-2')}>
            <img src={darkMode ? '/logo-blank.png' : '/logo-blank.png'} className={clsx('w-8', 'h-8', 'object-contain')} alt="Finora Logo" />
            <span className={clsx('text-[22px]', 'font-black', 'tracking-tight', 'bg-gradient-to-r', 'from-[var(--color-primary)]', 'to-[var(--color-primary-light)]', 'bg-clip-text', 'text-transparent')}>
              Finora
            </span>
          </Link>

          <div className={clsx('flex', 'items-center', 'gap-4')}>
            <button
              onClick={toggleDarkMode}
              className={clsx('w-10', 'h-10', 'rounded-xl', 'bg-[var(--color-surface)]', 'border', 'border-[var(--color-border)]/60', 'flex', 'items-center', 'justify-center', 'active:scale-95', 'transition-all', 'text-[var(--color-text)]', 'hover:bg-[var(--color-border)]/20')}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className={clsx('w-5', 'h-5')} /> : <Moon className={clsx('w-5', 'h-5')} />}
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className={clsx('btn-primary', 'py-2', 'px-5', 'text-[14px]', 'flex', 'items-center', 'gap-1', 'shadow-lg', 'shadow-[var(--color-primary)]/25')}
              >
                Go to Dashboard
                <ArrowRight className={clsx('w-4', 'h-4')} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className={clsx('text-[14px]', 'font-semibold', 'hover:text-[var(--color-primary)]', 'transition-colors', 'px-3', 'py-2')}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className={clsx('hidden', 'sm:inline-flex', 'btn-primary', 'py-2.5', 'px-5', 'text-[14px]', 'shadow-lg', 'shadow-[var(--color-primary)]/25')}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={clsx('relative', 'overflow-hidden', 'px-6', 'pt-12', 'pb-20', 'sm:pt-20', 'sm:pb-32')}>
        {/* Abstract blurred background shapes */}
        <div className={clsx('absolute', 'top-1/4', 'left-1/2', '-translate-x-1/2', '-translate-y-1/2', 'w-[500px]', 'h-[500px]', 'bg-gradient-to-br', 'from-blue-500/10', 'to-purple-600/10', 'rounded-full', 'blur-3xl', 'pointer-events-none', '-z-10')} />

        <div className={clsx('max-w-6xl', 'mx-auto', 'grid', 'grid-cols-1', 'lg:grid-cols-12', 'gap-12', 'items-center')}>
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className={clsx('lg:col-span-7', 'space-y-6', 'text-left')}
          >
            <div className={clsx('inline-flex', 'items-center', 'gap-1.5', 'px-3', 'py-1.5', 'rounded-full', 'bg-[var(--color-primary)]/10', 'text-[var(--color-primary)]', 'text-[12px]', 'font-bold', 'border', 'border-[var(--color-primary)]/20')}>
              Built for Privacy • Crafted for Clarity
            </div>

            <h1 className={clsx('text-[40px]', 'sm:text-[56px]', 'leading-[1.08]', 'font-black', 'tracking-tight', 'text-[var(--color-text)]')}>
              Your wealth,{' '}
              <span className={clsx('bg-gradient-to-r', 'from-[var(--color-primary)]', 'to-[var(--color-primary-light)]', 'bg-clip-text', 'text-transparent')}>
                clearly defined.
              </span>
            </h1>

            <p className={clsx('text-[16px]', 'sm:text-[18px]', 'text-[var(--color-muted)]', 'max-w-lg', 'leading-relaxed', 'font-medium')}>
              A beautiful, distraction-free space for your finances. Set category limits, track active savings milestones, and understand your spending with 100% private, client-side encryption.
            </p>

            <div className={clsx('flex', 'flex-col', 'sm:flex-row', 'items-stretch', 'sm:items-center', 'gap-4', 'pt-2')}>
              <button
                onClick={handleStartClick}
                className={clsx('btn-primary', 'py-4', 'px-8', 'text-[16px]', 'flex', 'items-center', 'justify-center', 'gap-2', 'shadow-lg', 'shadow-[var(--color-primary)]/30', 'haptic')}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started for Free'}
                <ArrowRight className={clsx('w-5', 'h-5')} />
              </button>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className={clsx('btn-secondary', 'py-4', 'px-8', 'text-[16px]', 'flex', 'items-center', 'justify-center', 'gap-2', 'haptic')}
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Micro Trust Indicators */}
            <div className={clsx('flex', 'items-center', 'gap-6', 'pt-6', 'border-t', 'border-[var(--color-border)]/50')}>
              <div className={clsx('flex', 'items-center', 'gap-2')}>
                <CheckCircle2 className={clsx('w-4', 'h-4', 'text-[var(--color-success)]')} />
                <span className={clsx('text-[12px]', 'font-medium', 'text-[var(--color-muted)]')}>100% Client-Side Encryption</span>
              </div>
              <div className={clsx('flex', 'items-center', 'gap-2')}>
                <CheckCircle2 className={clsx('w-4', 'h-4', 'text-[var(--color-success)]')} />
                <span className={clsx('text-[12px]', 'font-medium', 'text-[var(--color-muted)]')}>Open Source & Audit-Ready</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Illustration / Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, type: 'spring', delay: 0.2 }}
            className={clsx('lg:col-span-5', 'w-full', 'flex', 'justify-center', 'lg:justify-end')}
          >
            {/* Visual Glass Cards */}
            <div className={clsx('relative', 'w-full', 'max-w-md', 'bg-[var(--color-card)]/60', 'backdrop-blur-xl', 'border', 'border-[var(--color-border)]/80', 'rounded-[32px]', 'p-6', 'shadow-2xl', 'shadow-black/5', 'dark:shadow-black/20', 'overflow-hidden')}>
              <div className={clsx('absolute', 'top-0', 'right-0', 'w-32', 'h-32', 'bg-[var(--color-primary-light)]/10', 'rounded-full', 'blur-2xl', 'pointer-events-none')} />

              {/* Main Balance Card */}
              <motion.div
                whileHover={{ y: -4 }}
                className={clsx('bg-gradient-to-br', 'from-[#192f5a]', 'to-[#725bd0]', 'text-white', 'rounded-[24px]', 'p-5', 'shadow-lg', 'relative', 'overflow-hidden')}
              >
                <div className={clsx('absolute', '-right-6', '-bottom-6', 'w-32', 'h-32', 'bg-white/5', 'rounded-full', 'pointer-events-none')} />
                <div className={clsx('flex', 'justify-between', 'items-start', 'mb-4')}>
                  <span className={clsx('text-[11px]', 'font-semibold', 'uppercase', 'tracking-wider', 'text-white/70')}>Total Net Worth</span>
                  <div className={clsx('px-2.5', 'py-1', 'rounded-full', 'bg-white/10', 'text-[10px]', 'font-bold')}>★ Primary</div>
                </div>
                <h3 className={clsx('text-[28px]', 'font-black', 'tracking-tight', 'mb-3')}>$142,504.80</h3>
                <div className={clsx('flex', 'justify-between', 'items-center', 'text-[12px]', 'text-white/80')}>
                  <span>•••• 8829</span>
                  <span className={clsx('text-emerald-400', 'font-semibold')}>+12.4% this month</span>
                </div>
              </motion.div>

              {/* Recent Transaction Item */}
              <div className={clsx('mt-6', 'space-y-3')}>
                <span className={clsx('text-[12px]', 'font-bold', 'text-[var(--color-muted)]', 'uppercase', 'tracking-wider', 'block')}>Recent Activity</span>
                <div className={clsx('flex', 'items-center', 'justify-between', 'p-3.5', 'rounded-2xl', 'bg-[var(--color-surface)]', 'border', 'border-[var(--color-border)]/40', 'hover:bg-[var(--color-border)]/10', 'transition-colors')}>
                  <div className={clsx('flex', 'items-center', 'gap-3')}>
                    <div className={clsx('w-10', 'h-10', 'rounded-xl', 'bg-purple-100', 'dark:bg-purple-900/30', 'text-purple-600', 'dark:text-purple-400', 'flex', 'items-center', 'justify-center', 'font-bold')}>
                      🛍
                    </div>
                    <div className="text-left">
                      <p className={clsx('text-[14px]', 'font-bold')}>Apple Store Online</p>
                      <p className={clsx('text-[11px]', 'text-[var(--color-muted)]')}>Shopping • Just Now</p>
                    </div>
                  </div>
                  <span className={clsx('text-[14px]', 'font-bold', 'text-[var(--color-danger)]')}>-$1,299.00</span>
                </div>

                {/* Savings goal card */}
                <div className={clsx('p-4', 'rounded-2xl', 'bg-[var(--color-card)]', 'border', 'border-[var(--color-border)]', 'shadow-sm', 'relative', 'overflow-hidden')}>
                  <div className={clsx('flex', 'justify-between', 'items-center', 'mb-2')}>
                    <span className={clsx('text-[13px]', 'font-bold', 'flex', 'items-center', 'gap-1.5')}>
                      <Target className={clsx('w-4', 'h-4', 'text-sky-500')} /> Model 3 Fund
                    </span>
                    <span className={clsx('text-[12px]', 'font-semibold', 'text-[var(--color-muted)]')}>$48,200 / $55,000</span>
                  </div>
                  <div className={clsx('w-full', 'bg-[var(--color-surface)]', 'h-2', 'rounded-full', 'overflow-hidden')}>
                    <div className={clsx('h-full', 'bg-gradient-to-r', 'from-sky-400', 'to-blue-500', 'rounded-full')} style={{ width: '87%' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Feature: Budget Preview Demo */}
      <section className={clsx('bg-[var(--color-surface)]', 'border-y', 'border-[var(--color-border)]/60', 'py-16', 'px-6')}>
        <div className={clsx('max-w-4xl', 'mx-auto', 'text-center', 'space-y-10')}>
          <div className="space-y-3">
            <h2 className={clsx('text-[28px]', 'sm:text-[36px]', 'font-black', 'tracking-tight')}>Experience Dynamic Budgeting</h2>
            <p className={clsx('text-[14px]', 'sm:text-[16px]', 'text-[var(--color-muted)]', 'max-w-lg', 'mx-auto', 'leading-relaxed')}>
              Drag the sliders below to see how Finora adjusts your budget allocations and warns you when you approach limits.
            </p>
          </div>

          <div className={clsx('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-8', 'items-center', 'bg-[var(--color-card)]', 'rounded-[32px]', 'p-6', 'sm:p-8', 'border', 'border-[var(--color-border)]', 'shadow-xl', 'shadow-black/5', 'text-left')}>
            {/* Control Panel */}
            <div className="space-y-6">
              <div>
                <label className={clsx('text-[13px]', 'font-bold', 'text-[var(--color-muted)]', 'uppercase', 'tracking-wider', 'block', 'mb-2')}>
                  Monthly Budget Limit: ${budgetLimit}
                </label>
                <input
                  type="range"
                  min="200"
                  max="1000"
                  step="50"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(Number(e.target.value))}
                  className={clsx('w-full', 'h-2', 'bg-[var(--color-surface)]', 'rounded-lg', 'appearance-none', 'cursor-pointer', 'accent-[var(--color-primary)]')}
                />
              </div>

              <div>
                <label className={clsx('text-[13px]', 'font-bold', 'text-[var(--color-muted)]', 'uppercase', 'tracking-wider', 'block', 'mb-2')}>
                  Spent Amount: ${spentAmount}
                </label>
                <input
                  type="range"
                  min="50"
                  max="1200"
                  step="25"
                  value={spentAmount}
                  onChange={(e) => setSpentAmount(Number(e.target.value))}
                  className={clsx('w-full', 'h-2', 'bg-[var(--color-surface)]', 'rounded-lg', 'appearance-none', 'cursor-pointer', 'accent-[var(--color-primary)]')}
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSpentAmount(Math.round(budgetLimit * 0.7))}
                  className={clsx('text-[13px]', 'text-[var(--color-primary)]', 'font-semibold', 'flex', 'items-center', 'gap-1', 'hover:underline')}
                >
                  Reset Demo
                </button>
              </div>
            </div>

            {/* Visual Indicator */}
            <div className={clsx('flex', 'flex-col', 'items-center', 'justify-center', 'p-6', 'border', 'border-[var(--color-border)]/50', 'rounded-2xl', 'bg-[var(--color-surface)]/50')}>
              <div className={clsx('relative', 'w-36', 'h-36', 'flex', 'items-center', 'justify-center', 'mb-4')}>
                <svg className={clsx('w-full', 'h-full', 'transform', '-rotate-90')}>
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    className={clsx('stroke-[var(--color-border)]/40', 'fill-none')}
                    strokeWidth="10"
                  />
                  <motion.circle
                    cx="72"
                    cy="72"
                    r="64"
                    className={`fill-none stroke-linecap-round ${isOverBudget ? 'stroke-[var(--color-danger)]' : 'stroke-[var(--color-primary)]'
                      }`}
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 64}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 64 * (1 - Math.min(budgetProgress, 100) / 100),
                    }}
                    transition={{ type: 'spring', damping: 20 }}
                  />
                </svg>
                <div className={clsx('absolute', 'text-center')}>
                  <span className={clsx('text-[24px]', 'font-black', 'tracking-tight')}>{Math.round(budgetProgress)}%</span>
                  <p className={clsx('text-[10px]', 'uppercase', 'font-bold', 'text-[var(--color-muted)]')}>Spent</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isOverBudget ? (
                  <motion.div
                    key="over"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={clsx('px-4', 'py-2', 'rounded-xl', 'bg-[var(--color-danger)]/10', 'text-[var(--color-danger)]', 'text-center', 'text-[12px]', 'font-bold', 'border', 'border-[var(--color-danger)]/20', 'animate-pulse')}
                  >
                    ⚠️ Exceeded by ${spentAmount - budgetLimit}!
                  </motion.div>
                ) : (
                  <motion.div
                    key="under"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={clsx('px-4', 'py-2', 'rounded-xl', 'bg-blue-500/10', 'text-[var(--color-primary)]', 'text-center', 'text-[12px]', 'font-bold', 'border', 'border-blue-500/20')}
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
      <section className={clsx('px-6', 'py-20', 'max-w-6xl', 'mx-auto', 'space-y-16')}>
        <div className={clsx('text-center', 'space-y-3')}>
          <h2 className={clsx('text-[28px]', 'sm:text-[36px]', 'font-black', 'tracking-tight')}>
            Everything you need, nothing you don't.
          </h2>
          <p className={clsx('text-[14px]', 'sm:text-[16px]', 'text-[var(--color-muted)]', 'max-w-md', 'mx-auto', 'leading-relaxed', 'font-medium')}>
            A visual budget planner that runs entirely on your terms, built for speed and absolute privacy.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className={clsx('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4', 'gap-6')}
        >
          {/* Card 1 */}
          <motion.div
            variants={itemVariants}
            className={clsx('p-6', 'rounded-[24px]', 'bg-[var(--color-card)]', 'border', 'border-[var(--color-border)]', 'shadow-sm', 'hover:shadow-md', 'transition-all', 'flex', 'flex-col', 'justify-between', 'group')}
          >
            <div className="space-y-4">
              <div className={clsx('w-12', 'h-12', 'rounded-2xl', 'bg-blue-50', 'dark:bg-blue-950/30', 'text-[var(--color-primary-light)]', 'flex', 'items-center', 'justify-center', 'group-hover:scale-105', 'transition-transform')}>
                <PieChart className={clsx('w-6', 'h-6')} />
              </div>
              <div className={clsx('space-y-2', 'text-left')}>
                <h3 className={clsx('text-[17px]', 'font-bold')}>Intelligent Spending Trends</h3>
                <p className={clsx('text-[13px]', 'text-[var(--color-muted)]', 'leading-relaxed')}>
                  No corporate tracking. Get clear, readable breakdowns of your weekly trends to understand exactly where your money goes.
                </p>
              </div>
            </div>
            <Link to="/register" className={clsx('mt-6', 'text-[13px]', 'font-bold', 'text-[var(--color-primary)]', 'flex', 'items-center', 'gap-1', 'group-hover:gap-2', 'transition-all')}>
              Get Started <ChevronRight className={clsx('w-4', 'h-4')} />
            </Link>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            variants={itemVariants}
            className={clsx('p-6', 'rounded-[24px]', 'bg-[var(--color-card)]', 'border', 'border-[var(--color-border)]', 'shadow-sm', 'hover:shadow-md', 'transition-all', 'flex', 'flex-col', 'justify-between', 'group')}
          >
            <div className="space-y-4">
              <div className={clsx('w-12', 'h-12', 'rounded-2xl', 'bg-indigo-50', 'dark:bg-indigo-950/30', 'text-[var(--color-primary)]', 'flex', 'items-center', 'justify-center', 'group-hover:scale-105', 'transition-transform')}>
                <TrendingUp className={clsx('w-6', 'h-6')} />
              </div>
              <div className={clsx('space-y-2', 'text-left')}>
                <h3 className={clsx('text-[17px]', 'font-bold')}>Smart Category Budgets</h3>
                <p className={clsx('text-[13px]', 'text-[var(--color-muted)]', 'leading-relaxed')}>
                  Set limits that adapt to your lifestyle. Leftover funds roll over automatically, and we'll alert you before you exceed them.
                </p>
              </div>
            </div>
            <Link to="/register" className={clsx('mt-6', 'text-[13px]', 'font-bold', 'text-[var(--color-primary)]', 'flex', 'items-center', 'gap-1', 'group-hover:gap-2', 'transition-all')}>
              Get Started <ChevronRight className={clsx('w-4', 'h-4')} />
            </Link>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={itemVariants}
            className={clsx('p-6', 'rounded-[24px]', 'bg-[var(--color-card)]', 'border', 'border-[var(--color-border)]', 'shadow-sm', 'hover:shadow-md', 'transition-all', 'flex', 'flex-col', 'justify-between', 'group')}
          >
            <div className="space-y-4">
              <div className={clsx('w-12', 'h-12', 'rounded-2xl', 'bg-emerald-50', 'dark:bg-emerald-950/30', 'text-[var(--color-success)]', 'flex', 'items-center', 'justify-center', 'group-hover:scale-105', 'transition-transform')}>
                <PiggyBank className={clsx('w-6', 'h-6')} />
              </div>
              <div className={clsx('space-y-2', 'text-left')}>
                <h3 className={clsx('text-[17px]', 'font-bold')}>Goal-Oriented Savings</h3>
                <p className={clsx('text-[13px]', 'text-[var(--color-muted)]', 'leading-relaxed')}>
                  Create visual milestones for what you care about most. See projected dates and fund them directly from your active wallets.
                </p>
              </div>
            </div>
            <Link to="/register" className={clsx('mt-6', 'text-[13px]', 'font-bold', 'text-[var(--color-primary)]', 'flex', 'items-center', 'gap-1', 'group-hover:gap-2', 'transition-all')}>
              Get Started <ChevronRight className={clsx('w-4', 'h-4')} />
            </Link>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            variants={itemVariants}
            className={clsx('p-6', 'rounded-[24px]', 'bg-[var(--color-card)]', 'border', 'border-[var(--color-border)]', 'shadow-sm', 'hover:shadow-md', 'transition-all', 'flex', 'flex-col', 'justify-between', 'group')}
          >
            <div className="space-y-4">
              <div className={clsx('w-12', 'h-12', 'rounded-2xl', 'bg-slate-100', 'dark:bg-slate-900/50', 'text-[var(--color-text)]', 'flex', 'items-center', 'justify-center', 'group-hover:scale-105', 'transition-transform')}>
                <Shield className={clsx('w-6', 'h-6')} />
              </div>
              <div className={clsx('space-y-2', 'text-left')}>
                <h3 className={clsx('text-[17px]', 'font-bold')}>Zero-Knowledge Privacy</h3>
                <p className={clsx('text-[13px]', 'text-[var(--color-muted)]', 'leading-relaxed')}>
                  Your data belongs to you. Built with local passcode locks and client-side encryption, no one else can ever access your details.
                </p>
              </div>
            </div>
            <Link to="/register" className={clsx('mt-6', 'text-[13px]', 'font-bold', 'text-[var(--color-primary)]', 'flex', 'items-center', 'gap-1', 'group-hover:gap-2', 'transition-all')}>
              Get Started <ChevronRight className={clsx('w-4', 'h-4')} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Bottom Section */}
      <section className={clsx('px-6', 'py-20', 'bg-gradient-to-br', 'from-[#192f5a]', 'to-[#725bd0]', 'text-white', 'relative', 'overflow-hidden')}>
        <div className={clsx('absolute', 'top-1/2', 'left-1/2', '-translate-x-1/2', '-translate-y-1/2', 'w-[600px]', 'h-[600px]', 'bg-white/5', 'rounded-full', 'blur-3xl', 'pointer-events-none', '-z-10')} />

        <div className={clsx('max-w-4xl', 'mx-auto', 'text-center', 'space-y-8')}>
          <h2 className={clsx('text-[32px]', 'sm:text-[48px]', 'font-black', 'tracking-tight', 'leading-none')}>
            Ready for a clearer picture?
          </h2>
          <p className={clsx('text-[15px]', 'sm:text-[17px]', 'text-indigo-100', 'max-w-lg', 'mx-auto', 'leading-relaxed', 'font-medium')}>
            Take the stress out of tracking. Experience the clean, private way to map your financial freedom today.
          </p>
          <div className={clsx('pt-4', 'flex', 'flex-col', 'sm:flex-row', 'items-center', 'justify-center', 'gap-4')}>
            <button
              onClick={handleStartClick}
              className={clsx('w-full', 'sm:w-auto', 'py-4', 'px-8', 'rounded-2xl', 'bg-white', 'text-[#192f5a]', 'font-bold', 'text-[16px]', 'hover:bg-slate-100', 'transition-all', 'flex', 'items-center', 'justify-center', 'gap-2', 'haptic', 'shadow-xl')}
            >
              Get Started Now
              <ArrowRight className={clsx('w-5', 'h-5')} />
            </button>
            {!isAuthenticated && (
              <Link
                to="/login"
                className={clsx('w-full', 'sm:w-auto', 'py-4', 'px-8', 'rounded-2xl', 'bg-white/10', 'hover:bg-white/15', 'text-white', 'font-bold', 'text-[16px]', 'border', 'border-white/20', 'transition-all', 'flex', 'items-center', 'justify-center', 'gap-2')}
              >
                Sign In to Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={clsx('border-t', 'border-[var(--color-border)]/50', 'bg-[var(--color-card)]', 'px-6', 'py-12', 'text-[var(--color-text)]', 'transition-colors')}>
        <div className={clsx('max-w-6xl', 'mx-auto', 'flex', 'flex-col', 'sm:flex-row', 'items-center', 'justify-between', 'gap-6')}>
          <div className={clsx('flex', 'items-center', 'gap-2')}>
            <img src={darkMode ? '/logo-blank.png' : '/logo-blank.png'} className={clsx('w-6', 'h-6', 'object-contain')} alt="Finora Logo" />
            <span className={clsx('text-[17px]', 'font-extrabold', 'tracking-tight', 'bg-gradient-to-r', 'from-[var(--color-primary)]', 'to-[var(--color-primary-light)]', 'bg-clip-text', 'text-transparent')}>
              Finora
            </span>
          </div>

          <p className={clsx('text-[12px]', 'text-[var(--color-muted)]', 'font-medium')}>
            © {new Date().getFullYear()} Finora Money Tracker. Built for secure, modern wealth mapping.
          </p>
        </div>
      </footer>
    </div>
  );
}
