import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * AuthGuard — wraps protected routes.
 * Handles async session hydration gracefully with a loader, then
 * redirects to /login if user is not authenticated.
 */
export default function AuthGuard({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-muted)] font-medium">Securing session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
}


