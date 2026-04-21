"use client"
import { useState, useEffect, useCallback } from "react"

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(b64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}

async function swReady(timeoutMs = 5000) {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("sw-timeout")), timeoutMs)
    ),
  ])
}

export function usePushSubscription() {
  const [supported, setSupported]   = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading]       = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const ok = "Notification" in window
    setSupported(ok)
    if (!ok) return

    if (Notification.permission !== "granted") {
      setSubscribed(false)
      return
    }

    // Check actual SW push subscription (with timeout for dev/no-SW)
    if ("serviceWorker" in navigator) {
      swReady(3000)
        .then(async (reg) => {
          const sub = await reg.pushManager.getSubscription()
          setSubscribed(!!sub)
        })
        .catch(() => {
          // SW not available (dev mode) — use permission state
          setSubscribed(Notification.permission === "granted")
        })
    } else {
      setSubscribed(Notification.permission === "granted")
    }
  }, [])

  const subscribe = useCallback(async (): Promise<{ error?: string }> => {
    if (!supported) return { error: "Navegador não suporta notificações." }
    setLoading(true)
    try {
      const result = await Notification.requestPermission()
      if (result !== "granted") return { error: "Permissão negada." }

      // Try to get SW subscription — with timeout graceful fallback for dev
      try {
        const reg = await swReady(5000)
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ),
        })
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub.toJSON()),
        })
      } catch {
        // SW not available (dev mode without Serwist) — still mark as subscribed
        console.info("[push] SW indisponível, usando apenas permissão do navegador.")
      }

      setSubscribed(true)
      return {}
    } finally {
      setLoading(false)
    }
  }, [supported])

  const unsubscribe = useCallback(async () => {
    if (!supported) return
    setLoading(true)
    try {
      if ("serviceWorker" in navigator) {
        const reg = await swReady(3000).catch(() => null)
        if (reg) {
          const sub = await reg.pushManager.getSubscription()
          if (sub) {
            await fetch("/api/push/unsubscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ endpoint: sub.endpoint }),
            })
            await sub.unsubscribe()
          }
        }
      }
      setSubscribed(false)
    } finally {
      setLoading(false)
    }
  }, [supported])

  return { supported, subscribed, loading, subscribe, unsubscribe }
}
