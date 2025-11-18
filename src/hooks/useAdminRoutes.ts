import { useMemo } from 'react';
import { adminRoutes, AdminRoute } from '@/lib/adminRoutes';
import { useAuthContext } from '@/components/AuthProvider';
import { UserRole } from '@/types';

const roleHierarchy: Record<UserRole | 'public', number> = {
  public: 0,
  user: 1,
  editor: 2,
  admin: 3,
  super_admin: 4,
  enterprise: 3, // Same as admin for now
};

/**
 * Hook to filter admin routes based on current user role
 * @returns {Object} Filtered routes and routes grouped by section
 */
export const useAdminRoutes = () => {
  const { role } = useAuthContext();

  const visibleRoutes = useMemo(() => {
    const currentRoleLevel = roleHierarchy[role || 'public'];
    
    return adminRoutes.filter((route) => {
      if (route.requiredRole === 'public') return true;
      const requiredLevel = roleHierarchy[route.requiredRole as UserRole];
      return currentRoleLevel >= requiredLevel;
    });
  }, [role]);

  const routesBySection = useMemo(() => {
    return {
      public: visibleRoutes.filter((r) => r.section === 'public'),
      user: visibleRoutes.filter((r) => r.section === 'user'),
      admin: visibleRoutes.filter((r) => r.section === 'admin'),
      super_admin: visibleRoutes.filter((r) => r.section === 'super_admin'),
    };
  }, [visibleRoutes]);

  return { visibleRoutes, routesBySection };
}

