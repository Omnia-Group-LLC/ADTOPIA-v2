import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/components/AuthProvider';

/**
 * AuthRedirect - Automatic redirect logic for authenticated users
 * Redirects logged-in users away from /auth to /dashboard
 * @component
 */
export const AuthRedirect = () => {
  const { isAuthenticated, loading } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    // If on auth page and already authenticated, redirect to dashboard
    if (isAuthenticated && location.pathname === '/auth') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  return null;
};

