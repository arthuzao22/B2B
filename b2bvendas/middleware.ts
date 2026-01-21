import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { rateLimitByIp } from '@/lib/security/rate-limiter'
import { csrfProtection, injectCsrfToken } from '@/lib/security/csrf'
import { securityHeadersMiddleware } from '@/lib/security/security-headers'
import { logUnauthorizedAccess, logRateLimitExceeded, logCsrfFailure } from '@/modules/audit/audit.service'

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Apply rate limiting (skip for static files)
    if (!pathname.startsWith('/_next') && !pathname.startsWith('/static')) {
      const rateLimitResponse = await rateLimitByIp(req, {
        windowMs: 60000, // 1 minute
        max: 100, // 100 requests per minute
        keyPrefix: 'global',
      });
      
      if (rateLimitResponse) {
        await logRateLimitExceeded(req, pathname);
        return rateLimitResponse;
      }
    }

    // Apply CSRF protection for state-changing requests
    const csrfResponse = await csrfProtection(req);
    if (csrfResponse) {
      await logCsrfFailure(req);
      return csrfResponse;
    }

    // Check role-based access
    if (pathname.startsWith('/dashboard/fornecedor')) {
      if (token?.role !== 'FORNECEDOR' && token?.role !== 'ADMIN') {
        await logUnauthorizedAccess(req, token?.sub, 'Access to supplier dashboard denied');
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    if (pathname.startsWith('/dashboard/cliente')) {
      if (token?.role !== 'CLIENT' && token?.role !== 'ADMIN') {
        await logUnauthorizedAccess(req, token?.sub, 'Access to client dashboard denied');
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        await logUnauthorizedAccess(req, token?.sub, 'Access to admin panel denied');
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    // Apply request timeout (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      let response = NextResponse.next();

      // Inject CSRF token for safe methods
      response = injectCsrfToken(req, response);

      // Apply security headers
      response = securityHeadersMiddleware(response, {
        contentSecurityPolicy: true,
        strictTransportSecurity: true,
        xFrameOptions: 'SAMEORIGIN',
        xContentTypeOptions: true,
      });

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Public routes
        const publicRoutes = [
          '/',
          '/login',
          '/register',
          '/fornecedores',
          '/catalogo-publico'
        ]

        // Check if route is public
        if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
          return true
        }

        // Require authentication for all other routes
        return !!token
      }
    },
    pages: {
      signIn: '/login'
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth (NextAuth API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)'
  ]
}
