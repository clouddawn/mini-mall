import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import type { Session } from '@/types'

// JWT_SECRET：生产环境必须显式配置，避免使用公开的默认密钥
const secret = process.env.JWT_SECRET
if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET 环境变量未设置，请在生产环境配置')
}
const JWT_SECRET = new TextEncoder().encode(secret ?? 'dev-secret')
const COOKIE_NAME = 'token'
const SALT_ROUNDS = 12

// ── 密码哈希 ──────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ── Token 签发 / 验证 ─────────────────────────────────
export async function createToken(payload: Session): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

/**
 * 读取并验证当前请求的会话。
 * 未登录时重定向到 /login（适用于受保护页面 / Server Action）。
 */
export async function getSession(): Promise<Session> {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) redirect('/login')

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      userId: payload.userId as number,
      role: payload.role as Session['role'],
    }
  } catch {
    redirect('/login')
  }
}

/**
 * 读取会话，未登录时返回 null（适用于公开页面如 Header，不重定向）。
 */
export async function getSessionSafe(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      userId: payload.userId as number,
      role: payload.role as Session['role'],
    }
  } catch {
    return null
  }
}

// ── Cookie 管理 ───────────────────────────────────────
export async function setSessionCookie(session: Session): Promise<void> {
  const token = await createToken(session)
  ;(await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 天
    path: '/',
  })
}

export async function clearSessionCookie(): Promise<void> {
  ;(await cookies()).delete(COOKIE_NAME)
}

/** 管理员守卫：非管理员重定向到首页 */
export async function requireAdmin(): Promise<Session> {
  const session = await getSession()
  if (session.role !== 'ADMIN') redirect('/')
  return session
}
