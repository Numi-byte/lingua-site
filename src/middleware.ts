import { NextRequest, NextResponse } from 'next/server'

/**
 * Edge-safe middleware:
 * - Only checks for presence of the Supabase access cookie
 * - For admin paths, calls a Node API (/api/auth/status) to verify admin
 *   (avoids importing Supabase libs in Edge)
 */

const PROTECTED = ['/dashboard', '/settings']
const ADMIN = ['/admin', '/api/admin']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p))
  const needsAdmin = ADMIN.some((p) => pathname.startsWith(p))
  if (!needsAuth && !needsAdmin) return NextResponse.next()

  // Supabase Auth cookie (Auth Helpers default cookie name)
  const hasAccess = Boolean(req.cookies.get('sb-access-token')?.value)

  // If not signed in → send to /auth
  if ((needsAuth || needsAdmin) && !hasAccess) {
    const to = req.nextUrl.clone()
    to.pathname = '/auth'
    return NextResponse.redirect(to)
  }

  // For admin routes, verify admin via server API (runs in Node runtime)
  if (needsAdmin) {
    try {
      const r = await fetch(new URL('/api/auth/status', req.nextUrl.origin), {
        // forward cookies so API can read the session
        headers: { cookie: req.headers.get('cookie') ?? '' },
        cache: 'no-store',
      })
      if (!r.ok) {
        const to = req.nextUrl.clone()
        to.pathname = '/auth'
        return NextResponse.redirect(to)
      }
      const j: { isAdmin?: boolean } = await r.json()
      if (!j.isAdmin) {
        const to = req.nextUrl.clone()
        to.pathname = '/auth'
        return NextResponse.redirect(to)
      }
    } catch {
      const to = req.nextUrl.clone()
      to.pathname = '/auth'
      return NextResponse.redirect(to)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/admin/:path*', '/api/admin/:path*'],
}
