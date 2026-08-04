import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { formatPrice } from '@/types'
import { MEMBERSHIP_TIERS, getTier, getNextTier, discountLabel } from '@/lib/membership'

export const metadata: Metadata = { title: '我的 · Mini Mall' }
export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const session = await getSession()

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { orders: { where: { status: { not: 'CANCELLED' } } } },
  })
  if (!user) return null

  const tier = getTier(user.membershipLevel)
  const nextTier = getNextTier(user.membershipLevel)

  // 到下一等级的进度（当前等级门槛 → 下一等级门槛）
  const progress = nextTier
    ? Math.min(100, Math.round(((user.totalSpent - tier.threshold) / (nextTier.threshold - tier.threshold)) * 100))
    : 100

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 border-b border-line pb-6">
        <p className="text-[10px] tracking-[0.3em] text-ink-faint uppercase">Profile</p>
        <h1 className="font-display mt-1 text-3xl font-semibold">我的</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-5">
        {/* 会员卡 */}
        <div className="md:col-span-3">
          <div className="border border-line bg-card p-6">
            <p className="mb-4 text-[10px] tracking-[0.3em] text-ink-faint uppercase">心悦会员</p>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-display text-2xl font-semibold">
                  {user.name}
                  {tier.level > 0 && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 align-middle text-xs font-medium text-amber-800">{tier.name}</span>}
                </p>
                <p className="num mt-1 text-sm text-ink-soft">{user.email}</p>
              </div>
              {tier.level > 0 && (
                <div className="text-right">
                  <p className="text-[10px] tracking-widest text-ink-faint">当前折扣</p>
                  <p className="font-display text-3xl font-semibold text-vermilion">{discountLabel(tier.rate)}</p>
                </div>
              )}
            </div>

            <div className="hairline my-5" />

            {/* 累计消费与升级进度 */}
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink-soft">累计消费</span>
              <span className="num text-xl font-medium">{formatPrice(user.totalSpent)}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10">
              <div className="h-full rounded-full bg-vermilion" style={{ width: `${progress}%` }} />
            </div>
            {nextTier ? (
              <p className="mt-2 text-xs text-ink-faint">
                再消费 <span className="num">{formatPrice(nextTier.threshold - user.totalSpent)}</span> 即可升级为
                「{nextTier.name}」{nextTier.level > 0 && `（${discountLabel(nextTier.rate)}）`}
              </p>
            ) : (
              <p className="mt-2 text-xs text-ink-faint">已达最高会员等级</p>
            )}
          </div>

          <div className="mt-6 flex gap-4">
            <Link href="/orders" className="btn flex-1 border border-ink/25 px-4 py-2.5 text-center text-sm hover:border-ink hover:bg-ink hover:text-paper">
              我的订单 →
            </Link>
            <Link href="/cart" className="btn flex-1 border border-ink/25 px-4 py-2.5 text-center text-sm hover:border-ink hover:bg-ink hover:text-paper">
              购物车 →
            </Link>
          </div>
        </div>

        {/* 等级权益 */}
        <div className="md:col-span-2">
          <h2 className="font-display mb-3 text-lg font-semibold">等级权益</h2>
          <ul className="border-t border-line">
            {MEMBERSHIP_TIERS.slice(1).map((t) => {
              const achieved = user.totalSpent >= t.threshold
              return (
                <li
                  key={t.level}
                  className={`flex items-center justify-between gap-3 border-b border-line py-4 text-sm ${
                    achieved ? '' : 'text-ink-faint'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                        achieved ? 'bg-amber-100 text-amber-800' : 'bg-ink/5 text-ink-faint'
                      }`}
                    >
                      {t.level}
                    </span>
                    <span>
                      <span className="font-medium">{t.name}</span>
                      <span className="num mt-0.5 block text-xs text-ink-faint">累计消费 {formatPrice(t.threshold)}</span>
                    </span>
                  </div>
                  <span className={`num shrink-0 ${achieved ? 'text-vermilion' : ''}`}>{discountLabel(t.rate)}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
