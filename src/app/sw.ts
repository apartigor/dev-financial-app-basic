/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist"
import { Serwist } from "serwist"

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
})

self.addEventListener("push", (event: PushEvent) => {
  const data = event.data?.json() as { title?: string; body?: string; url?: string } | undefined
  event.waitUntil(
    self.registration.showNotification(data?.title ?? "budFin", {
      body: data?.body ?? "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data?.url ?? "/dashboard" },
    })
  )
})

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close()
  const url = (event.notification.data as { url?: string } | undefined)?.url ?? "/dashboard"
  event.waitUntil(clients.openWindow(url))
})

serwist.addEventListeners()
