import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * 路由守卫（轻量级）：
 * 仅检查 token cookie 是否存在，完整 JWT 验证在 getSession() 中进行。
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // 受保护的路径前缀
  const protectedPrefixes = ['/cart', '/checkout', '/orders', '/admin']

  if (protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
