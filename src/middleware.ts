import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED = ['/dashboard', '/settings']
const ADMIN = ['/admin', '/api/admin']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const needsAuth = PROTECTED.some(p => pathname.startsWith(p))
  const needsAdmin = ADMIN.some(p => pathname.startsWith(p))
  if (!needsAuth && !needsAdmin) return NextResponse.next()

  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll().map(c => ({ name: c.name, value: c.value })),
        setAll: (cookies) => cookies.forEach(({ name, value, options }) => res.cookies.set({ name, value, ...options })),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (needsAuth && !user) {
    const to = req.nextUrl.clone(); to.pathname = '/auth'
    return NextResponse.redirect(to)
  }

  if (needsAdmin) {
    if (!user?.email) {
      const to = req.nextUrl.clone(); to.pathname = '/auth'
      return NextResponse.redirect(to)
    }
    const { data: rows } = await supabase.from('admins').select('email').eq('email', user.email).limit(1)
    if (!rows?.length) {
      const to = req.nextUrl.clone(); to.pathname = '/auth'
      return NextResponse.redirect(to)
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*','/settings/:path*','/admin/:path*','/api/admin/:path*'],
}
