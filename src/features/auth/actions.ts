"use server"
import { redirect } from "next/navigation"
import { createClient } from "@/shared/lib/supabase/server"
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

  // Create household + preferences for new user
  if (data.user) {
    const admin = (await import("@/shared/lib/supabase/admin")).createAdminClient()
    const { data: hh } = await admin
      .from("households")
      .insert({ name: "Minha Casa" })
      .select("id")
      .single()
    if (hh) {
      await admin.from("household_members").insert({
        household_id: hh.id, user_id: data.user.id, role: "owner",
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

export async function sendPasswordReset(): Promise<{ error?: string; sent?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: "Não autenticado." }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${origin}/reset-password`,
  })
  if (error) return { error: "Não foi possível enviar o e-mail." }
  return { sent: true }
}
