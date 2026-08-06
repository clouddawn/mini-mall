import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { formatPrice } from '@/types'
import { getTier } from '@/lib/membership'
import { Badge } from '@/components/ui/Badge'
import { DeleteButton } from '@/components/admin/DeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const session = await getSession()
  const users = await prisma.user.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-ink-faint uppercase">Users</p>
          <h1 className="font-display mt-1 text-3xl font-semibold">用户管理</h1>
          <p className="num mt-1 text-xs text-ink-faint">共 {users.length} 个用户</p>
        </div>
      </div>

      <div className="overflow-x-auto border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink-faint">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">昵称</th>
              <th className="px-4 py-3 font-medium">邮箱</th>
              <th className="px-4 py-3 font-medium">角色</th>
              <th className="px-4 py-3 font-medium">会员</th>
              <th className="px-4 py-3 font-medium">累计消费</th>
              <th className="px-4 py-3 font-medium">订单</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-ink-faint">
                  暂无用户
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const tier = getTier(u.membershipLevel)
                return (
                  <tr key={u.id} className="border-b border-line/60 last:border-0 hover:bg-paper">
                    <td className="num px-4 py-3 text-xs text-ink-faint">#{u.id}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${u.id}`} className="font-medium hover:text-vermilion">
                        {u.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-soft">{u.email}</td>
                    <td className="px-4 py-3">
                      {u.role === 'ADMIN' ? (
                        <Badge className="bg-vermilion text-white">管理员</Badge>
                      ) : (
                        <Badge className="bg-ink/10 text-ink-soft">用户</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {tier.level > 0 ? (
                        <Badge className={tier.badge}>{tier.name}</Badge>
                      ) : (
                        <span className="text-xs text-ink-faint">—</span>
                      )}
                    </td>
                    <td className="num px-4 py-3">{formatPrice(u.totalSpent)}</td>
                    <td className="num px-4 py-3">{u._count.orders}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="text-xs text-ink-soft underline-offset-4 hover:text-ink hover:underline"
                        >
                          编辑
                        </Link>
                        {u.id !== session.userId && (
                          <DeleteButton id={u.id} kind="user" confirmText={`确定删除用户「${u.name}」？`} />
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
