/**
 * Onboarding step configuration — pure data, zero React.
 * Each step defines visual theming + copy for one onboarding screen.
 */
export const ONBOARDING_STEPS = [
  {
    id: 'wallet',
    gradient: 'linear-gradient(160deg, #0a081a, #1f1b3a, #181829)',
    accent: '#007AFF',
    accentGlow: 'rgba(0,122,255,0.3)',
    title: 'Welcome to Finora',
    subtitle: 'Your Premium Finance Companion',
    description:
      'Track income, expenses, and transfers across multiple accounts with a beautifully crafted experience.',
    illustration: 'wallet',
  },
  {
    id: 'analytics',
    gradient: 'linear-gradient(160deg, #10001f, #2a1450, #1b0e30)',
    accent: '#AF52DE',
    accentGlow: 'rgba(175,82,222,0.3)',
    title: 'Smart Analytics',
    subtitle: 'Insights at a Glance',
    description:
      'Beautiful charts, category breakdowns, monthly trends, and budget insights — all in real-time.',
    illustration: 'chart',
  },

];


