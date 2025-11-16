/**
 * Safe Storage Utility - SSR Compatible
 * 
 * Provides localStorage access with proper window checks and error handling
 * to prevent crashes in server-side rendering environments.
 */

export const safeStorage = {
  get(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        return window.localStorage.getItem(key);
      }
    } catch {}
    return null;
  },

  set(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.setItem(key, value);
      }
    } catch {}
  },

  remove(key: string): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.removeItem(key);
      }
    } catch {}
  },

  clear(): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.clear();
      }
    } catch {}
  }
};

/**
 * Hook for React components to safely access localStorage
 */
export function useSafeStorage() {
  return safeStorage;
}
