export function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-4 py-10 text-center sm:px-6">
        <p className="font-display text-lg tracking-[0.3em]">MINI MALL</p>
        <p className="text-xs text-ink-faint">© {new Date().getFullYear()} Mini Mall · 一个微型电商练习项目 · 商品支付均为模拟</p>
      </div>
    </footer>
  )
}
