import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User, Session } from '@supabase/supabase-js';
import type { UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName?: string) => Promise<any>;
  signOut: () => Promise<any>;
  hasRole: (requiredRole: UserRole) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isEditor: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * AuthProvider - Real authentication context using Supabase
 * Replaces mock UserRoleProvider with server-side role validation
 * @component
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access current user authentication and role
 * @throws Error if used outside AuthProvider
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

