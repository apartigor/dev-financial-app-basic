"use server"
import { revalidatePath } from "next/cache"
import { createClient } from "@/shared/lib/supabase/server"
import { getUser } from "@/shared/lib/supabase/server"

interface PrefsUpdate {
  theme?: "light" | "dark" | "system"
  density?: "comfy" | "compact"
  push_enabled?: boolean
  weekly_digest?: boolean
  digest_hour_local?: number
  default_reminders?: number[]
}

export async function updatePreferences(update: PrefsUpdate): Promise<{ error?: string }> {
  const [user, supabase] = await Promise.all([getUser(), createClient()])
  if (!user) return { error: "Não autenticado." }
  const { error } = await supabase.from("user_preferences").update(update).eq("user_id", user.id)
  if (error) return { error: "Erro ao salvar preferências." }
  revalidatePath("/settings")
  return {}
}

export async function getPreferences() {
  const [user, supabase] = await Promise.all([getUser(), createClient()])
  if (!user) return null
  const { data } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single()
  return data as {
    user_id: string; theme: "light" | "dark" | "system"; density: "comfy" | "compact"
    push_enabled: boolean; weekly_digest: boolean; digest_hour_local: number
    default_reminders: number[]; updated_at: string
  } | null
}
