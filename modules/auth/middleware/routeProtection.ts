/**
 * Route Protection Middleware
 * Blocks development routes in production builds
 */

// Development routes that should be blocked in production
const BLOCKED_ROUTES = [
  '/sandbox',
  '/debug',
  '/test',
  '/dev',
  '/auth-debug',
  '/upload-test',
  '/stripe-link-check',
  '/webhook-check',
  '/api-debug',
  '/component-test',
];

/**
 * Check if a route should be blocked in production
 */
export function shouldBlockRoute(pathname: string): boolean {
  // Allow all routes in development
  if (import.meta.env.DEV) {
    return false;
  }

  // Block development routes in production
  return BLOCKED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Get list of blocked routes (for testing/documentation)
 */
export function getBlockedRoutes(): string[] {
  return [...BLOCKED_ROUTES];
}

/**
 * Route protection result
 */
export interface RouteProtectionResult {
  allowed: boolean;
  redirectTo?: string;
  reason?: string;
}

/**
 * Check route protection
 */
export function routeProtection(pathname: string): RouteProtectionResult {
  if (shouldBlockRoute(pathname)) {
    return {
      allowed: false,
      redirectTo: '/404',
      reason: 'Development route blocked in production',
    };
  }

  return {
    allowed: true,
  };
}

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string,
  pathname: string,
  role?: string,
  ip?: string
): void {
  if (import.meta.env.DEV) {
    console.warn(`[Security] ${event}: ${pathname}`, { role, ip });
  }
  // In production, this would send to monitoring service
}
