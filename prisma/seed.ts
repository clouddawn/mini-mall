/**
 * Mini Mall 种子数据
 * 用法：npx prisma db seed（或 npx tsx prisma/seed.ts）
 * 会生成：
 *  - 管理员 admin@minimall.dev / admin123
 *  - 演示用户 user@minimall.dev / user123
 *  - 4 个分类、16 件商品（本地生成 SVG 占位图，离线可用）
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'node:fs'
import path from 'node:path'

const prisma = new PrismaClient()

// 生成产品专属卡通图（纸墨色系的线条风格 SVG）
const PALETTE = [
  ['#c8452f', '#f3e3dd'], // 朱砂
  ['#1c1a17', '#e6e0d5'], // 墨黑
  ['#b08a2e', '#f5ecd8'], // 金
  ['#6f8f5f', '#e8efe3'], // 鼠尾草绿
  ['#5b7c99', '#e3ebf2'], // 雾蓝
]

// 各产品的卡通图形（元素使用 fg 描边，bg 背景）
const PRODUCT_ART: Record<string, (fg: string) => string> = {
  // ── 咖啡器具 ──
  'coffee-tools-1': (c) => `
    <path d="M110 190 L130 70 L190 70 L210 190 Z" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M150 70 L150 55 L170 55 L170 70" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M145 55 L155 40 L165 55 Z" fill="none" stroke="${c}" stroke-width="2"/>
    <path d="M125 90 L195 90 L175 120 L145 120 Z" fill="none" stroke="${c}" stroke-width="2"/>
    <path d="M135 120 L165 120 L155 150 L145 150 Z" fill="none" stroke="${c}" stroke-width="2"/>`,
  'coffee-tools-2': (c) => `
    <path d="M120 60 L140 175 L180 175 L200 60 Z" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M118 70 L202 70" stroke="${c}" stroke-width="2"/>
    <path d="M145 90 L175 90 M140 110 L180 110 M136 130 L184 130" stroke="${c}" stroke-width="2"/>
    <path d="M158 175 L162 188" stroke="${c}" stroke-width="3"/>
    <path d="M135 60 L115 45 M185 60 L205 45" stroke="${c}" stroke-width="2"/>`,
  'coffee-tools-3': (c) => `
    <path d="M120 65 L110 190 L210 190 L200 65 Z" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M120 65 C120 40 200 40 200 65" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M110 100 L85 100 L85 120 L105 120" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M125 110 L195 110 M120 140 L200 140 M116 170 L204 170" stroke="${c}" stroke-width="2"/>
    <path d="M140 175 L150 185 L160 175" fill="none" stroke="${c}" stroke-width="2"/>`,
  'coffee-tools-4': (c) => `
    <circle cx="150" cy="150" r="45" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M150 105 C150 75 200 70 205 55" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M205 55 L215 48 L208 62 Z" fill="${c}"/>
    <path d="M115 135 L85 120 L90 95 L115 110" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M150 175 L150 195 M135 195 L165 195" stroke="${c}" stroke-width="2"/>`,

  // ── 文具 ──
  'stationery-1': (c) => `
    <path d="M160 70 L160 180" stroke="${c}" stroke-width="2"/>
    <path d="M160 70 L90 85 L85 180 L160 180 Z" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M160 70 L230 85 L235 180 L160 180 Z" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M100 105 L145 100 M100 125 L145 120 M100 145 L145 140 M100 165 L145 160" stroke="${c}" stroke-width="2"/>
    <path d="M220 105 L175 100 M220 125 L175 120 M220 145 L175 140 M220 165 L175 160" stroke="${c}" stroke-width="2"/>`,
  'stationery-2': (c) => `
    <path d="M140 55 L200 55 L205 175 L145 175 L140 55 Z" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M145 55 L205 175" stroke="${c}" stroke-width="1"/>
    <path d="M160 175 L170 205 L188 175 Z" fill="${c}"/>
    <path d="M132 70 L115 70 L110 85" fill="none" stroke="${c}" stroke-width="3"/>`,
  'stationery-3': (c) => `
    <rect x="115" y="80" width="90" height="95" rx="8" fill="none" stroke="${c}" stroke-width="3"/>
    <rect x="145" y="55" width="30" height="30" rx="5" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M120 120 L200 120" stroke="${c}" stroke-width="2"/>
    <path d="M200 175 L215 190 L205 190 L220 200" fill="none" stroke="${c}" stroke-width="2"/>
    <text x="160" y="160" text-anchor="middle" font-family="serif" font-size="24" fill="${c}">墨</text>`,
  'stationery-4': (c) => `
    <path d="M140 55 L180 190" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
    <path d="M175 150 C185 130 195 135 190 155" fill="none" stroke="${c}" stroke-width="2"/>
    <path d="M170 170 C180 150 190 155 185 175" fill="none" stroke="${c}" stroke-width="2"/>
    <path d="M165 185 C175 165 185 170 180 190" fill="none" stroke="${c}" stroke-width="2"/>`,

  // ── 家居 ──
  'home-goods-1': (c) => `
    <path d="M90 60 L230 60 L230 140 C220 130 210 145 200 140 C190 135 180 145 170 140 C160 135 150 145 140 140 C130 135 120 145 110 140 C100 135 95 140 90 140 Z" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M105 75 L215 75 M100 90 L220 90 M95 105 L225 105 M92 120 L228 120" stroke="${c}" stroke-width="1.5" stroke-dasharray="6 6"/>
    <circle cx="160" cy="100" r="5" fill="${c}"/>`,
  'home-goods-2': (c) => `
    <path d="M125 130 L135 190 L185 190 L195 130 Z" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M130 130 L190 130" stroke="${c}" stroke-width="3"/>
    <path d="M160 130 L160 105" stroke="${c}" stroke-width="2"/>
    <path d="M160 105 C155 90 140 95 145 78" fill="none" stroke="${c}" stroke-width="2"/>
    <path d="M160 95 C165 85 175 90 172 75" fill="none" stroke="${c}" stroke-width="2"/>
    <path d="M140 160 L180 160" stroke="${c}" stroke-width="2"/>`,
  'home-goods-3': (c) => `
    <path d="M115 70 L105 190 L215 190 L205 70 Z" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M115 70 C115 50 205 50 205 70" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M112 100 L208 100 M110 130 L210 130 M108 160 L212 160" stroke="${c}" stroke-width="2"/>
    <path d="M130 70 L125 100 M150 70 L148 100 M170 70 L172 100 M190 70 L195 100" stroke="${c}" stroke-width="1.5"/>
    <path d="M130 130 L125 160 M150 130 L148 160 M170 130 L172 160 M190 130 L195 160" stroke="${c}" stroke-width="1.5"/>`,
  'home-goods-4': (c) => `
    <path d="M110 195 L210 195" stroke="${c}" stroke-width="3"/>
    <path d="M130 195 L135 140 L185 140 L190 195" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M145 140 L150 100 L170 100 L175 140" fill="none" stroke="${c}" stroke-width="2"/>
    <path d="M160 100 L160 80" stroke="${c}" stroke-width="2"/>
    <path d="M160 80 C156 68 148 72 152 60 C156 52 164 52 168 60 C172 72 164 68 160 80 Z" fill="${c}"/>`,

  // ── 电子配件 ──
  'tech-accessories-1': (c) => `
    <path d="M90 190 C90 120 230 130 230 80" fill="none" stroke="${c}" stroke-width="4"/>
    <path d="M90 190 L78 190 L78 160 L95 160 Z" fill="none" stroke="${c}" stroke-width="2"/>
    <path d="M230 80 L242 80 L242 105 L225 105 Z" fill="none" stroke="${c}" stroke-width="2"/>
    <path d="M110 160 C110 140 210 150 210 105" stroke="${c}" stroke-width="1.5" stroke-dasharray="3 6"/>`,
  'tech-accessories-2': (c) => `
    <path d="M160 55 C130 55 120 100 160 105 C200 110 205 185 170 190 L160 190" fill="none" stroke="${c}" stroke-width="4"/>
    <path d="M160 55 L170 62 M160 105 L170 112 M160 190 L170 183" stroke="${c}" stroke-width="3"/>
    <circle cx="128" cy="120" r="12" fill="none" stroke="${c}" stroke-width="2"/>
    <circle cx="195" cy="160" r="12" fill="none" stroke="${c}" stroke-width="2"/>`,
  'tech-accessories-3': (c) => `
    <path d="M115 195 L115 120 L205 120 L205 195 Z" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M115 120 L90 195" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M205 120 L230 195" fill="none" stroke="${c}" stroke-width="3"/>
    <rect x="130" y="75" width="60" height="75" rx="6" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M145 135 L165 135 M145 120 L160 120" stroke="${c}" stroke-width="2"/>
    <path d="M120 70 L200 70 M115 60 L205 60" stroke="${c}" stroke-width="2"/>`,
  'tech-accessories-4': (c) => `
    <rect x="85" y="70" width="150" height="100" rx="8" fill="none" stroke="${c}" stroke-width="3"/>
    ${Array.from({ length: 4 }, (_, r) =>
      Array.from({ length: 9 }, (_, k) => {
        const x = 98 + k * 15
        const y = 85 + r * 20
        return `<rect x="${x}" y="${y}" width="11" height="8" rx="2" fill="none" stroke="${c}" stroke-width="1.5"/>`
      }).join(''),
    ).join('')}
    <path d="M185 175 L175 195 L165 175" fill="none" stroke="${c}" stroke-width="2"/>
    <path d="M168 195 L182 195" stroke="${c}" stroke-width="2"/>`,
}

function makeSvg(slug: string, name: string, i: number): string {
  const [fg, bg] = PALETTE[i % PALETTE.length]
  const art = PRODUCT_ART[slug]?.(fg) ?? `<circle cx="160" cy="120" r="70" fill="none" stroke="${fg}" stroke-width="2"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240">
<rect width="320" height="240" fill="${bg}"/>
${art}
<text x="160" y="218" text-anchor="middle" font-family="serif" font-size="20" fill="${fg}">${name}</text>
</svg>`
}

async function main() {
  console.log('🌱 开始写入种子数据…')

  // 清空旧数据（按依赖顺序）
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  // 用户
  const [admin, user] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@minimall.dev',
        name: '管理员',
        password: await bcrypt.hash('admin123', 12),
        role: 'ADMIN',
      },
    }),
    prisma.user.create({
      data: {
        email: 'user@minimall.dev',
        name: '演示用户',
        password: await bcrypt.hash('user123', 12),
      },
    }),
  ])
  console.log(`👤 管理员: admin@minimall.dev / admin123（id=${admin.id}）`)
  console.log(`👤 演示用户: user@minimall.dev / user123（id=${user.id}）`)

  // 分类与商品（price 单位为分）
  const categories = [
    {
      name: '咖啡器具',
      slug: 'coffee-tools',
      description: '手冲、意式、法压，慢煮一杯好咖啡。',
      products: [
        { name: '原木手冲咖啡架', price: 15900, stock: 12, desc: '胡桃木实木底座，黄铜连接件，可折叠收纳，适配 90°V60 滤杯。' },
        { name: '陶瓷手冲滤杯 V60', price: 8900, stock: 30, desc: '日本制陶瓷滤杯，螺旋导流槽设计，流速均匀，萃取更稳定。' },
        { name: '双层玻璃分享壶 600ml', price: 12900, stock: 18, desc: '耐热硼硅玻璃，双层隔热防烫，刻度清晰，适合 2-3 人分享。' },
        { name: '不锈钢手冲细口壶 900ml', price: 19900, stock: 8, desc: '细长鹅颈设计，控流精准；304 不锈钢内胆，长时保温。' },
      ],
    },
    {
      name: '文具',
      slug: 'stationery',
      description: '纸与笔之间，认真对待每一个念头。',
      products: [
        { name: '牛皮纸手账本 A5', price: 4500, stock: 50, desc: '意大利牛皮纸封面，120g 无酸内页，米白护眼色，可 180° 平摊。' },
        { name: '黄铜活动铅笔 0.5mm', price: 6800, stock: 25, desc: '黄铜笔身，随使用逐渐氧化出独有包浆，握感沉稳。' },
        { name: '钢笔墨水 · 松烟 30ml', price: 3900, stock: 40, desc: '黑中带暖的松烟色调，速干防水，适合日常书写与速写。' },
        { name: '玻璃蘸水笔', price: 7500, stock: 15, desc: '手工吹制玻璃笔尖，沟槽储墨可连写整页，书写顺畅顺滑。' },
      ],
    },
    {
      name: '家居',
      slug: 'home-goods',
      description: '把喜欢的器物，一件件请回家。',
      products: [
        { name: '亚麻桌布 · 燕麦色 160cm', price: 14900, stock: 10, desc: '法国亚麻混纺，水洗做旧质感，垂坠自然，四季皆宜。' },
        { name: '陶土香薰炉', price: 9800, stock: 22, desc: '手作陶土烧制，配素烧小碟，点一枚香丸，慢慢闻。' },
        { name: '手工编织收纳篮 L', price: 12800, stock: 14, desc: '天然蒲草手工编织，容量大且透气，适合收纳毛毯与杂志。' },
        { name: '黄铜烛台 · 矮款', price: 6900, stock: 9, desc: '实心黄铜车削成型，极简线条，稳立于桌面与窗台。' },
      ],
    },
    {
      name: '电子配件',
      slug: 'tech-accessories',
      description: '小而可靠，桌面上的秩序感。',
      products: [
        { name: '编织快充数据线 2m', price: 5900, stock: 60, desc: '尼龙编织外层，双头 60W 快充，铝合金接头耐弯折。' },
        { name: '桌面理线魔术贴 12 条', price: 1500, stock: 100, desc: '可裁剪魔术贴束带，收纳桌面线缆，一拉即贴。' },
        { name: '木质手机支架', price: 4900, stock: 35, desc: '榉木整木打磨，隐藏式走线槽，多角度可调，兼容手机与平板。' },
        { name: '便携蓝牙键盘 68 键', price: 24900, stock: 12, desc: '三模连接，G asket 结构手感扎实，矮轴静音，续航 60 天。' },
      ],
    },
  ]

  const imgDir = path.join(process.cwd(), 'public', 'images', 'products')
  fs.mkdirSync(imgDir, { recursive: true })
  let imgCount = 0

  for (const [ci, cat] of categories.entries()) {
    const category = await prisma.category.create({
      data: { name: cat.name, slug: cat.slug, description: cat.description },
    })
    console.log(`📁 分类: ${cat.name}`)

    for (const [pi, p] of cat.products.entries()) {
      const slug = `${cat.slug}-${pi + 1}`
      const imgName = `${slug}.svg`
      fs.writeFileSync(path.join(imgDir, imgName), makeSvg(slug, p.name, ci * 4 + pi), 'utf8')
      imgCount++

      await prisma.product.create({
        data: {
          name: p.name,
          slug: `${cat.slug}-${pi + 1}`,
          description: p.desc,
          price: p.price,
          stock: p.stock,
          categoryId: category.id,
          image: `/images/products/${imgName}`,
        },
      })
    }
  }
  console.log(`🖼️  生成本地占位图 ${imgCount} 张`)

  // 为演示用户准备一个示例购物车 + 两笔示例订单（含一笔心悦1会员折扣订单）
  const sampleProducts = await prisma.product.findMany({ take: 3 })
  await prisma.cartItem.create({
    data: { userId: user.id, productId: sampleProducts[0].id, quantity: 1 },
  })

  // 订单A：普通用户时期，无折扣
  const orderATotal = sampleProducts.reduce((s, p) => s + p.price, 0)
  await prisma.order.create({
    data: {
      userId: user.id,
      status: 'DELIVERED',
      total: orderATotal,
      shippingName: '演示用户',
      shippingAddress: '上海市静安区示例路 1 号 101 室',
      shippingPhone: '13800000000',
      items: {
        create: sampleProducts.map((p) => ({ productId: p.id, quantity: 1, price: p.price })),
      },
    },
  })
  // 与下单扣库存的规则保持一致：示例订单对应的商品各扣 1 件
  for (const p of sampleProducts) {
    await prisma.product.update({ where: { id: p.id }, data: { stock: { decrement: 1 } } })
  }

  // 订单B：累计消费达标后，心悦1会员 9.8 折订单
  const originalTotal = 800_000 // ¥8,000
  const orderBTotal = Math.floor(originalTotal * 0.98) // 784,000 分
  await prisma.order.create({
    data: {
      userId: user.id,
      status: 'DELIVERED',
      total: orderBTotal,
      originalTotal,
      discountAmount: originalTotal - orderBTotal,
      shippingName: '演示用户',
      shippingAddress: '上海市静安区示例路 1 号 101 室',
      shippingPhone: '13800000000',
      items: {
        create: sampleProducts.map((p) => ({ productId: p.id, quantity: 2, price: p.price })),
      },
    },
  })
  for (const p of sampleProducts) {
    await prisma.product.update({ where: { id: p.id }, data: { stock: { decrement: 2 } } })
  }

  // 累计消费 = 两笔订单实付之和 → 心悦1 级
  const totalSpent = orderATotal + orderBTotal
  await prisma.user.update({
    where: { id: user.id },
    data: { totalSpent, membershipLevel: 1 },
  })
  console.log('🧺 演示用户: 1 件购物车 + 2 笔已完成订单（累计 ¥' + (totalSpent / 100).toFixed(2) + '，心悦1）')

  console.log('✅ 种子数据写入完成')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
