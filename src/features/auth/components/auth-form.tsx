"use client"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { TextField } from "@/shared/ui/text-field"
import { PasswordField } from "@/shared/ui/password-field"
import { BrandMark } from "./brand-mark"
import { AuthSwitcher } from "./auth-switcher"
import { signIn, signUp } from "../actions"
import { loginSchema, registerSchema } from "../schemas"
import type { LoginInput, RegisterInput } from "../schemas"

type Mode = "login" | "register"

interface AuthFormProps { mode: Mode }

export function AuthForm({ mode: initialMode }: AuthFormProps) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()

  const loginForm    = useForm<LoginInput>({    resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  function switchMode(next: Mode) {
    if (next === mode) return
    setError(undefined)
    setMode(next)
  }

  function handleLogin(data: LoginInput) {
    setError(undefined)
    startTransition(async () => {
      const r = await signIn(data)
      if (r?.error) setError(r.error)
    })
  }

  function handleRegister(data: RegisterInput) {
    setError(undefined)
    startTransition(async () => {
      const r = await signUp(data)
      if (r?.error) setError(r.error)
    })
  }

  return (
    <div className="flex flex-col min-h-screen px-[26px] pt-[60px] pb-8 md:px-0 md:pt-0 md:min-h-0 md:py-0 md:block">
      <div className="mb-10 md:hidden"><BrandMark /></div>

      <AuthSwitcher mode={mode} onChange={switchMode} />

      {/* Form area — re-keyed on mode switch to trigger entry animation */}
      <div
        key={mode}
        className="flex-1 md:flex-none animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out"
      >
        <h1 className="font-serif text-[32px] md:text-[38px] leading-[1.05] tracking-[-0.6px] mb-2">
          {mode === "login" ? "Bem-vindo de volta." : "Comece agora."}
        </h1>
        <p className="text-sm text-ink-muted mb-7">
          {mode === "login"
            ? "Entre para continuar."
            : "Organize suas dívidas e cobranças em um só lugar."}
        </p>

        {mode === "login" ? (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="flex flex-col gap-3.5">
            <TextField
              label="E-mail" type="email" placeholder="seu@email.com" autoComplete="email"
              {...loginForm.register("email")}
              error={loginForm.formState.errors.email?.message}
            />
            <PasswordField
              label="Senha" placeholder="••••••••" autoComplete="current-password"
              {...loginForm.register("password")}
              error={loginForm.formState.errors.password?.message}
            />
            {error && (
              <p className="text-xs text-warn animate-in fade-in duration-200">{error}</p>
            )}
            <Button type="submit" full size="lg" disabled={pending} className="mt-2 gap-2">
              {pending ? "Entrando…" : "Entrar"}
              <ArrowRight size={16} />
            </Button>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(handleRegister)} className="flex flex-col gap-3.5">
            <TextField
              label="Nome" placeholder="Como podemos te chamar?"
              {...registerForm.register("name")}
              error={registerForm.formState.errors.name?.message}
            />
            <TextField
              label="E-mail" type="email" placeholder="seu@email.com" autoComplete="email"
              {...registerForm.register("email")}
              error={registerForm.formState.errors.email?.message}
            />
            <PasswordField
              label="Senha" placeholder="••••••••" autoComplete="new-password"
              {...registerForm.register("password")}
              error={registerForm.formState.errors.password?.message}
            />
            {error && (
              <p className="text-xs text-warn animate-in fade-in duration-200">{error}</p>
            )}
            <Button type="submit" full size="lg" disabled={pending} className="mt-2 gap-2">
              {pending ? "Criando…" : "Criar conta"}
              <ArrowRight size={16} />
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
