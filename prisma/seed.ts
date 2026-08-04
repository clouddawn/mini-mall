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

// 生成简约几何占位图（纸墨色系的 SVG）
const PALETTE = [
  ['#c8452f', '#f3e3dd'], // 朱砂
  ['#1c1a17', '#e6e0d5'], // 墨黑
  ['#b08a2e', '#f5ecd8'], // 金
  ['#6f8f5f', '#e8efe3'], // 鼠尾草绿
  ['#5b7c99', '#e3ebf2'], // 雾蓝
]

function makeSvg(name: string, i: number): string {
  const [fg, bg] = PALETTE[i % PALETTE.length]
  const shapes = [
    `<circle cx="160" cy="120" r="70" fill="none" stroke="${fg}" stroke-width="2"/>`,
    `<rect x="90" y="50" width="140" height="140" fill="none" stroke="${fg}" stroke-width="2"/>`,
    `<path d="M100 160 L160 60 L220 160 Z" fill="none" stroke="${fg}" stroke-width="2"/>`,
  ]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240">
<rect width="320" height="240" fill="${bg}"/>
${shapes[i % shapes.length]}
<text x="160" y="205" text-anchor="middle" font-family="serif" font-size="20" fill="${fg}">${name}</text>
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
      const imgName = `${cat.slug}-${pi + 1}.svg`
      fs.writeFileSync(path.join(imgDir, imgName), makeSvg(p.name, ci * 4 + pi), 'utf8')
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
