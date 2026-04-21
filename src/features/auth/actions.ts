"use server"
import { redirect } from "next/navigation"
import { createClient } from "@/shared/lib/supabase/server"
import { getUser } from "@/shared/lib/supabase/server"
import { createAdminClient } from "@/shared/lib/supabase/admin"
import { loginSchema, registerSchema } from "./schemas"
import type { LoginInput, RegisterInput } from "./schemas"

export async function signIn(input: LoginInput): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: "E-mail ou senha incorretos." }

  redirect("/dashboard")
}

export async function signUp(input: RegisterInput): Promise<{ error?: string }> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.name } },
  })

  if (error) {
    if (error.message.includes("already registered"))
      return { error: "Este e-mail já está cadastrado." }
    return { error: "Não foi possível criar a conta. Tente novamente." }
  }

  if (data.user) {
    const admin = createAdminClient()
    const { data: hh } = await admin
      .from("households")
      .insert({ name: "Minha Casa" })
      .select("id")
      .single()
    if (hh) {
      const hhData = hh as { id: string }
      await admin.from("household_members").insert({
        household_id: hhData.id, user_id: data.user.id, role: "owner",
      })
      await admin.from("user_preferences").insert({ user_id: data.user.id })
    }
  }

  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth")
}

export async function updatePassword(
  newPassword: string,
  confirmPassword: string
): Promise<{ error?: string }> {
  if (newPassword.length < 12)
    return { error: "A senha deve ter ao menos 12 caracteres." }
  if (newPassword !== confirmPassword)
    return { error: "As senhas não coincidem." }

  const user = await getUser()
  if (!user) return { error: "Não autenticado." }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: "Não foi possível atualizar a senha." }

  return {}
}
