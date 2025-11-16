import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@modules/api/supabase/client';
import type { User } from '@modules/core/types';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (inviteCode: string, email: string, password: string, name: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Map Supabase user to our User type
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email || '',
          tenant_id: session.user.user_metadata?.tenant_id || '',
          mfa_enabled: false,
          email_verified: session.user.email_confirmed_at !== null,
          created_at: session.user.created_at || new Date().toISOString(),
        });
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email || '',
          tenant_id: session.user.user_metadata?.tenant_id || '',
          mfa_enabled: false,
          email_verified: session.user.email_confirmed_at !== null,
          created_at: session.user.created_at || new Date().toISOString(),
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email || '',
          tenant_id: data.user.user_metadata?.tenant_id || '',
          mfa_enabled: false,
          email_verified: data.user.email_confirmed_at !== null,
          created_at: data.user.created_at || new Date().toISOString(),
        });
        return { success: true };
      }

      return { success: false, message: 'Login failed' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    inviteCode: string, 
    email: string, 
    password: string, 
    name: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            tenant_id: inviteCode, // Using inviteCode as tenant_id for now
          }
        }
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || name,
          tenant_id: data.user.user_metadata?.tenant_id || inviteCode,
          mfa_enabled: false,
          email_verified: false,
          created_at: data.user.created_at || new Date().toISOString(),
        });
        return { success: true };
      }

      return { success: false, message: 'Registration failed' };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, message: error.message || 'Registration failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
          tenant_id: updates.tenant_id,
        }
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.user && user) {
        setUser({
          ...user,
          ...updates,
        });
        return { success: true };
      }

      return { success: false, message: 'Failed to update user' };
    } catch (error: any) {
      console.error('Update user error:', error);
      return { success: false, message: error.message || 'Failed to update user' };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
