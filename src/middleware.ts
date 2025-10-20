import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/dashboard', '/settings']
const ADMIN = ['/admin', '/api/admin']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const needsAuth = PROTECTED.some(p => pathname.startsWith(p))
  const needsAdmin = ADMIN.some(p => pathname.startsWith(p))
  if (!needsAuth && !needsAdmin) return NextResponse.next()

  try {
    const r = await fetch(new URL('/api/auth/status', req.nextUrl.origin), {
      headers: { cookie: req.headers.get('cookie') ?? '' },
      cache: 'no-store',
    })
    if (!r.ok) throw new Error('status failed')
    const j: { authenticated?: boolean; isAdmin?: boolean } = await r.json()

    if (!j.authenticated) {
      const to = req.nextUrl.clone(); to.pathname = '/auth'
      return NextResponse.redirect(to)
    }
    if (needsAdmin && !j.isAdmin) {
      const to = req.nextUrl.clone(); to.pathname = '/auth'
      return NextResponse.redirect(to)
    }
    return NextResponse.next()
  } catch {
    const to = req.nextUrl.clone(); to.pathname = '/auth'
    return NextResponse.redirect(to)
  }
}

export const config = {
  matcher: ['/dashboard/:path*','/settings/:path*','/admin/:path*','/api/admin/:path*'],
}
