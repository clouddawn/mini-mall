// 会员（心悦等级）规则 —— 唯一配置入口
// 金额一律以"分"为单位
import type { MembershipLevel } from '@/types'

export interface MembershipTier {
  level: MembershipLevel
  name: string
  threshold: number // 累计消费门槛（分）
  rate: number // 折扣率，1 = 无折扣
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  { level: 0, name: '普通用户', threshold: 0, rate: 1 },
  { level: 1, name: '心悦1', threshold: 800_000, rate: 0.98 }, // ¥8,000 → 9.8 折
  { level: 2, name: '心悦2', threshold: 8_000_000, rate: 0.95 }, // ¥80,000 → 9.5 折
  { level: 3, name: '心悦3', threshold: 80_000_000, rate: 0.9 }, // ¥800,000 → 9 折
]

/** 根据累计消费金额计算会员等级 */
export function getMembershipLevel(totalSpent: number): MembershipLevel {
  let level: MembershipLevel = 0
  for (const tier of MEMBERSHIP_TIERS) {
    if (totalSpent >= tier.threshold) level = tier.level
  }
  return level
}

/** 获取指定等级的信息（等级参数来自数据库，接受 number 并收敛到合法区间） */
export function getTier(level: number): MembershipTier {
  return MEMBERSHIP_TIERS[level] ?? MEMBERSHIP_TIERS[0]
}

/** 获取下一等级（用于进度条），已是最高级时返回 null */
export function getNextTier(level: number): MembershipTier | null {
  return MEMBERSHIP_TIERS[level + 1] ?? null
}

/** 折扣率文案，如 9.8 折 */
export function discountLabel(rate: number): string {
  return `${(rate * 10).toFixed(rate === 0.95 || rate === 0.98 ? 1 : 0)}折`
}

/** 对原价应用折扣，返回折后总价与折扣金额（分，向下取整） */
export function applyDiscount(originalTotal: number, level: number): { discountedTotal: number; discountAmount: number } {
  const { rate } = getTier(level)
  if (rate >= 1) return { discountedTotal: originalTotal, discountAmount: 0 }
  const discountedTotal = Math.floor(originalTotal * rate)
  return { discountedTotal, discountAmount: originalTotal - discountedTotal }
}

/** 计算商品清单原价合计（消除多处重复的 reduce） */
export function calcCartTotal(items: { product: { price: number }; quantity: number }[]): number {
  return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
}
