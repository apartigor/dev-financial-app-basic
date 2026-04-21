import "server-only"
import { createClient } from "@/shared/lib/supabase/server"
import { getUser } from "@/shared/lib/supabase/server"

export async function savePushSubscription(sub: {
  endpoint: string; p256dh: string; auth: string; userAgent?: string
}) {
  const [user, supabase] = await Promise.all([getUser(), createClient()])
  if (!user) return { error: "Não autenticado." }

  const { error } = await supabase.from("push_subscriptions").upsert(
    { user_id: user.id, endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth, user_agent: sub.userAgent ?? null },
    { onConflict: "user_id,endpoint" }
  )
  return error ? { error: error.message } : {}
}

export async function deletePushSubscription(endpoint: string) {
  const [user, supabase] = await Promise.all([getUser(), createClient()])
  if (!user) return
  await supabase.from("push_subscriptions").delete().eq("user_id", user.id).eq("endpoint", endpoint)
}
