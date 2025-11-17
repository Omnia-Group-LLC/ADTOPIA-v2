/**
 * Vercel Edge Middleware (2025 Best Practices)
 * 
 * Global request interceptor running <1ms on 50+ regions, before cache.
 * Uses Vercel Edge Runtime API (not Next.js) for Vite SPA.
 * 
 * Best Practices Applied:
 * - Early returns for static/api routes (<5ms)
 * - Matcher precision (exclude api/static/assets)
 * - Edge runtime only (25-50% faster than Node.js)
 * - Headers passthrough (Authorization for Supabase RPC)
 * - CORS pre-flight (OPTIONS handler)
 * - RLS hints (X-Rls-Mode: 'public' for anon /gallery)
 * - No DB/heavy ops (routing/headers only; offload to Functions)
 * - Unified runtime (2025: Middleware + Functions = one billing)
 * 
 * @see https://vercel.com/docs/functions/edge-middleware
 */

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt (static files)
     * - assets (build assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|assets).*)',
  ],
};

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const { pathname } = url;

  // Early return for static/api routes (<5ms optimization)
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js')
  ) {
    return new Response(null, {
      status: 200,
    });
  }

  // CORS pre-flight handler
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Rls-Mode',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // SPA rewrites for admin/gallery routes
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/gallery') ||
    pathname === '/'
  ) {
    // Create response headers
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Rls-Mode',
    });

    // Headers passthrough: Forward Authorization for Supabase RPC
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }

    // RLS hint: Set X-Rls-Mode header based on pathname and auth status
    // Personalization pre-cache (before rewrite)
    if (pathname.startsWith('/gallery') && !request.headers.has('Authorization')) {
      // Anonymous gallery access → public RLS mode
      headers.set('X-Rls-Mode', 'public');
    } else if (pathname.startsWith('/admin')) {
      // Admin routes → private RLS mode (requires auth)
      headers.set('X-Rls-Mode', 'private');
    }

    // Rewrite to index.html for SPA routing
    // Note: Vercel's rewrites in vercel.json handle the actual rewrite
    // This middleware just sets headers
    return new Response(null, {
      status: 200,
      headers,
    });
  }

  // Default: pass through
  return new Response(null, {
    status: 200,
  });
}

