import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/types'
import { getTier, getNextTier, discountLabel } from '@/lib/membership'
import { Badge } from '@/components/ui/Badge'
import { UserForm } from '@/components/admin/UserForm'
import { DeleteButton } from '@/components/admin/DeleteButton'

export const metadata: Metadata = { title: '用户详情 · 管理后台' }
export const dynamic = 'force-dynamic'

interface AdminUserDetailProps {
  params: Promise<{ id: string }>
}

export default async function AdminUserDetailPage({ params }: AdminUserDetailProps) {
  const { id } = await params
  const session = await getSession()

  const userId = Number(id)
  if (!Number.isInteger(userId)) notFound()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })
  if (!user) notFound()

  const isSelf = user.id === session.userId
  const tier = getTier(user.membershipLevel)
  const nextTier = getNextTier(user.membershipLevel)
  const progress = nextTier
    ? Math.min(100, Math.round(((user.totalSpent - tier.threshold) / (nextTier.threshold - tier.threshold)) * 100))
    : 100

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-ink-faint uppercase">Users / Detail</p>
          <h1 className="font-display mt-1 text-3xl font-semibold">用户 #{String(user.id).padStart(4, '0')}</h1>
        </div>
        {!isSelf && <DeleteButton id={user.id} kind="user" confirmText={`确定删除用户「${user.name}」？`} />}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 用户信息（可编辑） */}
        <div className="border border-line bg-card p-6">
          <p className="mb-4 text-xs tracking-[0.25em] text-ink-faint uppercase">用户信息</p>
          <UserForm user={user} isSelf={isSelf} />
          <div className="hairline my-5" />
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-ink-faint">邮箱</dt>
              <dd className="truncate">{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-ink-faint">注册时间</dt>
              <dd className="num">{user.createdAt.toLocaleString('zh-CN', { hour12: false })}</dd>
            </div>
          </dl>
        </div>

        {/* 会员信息（只读） */}
        <div className="border border-line bg-card p-6">
          <p className="mb-4 text-xs tracking-[0.25em] text-ink-faint uppercase">会员信息</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-soft">心悦等级</span>
            {tier.level > 0 ? (
              <Badge className={tier.badge}>{tier.name}</Badge>
            ) : (
              <span className="text-sm text-ink-faint">普通用户</span>
            )}
          </div>
          {tier.level > 0 && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-ink-soft">当前折扣</span>
              <span className="num text-lg font-medium text-vermilion">{discountLabel(tier.rate)}</span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-ink-soft">累计消费</span>
            <span className="num">{formatPrice(user.totalSpent)}</span>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink/10">
            <div className="h-full rounded-full bg-vermilion" style={{ width: `${progress}%` }} />
          </div>
          {nextTier ? (
            <p className="mt-2 text-xs text-ink-faint">
              再消费 <span className="num">{formatPrice(nextTier.threshold - user.totalSpent)}</span> 升级为「
              {nextTier.name}」（{discountLabel(nextTier.rate)}）
            </p>
          ) : (
            <p className="mt-2 text-xs text-ink-faint">已达最高会员等级</p>
          )}
        </div>
      </div>

      {/* 该用户订单 */}
      <div className="mt-10 mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold">最近订单</h2>
        {user.orders.length > 0 && (
          <p className="num text-xs text-ink-faint">仅显示最近 {user.orders.length} 笔</p>
        )}
      </div>
      {user.orders.length === 0 ? (
        <p className="border border-dashed border-line py-12 text-center text-sm text-ink-faint">该用户暂无订单</p>
      ) : (
        <div className="overflow-x-auto border border-line bg-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-ink-faint">
                <th className="px-4 py-3 font-medium">订单号</th>
                <th className="px-4 py-3 font-medium">件数</th>
                <th className="px-4 py-3 font-medium">金额</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">时间</th>
              </tr>
            </thead>
            <tbody>
              {user.orders.map((o) => {
                const status = o.status as OrderStatus
                return (
                  <tr key={o.id} className="border-b border-line/60 last:border-0 hover:bg-paper">
                    <td className="num px-4 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="hover:text-vermilion">
                        #{String(o.id).padStart(6, '0')}
                      </Link>
                    </td>
                    <td className="num px-4 py-3 text-xs text-ink-faint">
                      {o.items.reduce((s, i) => s + i.quantity, 0)} 件
                    </td>
                    <td className="num px-4 py-3">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <Badge className={ORDER_STATUS_COLORS[status]}>{ORDER_STATUS_LABELS[status]}</Badge>
                    </td>
                    <td className="num px-4 py-3 text-xs text-ink-faint">
                      {o.createdAt.toLocaleString('zh-CN', { hour12: false })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
