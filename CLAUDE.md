# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
npm run dev        # 启动开发服务器（监听 0.0.0.0:3000）
npm run build      # 生产构建
npm run lint       # ESLint 检查
npm run db:seed    # 写入种子数据（管理员 + 演示用户 + 分类/商品）
npx prisma studio  # 打开 Prisma 数据库浏览器
npx prisma db push # 将 schema 变更同步到 SQLite（无需 migration）
```

## 技术栈

- **Next.js 16**（App Router，Server Components + Server Actions）
- **Prisma 5 + SQLite**（`prisma/dev.db`）
- **Tailwind CSS 4**（`@tailwindcss/postcss`）
- **jose** 库签发/验证 JWT，存储在 httpOnly cookie（`token`）
- **bcryptjs** 做密码哈希（12 rounds）
- **zod 4** 做表单校验

## 项目架构

```
src/
├── app/
│   ├── (auth)/          # 登录/注册（独立布局，无 Header/Footer）
│   ├── (shop)/          # 商城前台（Header + Footer 布局）
│   │   ├── cart/        # 购物车
│   │   ├── checkout/    # 结算下单
│   │   ├── orders/      # 订单列表与详情
│   │   ├── products/    # 商品列表与详情页（slug 路由）
│   │   └── profile/     # 个人中心（含会员等级展示）
│   └── admin/           # 管理后台（左侧边栏布局）
│       ├── products/    # 商品 CRUD
│       ├── categories/  # 分类 CRUD
│       └── orders/      # 订单管理（状态变更）
├── components/          # UI 组件，按功能域分组
│   ├── admin/           # CategoryForm, ProductForm, DeleteButton, OrderStatusSelect
│   ├── auth/            # LoginForm, RegisterForm, LogoutButton
│   ├── cart/            # AddToCartButton, CartItemRow, CartSummary
│   ├── checkout/        # ShippingForm
│   ├── layout/          # Header, Footer, AdminSidebar
│   ├── orders/          # OrderActions（支付/取消按钮组）
│   ├── shop/            # ProductCard, ProductGrid, CategoryFilter, SearchBar
│   └── ui/              # 通用 UI：Badge, Button, Card, Input, Pagination
├── lib/
│   ├── actions/         # Server Actions：auth, cart, order, admin
│   ├── prisma.ts        # Prisma 单例
│   ├── auth.ts          # JWT 签发/验证、Session 读取、cookie 管理
│   ├── membership.ts    # 心悦会员等级系统（规则入口）
│   └── utils.ts         # cn() 类名拼接、slugify
├── types/
│   └── index.ts         # Session, OrderStatus, MembershipLevel, 格式化工具
└── proxy.ts             # Next.js middleware：路由守卫（token 存在性检查）
```

## 关键设计决策

### 价格存储

**所有金额以"分"为单位的整数存储。** 展示时用 `formatPrice(cents)` 转换为 `¥xx.xx`。务必对价格字段使用整数运算，避免浮点精度问题。

### 认证体系

- 用户角色 `USER | ADMIN`，JWT payload 为 `{ userId, role }`
- `getSession()` — 未登录直接 `redirect('/login')`（用于受保护页面/Server Action）
- `getSessionSafe()` — 未登录返回 `null`（用于 Header 等公开组件）
- `requireAdmin()` — 非管理员重定向至首页
- middleware（`proxy.ts`）只做轻量级 token 存在检查，不验证 JWT 签名

### 会员等级系统（心悦）

定义在 `src/lib/membership.ts`，是唯一的规则入口：

| 等级 | 名称 | 门槛（分） | 折扣 |
|------|------|------------|------|
| 0 | 普通用户 | 0 | 无 |
| 1 | 心悦1 | ¥8,000 | 9.8折 |
| 2 | 心悦2 | ¥80,000 | 9.5折 |
| 3 | 心悦3 | ¥800,000 | 9折 |

- `applyDiscount(originalTotal, level)` 返回折后价与折扣金额（向下取整）
- 下单时按用户当前等级计算折扣并写入订单；支付后累计消费金额并重新计算等级
- 订单取消时归还库存，已支付订单还会回退累计金额（可能降级）

### 订单流程

1. 下单（`placeOrderAction`）：事务内校验并扣减库存 → 创建订单（含价格快照）→ 清空购物车 → 跳转订单详情
2. 支付（`payOrderAction`）：PENDING → PAID，累加消费金额并重算会员等级
3. 取消（`cancelOrderAction`）：归还库存，已支付订单回退累计消费
4. 管理端状态变更（`updateOrderStatusAction`）：支持任意状态切换，自动处理库存增减与累计金额同步

### 库存并发安全

下单时使用 `updateMany({ where: { stock: { gte: quantity } } })` 条件更新，事务内 `updated.count === 0` 时抛出 `StockError`，避免超卖。

### 设计风格

**纸墨色系** — 暖白底（`#faf8f4`）、墨黑字（`#1c1a17`）、朱砂红点缀（`#c8452f`）。颜色常量定义在 `globals.css` 的 `@theme` 块中。字体组合：Noto Serif SC（标题）、Noto Sans SC（正文）、Fraunces（数字/价格展示）。

## Prisma Schema

SQLite 数据库，模型关系：
- `User 1→N CartItem N→1 Product`，购物车条目有 `@@unique([userId, productId])`
- `User 1→N Order 1→N OrderItem N→1 Product`
- `Category 1→N Product`
- `OrderItem.price` 是下单时价格快照，不随商品调价改变
- `OrderItem.productId` 无 `onDelete`（RESTRICT），已有关联订单的商品不允许删除

### 种子数据

`prisma/seed.ts` 创建：
- `admin@minimall.dev / admin123`（ADMIN）
- `user@minimall.dev / user123`（USER，含 2 笔示例订单 + 1 件购物车，心悦1）
- 4 个分类、16 件商品，自动生成 SVG 占位图到 `public/images/products/`
