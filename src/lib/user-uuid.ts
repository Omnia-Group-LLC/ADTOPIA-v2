// src/lib/utils/user-uuid.ts
import { supabase } from '@/integrations/supabase/client';

/**
 * Real-Time UUID Fetching Utilities
 * Replaces hardcoded UUIDs with dynamic lookups
 */

export interface UserUUIDResult {
  success: boolean;
  uuid?: string;
  email?: string;
  method: 'session' | 'email' | 'cache';
  fetchTime?: number;
  error?: string;
}

/**
 * Get current user UUID from active session
 * Use this for authenticated operations
 */
export async function getCurrentUserUUID(): Promise<UserUUIDResult> {
  const startTime = Date.now();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    if (!user) {
      return {
        success: false,
        method: 'session',
        error: 'No authenticated user session found'
      };
    }

    return {
      success: true,
      uuid: user.id,
      email: user.email,
      method: 'session',
      fetchTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      success: false,
      method: 'session',
      error: error instanceof Error ? error.message : 'Unknown error',
      fetchTime: Date.now() - startTime
    };
  }
}

/**
 * Get user UUID by email address
 * Use this for admin operations or user lookups
 * 
 * NOTE: Client-side UUID lookup by email is restricted for security.
 * For production, use an edge function with service_role key to query auth.users.
 * 
 * Alternative: Query user_access table if email is stored there
 */
export async function getUserUUIDByEmail(email: string): Promise<UserUUIDResult> {
  const startTime = Date.now();
  
  try {
    // Query user_access table (contains email + user_id)
    const { data, error } = await supabase
      .from('user_access')
      .select('user_id, email')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return {
        success: false,
        method: 'email',
        error: `No user found for email: ${email}. Use edge function for auth.users lookup.`,
        fetchTime: Date.now() - startTime
      };
    }

    return {
      success: true,
      uuid: data.user_id || undefined,
      email,
      method: 'email',
      fetchTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      success: false,
      method: 'email',
      error: error instanceof Error ? error.message : 'Unknown error',
      fetchTime: Date.now() - startTime
    };
  }
}

/**
 * Check if current user has admin role
 * Uses dynamic UUID from session
 */
export async function checkAdminRole(): Promise<boolean> {
  const userResult = await getCurrentUserUUID();
  if (!userResult.success || !userResult.uuid) return false;

  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userResult.uuid)
      .eq('role', 'admin')
      .single();

    return !error && !!data;
  } catch {
    return false;
  }
}

/**
 * Log UUID fetch for audit purposes
 * Use this to track UUID lookups in development
 */
export function logUUIDFetch(result: UserUUIDResult, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[UUID-FETCH] ${context || 'Lookup'}:`, {
      success: result.success,
      uuid: result.uuid ? `${result.uuid.substring(0, 8)}...` : 'N/A',
      email: result.email || 'N/A',
      method: result.method,
      fetchTime: result.fetchTime ? `${result.fetchTime}ms` : 'N/A',
      error: result.error
    });
  }
}

// Usage Examples:
// 
// 1. Get current user UUID (client-side after login):
//    const result = await getCurrentUserUUID();
//    if (result.success) {
//      await insertUserAccess(result.uuid, 'STARTER');
//    }
//
// 2. Get UUID by email (admin operations):
//    const result = await getUserUUIDByEmail('user@example.com');
//    if (result.success) {
//      await grantUserRole(result.uuid, 'admin');
//    }
//
// 3. Check admin status:
//    const isAdmin = await checkAdminRole();
//    if (isAdmin) {
//      // Show admin features
//    }
