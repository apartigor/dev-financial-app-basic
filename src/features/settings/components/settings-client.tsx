"use client"
import { useState, useTransition } from "react"
import { Bell, User, Lock, Loader2 } from "lucide-react"
import { signOut } from "@/features/auth/actions"
import { ChangePasswordModal } from "@/features/auth/components/change-password-modal"
import { usePushSubscription } from "@/features/notifications/use-push"
import { ThemeToggle } from "@/shared/ui/theme-toggle"
import { cn } from "@/shared/lib/cn"
import { updatePreferences } from "../actions"

interface Props {
  prefs: { push_enabled: boolean } | null
  userEmail: string | undefined
  userName:  string | undefined
}

export function SettingsClient({ prefs: _, userEmail, userName }: Props) {
  const [, startTransition] = useTransition()
  const { supported, subscribed, loading: pushLoading, subscribe, unsubscribe } = usePushSubscription()

  const [pwModalOpen, setPwModalOpen] = useState(false)

  async function handlePushToggle() {
    if (subscribed) {
      await unsubscribe()
      startTransition(() => { void updatePreferences({ push_enabled: false }) })
    } else {
      const r = await subscribe()
      if (!r.error) {
        startTransition(() => { void updatePreferences({ push_enabled: true }) })
      }
    }
  }


  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Conta */}
      <SettingsGroup title="Conta">
        <SettingsRow icon={<User size={15} />} label={userName ?? "Usuário"} hint={userEmail} />
        <button
          onClick={() => setPwModalOpen(true)}
          className="flex items-center gap-3 px-4 py-3.5 border-b border-hairline last:border-0 w-full
            bg-transparent transition-colors hover:bg-surface-alt/40"
        >
          <span className="w-[30px] h-[30px] rounded-[8px] bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
            <Lock size={15} />
          </span>
          <span className="flex-1 min-w-0 text-left">
            <span className="block text-sm text-ink">Alterar senha</span>
            <span className="block text-xs text-ink-faint mt-0.5">Defina uma nova senha para sua conta.</span>
          </span>
        </button>
      </SettingsGroup>

      {/* Notificações */}
      <SettingsGroup title="Notificações">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <span className="w-[30px] h-[30px] rounded-[8px] bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
            <Bell size={15} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink">Notificações push</p>
            <p className="text-xs text-ink-faint mt-0.5">
              {!supported
                ? "Seu navegador não suporta."
                : subscribed
                ? "Ativas neste dispositivo."
                : "Receba lembretes antes do vencimento."}
            </p>
          </div>
          <PushToggle on={subscribed} loading={pushLoading} disabled={!supported} onClick={handlePushToggle} />
        </div>
      </SettingsGroup>

      {/* Aparência — mobile only */}
      <div className="md:hidden">
        <SettingsGroup title="Aparência">
          <ThemeToggle variant="full" />
        </SettingsGroup>
      </div>

      <button
        onClick={() => signOut()}
        className="mt-4 w-full py-3.5 px-4 bg-surface border border-hairline rounded-md text-warn text-sm font-medium
          transition-colors hover:border-warn/40"
      >
        Sair da conta
      </button>

      <ChangePasswordModal open={pwModalOpen} onClose={() => setPwModalOpen(false)} />
    </div>
  )
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-medium text-ink-muted uppercase tracking-[0.8px] mb-2 pl-1">{title}</p>
      <div className="bg-surface border border-hairline rounded-md overflow-hidden">{children}</div>
    </div>
  )
}

function SettingsRow({ icon, label, hint }: { icon?: React.ReactNode; label: string; hint?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-hairline last:border-0">
      {icon && (
        <span className="w-[30px] h-[30px] rounded-[8px] bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink">{label}</p>
        {hint && <p className="text-xs text-ink-faint mt-0.5">{hint}</p>}
      </div>
    </div>
  )
}

function PushToggle({ on, loading, disabled, onClick }: {
  on: boolean; loading: boolean; disabled: boolean; onClick: () => void
}) {
  if (loading) {
    return (
      <div className="w-[42px] h-6 flex items-center justify-center">
        <Loader2 size={16} className="text-ink-faint animate-spin" />
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-[42px] h-6 rounded-pill p-0.5 transition-all flex-shrink-0",
        disabled && "opacity-40 cursor-not-allowed"
      )}
      style={{ background: on ? "var(--color-accent)" : "var(--color-hairline-strong)" }}
    >
      <div
        className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: on ? "translateX(18px)" : "translateX(0)" }}
      />
    </button>
  )
}
