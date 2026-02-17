import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Check role-based access
    if (pathname.startsWith('/dashboard/fornecedor')) {
      if (token?.tipo !== 'fornecedor' && token?.tipo !== 'admin') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    if (pathname.startsWith('/dashboard/cliente')) {
      if (token?.tipo !== 'cliente' && token?.tipo !== 'admin') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    if (pathname.startsWith('/dashboard/admin')) {
      if (token?.tipo !== 'admin') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
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
