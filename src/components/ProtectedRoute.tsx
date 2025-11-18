import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/components/AuthProvider';
import { UserRole } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requireAuth?: boolean;
}

/**
 * ProtectedRoute - Route guard with role-based access control
 * Redirects unauthorized users to /auth with access denied toast
 * @component
 */
export const ProtectedRoute = ({
  children,
  requiredRole,
  requireAuth = true,
}: ProtectedRouteProps) => {
  const { user, role, loading, isAdmin, isSuperAdmin } = useAuthContext();
  const location = useLocation();
  const { toast } = useToast();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="space-y-4 w-full max-w-md p-6">
          <Skeleton className="h-12 w-full glass-morph" />
          <Skeleton className="h-12 w-full glass-morph" />
          <Skeleton className="h-12 w-full glass-morph" />
        </div>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole && role) {
    const roleHierarchy: Record<UserRole, number> = {
      user: 1,
      editor: 2,
      admin: 3,
      super_admin: 4,
      enterprise: 3,
    };

    const userRoleLevel = roleHierarchy[role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      toast({
        title: 'Access Denied',
        description: `You need ${requiredRole} role to access this page.`,
        variant: 'destructive',
      });
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

