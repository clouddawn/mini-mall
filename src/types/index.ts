// 与数据库存储值对应的联合类型
export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type UserRole = 'USER' | 'ADMIN'
export type MembershipLevel = 0 | 1 | 2 | 3

// 认证会话
export interface Session {
  userId: number
  role: UserRole
}

// 订单状态的中文文案与颜色（供 Badge 组件使用）
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: '待支付',
  PAID: '已支付',
  SHIPPED: '已发货',
  DELIVERED: '已完成',
  CANCELLED: '已取消',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  PAID: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-violet-100 text-violet-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
}

// 金额格式化（分为单位 → ¥xx.xx）
export function formatPrice(cents: number): string {
  return `¥${(cents / 100).toFixed(2)}`
}
