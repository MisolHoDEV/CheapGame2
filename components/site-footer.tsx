import { Gamepad2 } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Gamepad2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-bold">NOVA<span className="text-primary">.</span></p>
            <p className="text-xs text-muted-foreground">Cửa hàng game PC bản quyền</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <a href="#" className="transition-colors hover:text-foreground">Về chúng tôi</a>
          <a href="#" className="transition-colors hover:text-foreground">Hỗ trợ</a>
          <a href="#" className="transition-colors hover:text-foreground">Điều khoản</a>
          <a href="#" className="transition-colors hover:text-foreground">Bảo mật</a>
        </nav>
        <p className="text-xs text-muted-foreground">© 2026 NOVA Store</p>
      </div>
    </footer>
  )
}
