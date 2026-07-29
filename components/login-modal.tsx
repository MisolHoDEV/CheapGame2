"use client"

import { useState } from "react"
import { X, Gamepad2, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

type Tab = "login" | "register"

type Props = {
  onClose: () => void
}

const GoogleIcon = () => (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

export function LoginModal({ onClose }: Props) {
  const { signInWithGoogle } = useAuth()
  const [tab, setTab] = useState<Tab>("login")
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [error, setError] = useState("")

  async function handleGoogle() {
    setLoading(true)
    setError("")
    try {
      await signInWithGoogle()
      // signInWithGoogle uses redirect — page will navigate away
      setRedirecting(true)
    } catch {
      setError("Không thể kết nối Google. Vui lòng thử lại.")
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={tab === "login" ? "Đăng nhập" : "Đăng ký"}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-secondary transition-colors hover:bg-secondary/80"
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 px-8 pt-8">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary glow-neon">
            <Gamepad2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <p className="text-lg font-bold tracking-tight">CheapGame</p>
        </div>

        {/* Tabs */}
        <div className="mx-6 mt-5 flex rounded-xl border border-border bg-secondary/40 p-1">
          <button
            onClick={() => { setTab("login"); setError("") }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors ${
              tab === "login"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </button>
          <button
            onClick={() => { setTab("register"); setError("") }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors ${
              tab === "register"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Đăng ký
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6 pt-5">
          {/* Description */}
          <p className="text-center text-sm text-muted-foreground">
            {tab === "login"
              ? "Chào mừng trở lại! Đăng nhập để tiếp tục."
              : "Tạo tài khoản miễn phí chỉ trong vài giây."}
          </p>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          {redirecting ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Đang chuyển hướng tới Google...
              </p>
            </div>
          ) : (
            <>
              {/* Google button */}
              <Button
                className="w-full gap-3 rounded-xl text-sm font-semibold"
                onClick={handleGoogle}
                disabled={loading}
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <GoogleIcon />
                )}
                {tab === "login"
                  ? "Đăng nhập bằng Google"
                  : "Đăng ký bằng Google"}
              </Button>

              {/* Info box */}
              <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3 text-xs text-muted-foreground">
                {tab === "login" ? (
                  <>
                    Bạn sẽ được chuyển đến trang xác thực Google.{" "}
                    <span className="text-foreground">Chưa có tài khoản?</span>{" "}
                    <button
                      onClick={() => setTab("register")}
                      className="font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      Đăng ký ngay
                    </button>
                  </>
                ) : (
                  <>
                    Sử dụng tài khoản Google có sẵn để đăng ký. Tài khoản CheapGame sẽ được tạo tự động.{" "}
                    <span className="text-foreground">Đã có tài khoản?</span>{" "}
                    <button
                      onClick={() => setTab("login")}
                      className="font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      Đăng nhập
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          <p className="text-center text-[11px] text-muted-foreground">
            Bằng cách tiếp tục, bạn đồng ý với{" "}
            <span className="cursor-pointer text-primary underline-offset-2 hover:underline">
              Điều khoản dịch vụ
            </span>{" "}
            của CheapGame.
          </p>
        </div>
      </div>
    </div>
  )
}
