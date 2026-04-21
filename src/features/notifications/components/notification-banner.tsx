"use client"
import { useEffect, useState } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/shared/ui/button"

export function NotificationBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof Notification === "undefined") return
    if (Notification.permission === "default") {
      const dismissed = sessionStorage.getItem("budfin-push-dismissed")
      if (!dismissed) setShow(true)
    }
  }, [])

  async function requestPermission() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return
    const result = await Notification.requestPermission()
    if (result === "granted") {
      try {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        })
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub.toJSON()),
        })
      } catch (e) {
        console.error("[push]", e)
      }
    }
    setShow(false)
  }

  function dismiss() {
    sessionStorage.setItem("budfin-push-dismissed", "1")
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="mb-4 bg-accent-soft border border-accent/20 rounded-md p-4 flex items-start gap-3">
      <Bell size={18} className="text-accent flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink mb-0.5">Ativar lembretes</p>
        <p className="text-xs text-ink-muted mb-3">
          Receba notificações antes do vencimento das suas dívidas.
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="accent" onClick={requestPermission}>
            Ativar
          </Button>
          <Button size="sm" variant="ghost" onClick={dismiss}>
            Agora não
          </Button>
        </div>
      </div>
      <button onClick={dismiss} className="text-ink-faint">
        <X size={16} />
      </button>
    </div>
  )
}
