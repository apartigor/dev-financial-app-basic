"use server"
import { createClient } from "@/shared/lib/supabase/server"
import { getUser } from "@/shared/lib/supabase/server"
import { createAdminClient } from "@/shared/lib/supabase/admin"
import { createHash, randomBytes } from "crypto"
import { addDays } from "date-fns"

export async function generateInvite(): Promise<{ url?: string; error?: string }> {
  const [user, supabase] = await Promise.all([getUser(), createClient()])
  if (!user) return { error: "Não autenticado." }

  const { data: member } = await supabase
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", user.id)
    .single()

  const m = member as { household_id: string; role: string } | null
  if (!m || m.role !== "owner") return { error: "Apenas o dono pode criar convites." }

  const token     = randomBytes(24).toString("hex")
  const tokenHash = createHash("sha256").update(token).digest("hex")
  const expiresAt = addDays(new Date(), 7).toISOString()

  const { error } = await supabase.from("household_invitations").insert({
    household_id: m.household_id,
    token_hash:   tokenHash,
    invited_by:   user.id,
    expires_at:   expiresAt,
  })

  if (error) return { error: "Erro ao criar convite." }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""
  return { url: `${baseUrl}/join/${token}` }
}

export async function consumeInvite(token: string): Promise<{ error?: string }> {
  const user = await getUser()
  if (!user) return { error: "Faça login primeiro." }

  const admin = createAdminClient()
  const { data } = await admin.rpc("consume_invite", { p_token: token, p_user_id: user.id })
  const result = data as { success: boolean; error: string | null } | null

  if (!result?.success) {
    if (result?.error === "invite_invalid") return { error: "Convite inválido ou expirado." }
    return { error: "Erro ao aceitar convite." }
  }

  await admin.from("user_preferences").upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true })
  return {}
}
