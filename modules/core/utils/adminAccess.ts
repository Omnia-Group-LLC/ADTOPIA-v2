// Admin access LocalStorage utility
// Persists admin access for 24 hours after passcode verification

const ADMIN_ACCESS_KEY = 'admin_access';
const ACCESS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface AdminAccessData {
  granted: boolean;
  expiresAt: number;
  grantedAt: number;
}

/**
 * Save admin access to LocalStorage
 * @param expiresAt - Timestamp when access expires (from Edge Function)
 */
export function setAdminAccess(expiresAt: number): void {
  if (typeof window === 'undefined') return;
  
  const accessData: AdminAccessData = {
    granted: true,
    expiresAt: expiresAt,
    grantedAt: Date.now(),
  };
  
  try {
    localStorage.setItem(ADMIN_ACCESS_KEY, JSON.stringify(accessData));
  } catch (error) {
    console.error('Failed to save admin access to LocalStorage:', error);
  }
}

/**
 * Check if admin access is currently valid
 * @returns true if access is granted and not expired
 */
export function hasAdminAccess(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem(ADMIN_ACCESS_KEY);
    if (!stored) return false;
    
    const accessData: AdminAccessData = JSON.parse(stored);
    
    // Check if expired
    if (Date.now() >= accessData.expiresAt) {
      // Clean up expired access
      clearAdminAccess();
      return false;
    }
    
    return accessData.granted === true;
  } catch (error) {
    console.error('Failed to read admin access from LocalStorage:', error);
    return false;
  }
}

/**
 * Clear admin access from LocalStorage
 */
export function clearAdminAccess(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(ADMIN_ACCESS_KEY);
  } catch (error) {
    console.error('Failed to clear admin access from LocalStorage:', error);
  }
}

/**
 * Get remaining access time in milliseconds
 * @returns milliseconds until expiration, or 0 if expired/not granted
 */
export function getRemainingAccessTime(): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const stored = localStorage.getItem(ADMIN_ACCESS_KEY);
    if (!stored) return 0;
    
    const accessData: AdminAccessData = JSON.parse(stored);
    const remaining = accessData.expiresAt - Date.now();
    
    return remaining > 0 ? remaining : 0;
  } catch (error) {
    console.error('Failed to get remaining access time:', error);
    return 0;
  }
}
