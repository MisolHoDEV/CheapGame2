"use client"

import { useState, useEffect } from "react"
import {
  X, Wallet, LogIn, LogOut, User, UserPlus, History, ShoppingBag,
  ArrowUpRight, CheckCircle, Coins, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatVND } from "@/lib/games"
import { useAuth } from "@/contexts/auth-context"
import {
  collection, query, where, orderBy, getDocs,
  doc, updateDoc, increment, addDoc, serverTimestamp,
} from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase-client"
type Tab = "account" | "balance" | "history"

type TxRecord = {
  id: string
  type: "topup" | "purchase"
  amount: number
  title?: string
  items?: string[]
  createdAt: { seconds: number } | null
}

const PRESETS = [50000, 100000, 200000, 500000, 1000000, 2000000]

type Props = {
  onClose: () => void
  onLoginClick: () => void
}

export function ProfilePanel({ onClose, onLoginClick }: Props) {
  const { user, balance, logout, refreshBalance } = useAuth()
  const [tab, setTab] = useState<Tab>("account")

  // Topup state
  const [selected, setSelected] = useState<number | null>(null)
  const [custom, setCustom] = useState("")
  const [topupStep, setTopupStep] = useState<"select" | "confirm" | "done">("select")
  const [topupLoading, setTopupLoading] = useState(false)

  // History state
  const [history, setHistory] = useState<TxRecord[]>([])
  const [histLoading, setHistLoading] = useState(false)

  const topupAmount = selected ?? (parseInt(custom.replace(/\D/g, "")) || 0)

  useEffect(() => {
    if (tab === "history" && user) {
      loadHistory()
    }
  }, [tab, user])

  async function loadHistory() {
    if (!user) return
    setHistLoading(true)
    try {
      const q = query(
collection( getFirebaseDb(), "transactions"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc"),
      )
      const snap = await getDocs(q)
      setHistory(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<TxRecord, "id">),
        })),
      )
    } catch {
      setHistory([])
    } finally {
      setHistLoading(false)
    }
  }

  async function handleTopupConfirm() {
    if (!user || topupAmount < 10000) return
    setTopupLoading(true)
    try {
await updateDoc(doc( getFirebaseDb(), "users", user.uid), { balance: increment(topupAmount) })
    await addDoc(collection( getFirebaseDb(), "transactions"), {
        uid: user.uid,
        type: "topup",
        amount: topupAmount,
        createdAt: serverTimestamp(),
      })
      await refreshBalance()
      setTopupStep("done")
    } catch {
      // silent
    } finally {
      setTopupLoading(false)
    }
  }

  function resetTopup() {
    setSelected(null)
    setCustom("")
    setTopupStep("select")
  }

  function formatDate(ts: { seconds: number } | null) {
    if (!ts) return "—"
    return new Date(ts.seconds * 1000).toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "account", label: "Tài khoản", icon: <User className="h-4 w-4" /> },
    { key: "balance", label: "Số dư", icon: <Wallet className="h-4 w-4" /> },
    { key: "history", label: "Lịch sử", icon: <History className="h-4 w-4" /> },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-20"
      role="dialog"
      aria-modal="true"
      aria-label="Hồ sơ"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex h-[calc(100vh-6rem)] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName ?? "Avatar"}
                referrerPolicy="no-referrer"
                className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/40"
              />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">
                {user ? user.displayName : "Khách"}
              </p>
              {user && (
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-secondary transition-colors hover:bg-secondary/80"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); if (t.key === "balance") resetTopup() }}
              className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${
                tab === t.key
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── ACCOUNT TAB ── */}
          {tab === "account" && (
            <div className="flex flex-col gap-4 p-5">
              {user ? (
                <>
                  {/* Profile card */}
                  <div className="rounded-xl border border-border bg-secondary/40 p-4">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="h-14 w-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="grid h-14 w-14 place-items-center rounded-full bg-secondary">
                          <User className="h-7 w-7" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{user.displayName}</p>
                        <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                        <span className="mt-1 inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                          Google
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Balance quick view */}
                  <button
                    onClick={() => setTab("balance")}
                    className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-4 py-3 transition-colors hover:border-primary/50"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Wallet className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Số dư ví</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-primary">{formatVND(balance)}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>

                  {/* History quick link */}
                  <button
                    onClick={() => setTab("history")}
                    className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-4 py-3 transition-colors hover:border-primary/50"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <History className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Lịch sử giao dịch</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>

                  {/* Logout */}
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      className="w-full gap-2 rounded-xl border-border bg-transparent text-muted-foreground hover:text-foreground"
                      onClick={() => { logout(); onClose() }}
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-5 py-6 text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">Chưa đăng nhập</p>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      Đăng nhập hoặc tạo tài khoản để mua game, theo dõi lịch sử và quản lý ví.
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2.5">
                    <Button
                      className="w-full gap-2 rounded-xl glow-neon"
                      onClick={() => { onClose(); onLoginClick() }}
                    >
                      <LogIn className="h-4 w-4" />
                      Đăng nhập
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2 rounded-xl border-border"
                      onClick={() => { onClose(); onLoginClick() }}
                    >
                      <UserPlus className="h-4 w-4" />
                      Tạo tài khoản mới
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Xác thực nhanh qua Google — không cần mật khẩu.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── BALANCE TAB ── */}
          {tab === "balance" && (
            <div className="flex flex-col gap-4 p-5">
              {/* Current balance */}
              <div className="rounded-xl border border-border bg-secondary/40 px-4 py-4 text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Số dư hiện tại</p>
                <p className="mt-1 font-mono text-3xl font-bold text-primary text-glow">
                  {formatVND(balance)}
                </p>
              </div>

              {!user ? (
                <p className="text-center text-sm text-muted-foreground">
                  Vui lòng{" "}
                  <button
                    onClick={() => { onClose(); onLoginClick() }}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    đăng nhập
                  </button>{" "}
                  để nạp tiền.
                </p>
              ) : topupStep === "done" ? (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/15">
                    <CheckCircle className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Nạp tiền thành công!</p>
                    <p className="text-sm text-muted-foreground">Số dư đã được cập nhật.</p>
                  </div>
                  <Button className="w-full rounded-xl" onClick={resetTopup}>
                    Nạp thêm
                  </Button>
                </div>
              ) : topupStep === "confirm" ? (
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl border border-border bg-secondary/40 p-4">
                    <p className="text-sm text-muted-foreground">Số tiền nạp</p>
                    <p className="font-mono text-2xl font-bold text-primary">{formatVND(topupAmount)}</p>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-4 py-3">
                    <span className="text-sm text-muted-foreground">Phương thức</span>
                    <span className="text-sm font-semibold">Demo</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Môi trường demo. Giao dịch thực tích hợp MoMo, VNPay...
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onClick={() => setTopupStep("select")}
                    >
                      Quay lại
                    </Button>
                    <Button
                      className="flex-1 gap-2 rounded-xl glow-neon"
                      onClick={handleTopupConfirm}
                      disabled={topupLoading}
                    >
                      {topupLoading && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      )}
                      Xác nhận
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Chọn mệnh giá
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {PRESETS.map((p) => (
                        <button
                          key={p}
                          onClick={() => { setSelected(p); setCustom("") }}
                          className={`rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
                            selected === p
                              ? "border-primary bg-primary/15 text-primary"
                              : "border-border bg-secondary/50 text-foreground hover:border-primary/50"
                          }`}
                        >
                          {formatVND(p)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Hoặc nhập số tiền
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="VD: 150,000"
                      value={custom}
                      onChange={(e) => { setCustom(e.target.value); setSelected(null) }}
                      className="h-10 w-full rounded-xl border border-border bg-secondary/60 px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40"
                    />
                    {custom && parseInt(custom.replace(/\D/g, "")) < 10000 && (
                      <p className="mt-1 text-xs text-destructive">Tối thiểu 10.000₫</p>
                    )}
                  </div>

                  <Button
                    className="w-full gap-2 rounded-xl font-semibold glow-neon"
                    disabled={topupAmount < 10000}
                    onClick={() => setTopupStep("confirm")}
                  >
                    <Coins className="h-4 w-4" />
                    Nạp {topupAmount >= 10000 ? formatVND(topupAmount) : "tiền"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {tab === "history" && (
            <div className="flex flex-col gap-3 p-5">
              {!user ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Vui lòng đăng nhập để xem lịch sử.
                </p>
              ) : histLoading ? (
                <div className="flex items-center justify-center py-12">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Chưa có giao dịch nào.</p>
                </div>
              ) : (
                history.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3"
                  >
                    <div
                      className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                        tx.type === "topup" ? "bg-green-500/15" : "bg-primary/15"
                      }`}
                    >
                      {tx.type === "topup" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-400" />
                      ) : (
                        <ShoppingBag className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {tx.type === "topup"
                          ? "Nạp tiền"
                          : tx.title ?? "Mua game"}
                      </p>
                      {tx.items && tx.items.length > 0 && (
                        <p className="truncate text-xs text-muted-foreground">
                          {tx.items.join(", ")}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                    <p
                      className={`shrink-0 font-mono text-sm font-semibold ${
                        tx.type === "topup" ? "text-green-400" : "text-foreground"
                      }`}
                    >
                      {tx.type === "topup" ? "+" : "-"}
                      {formatVND(tx.amount)}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
