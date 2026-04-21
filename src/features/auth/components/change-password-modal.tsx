"use client"
import { useState, useTransition } from "react"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import { PasswordField } from "@/shared/ui/password-field"
import { updatePassword } from "../actions"
import { useLanguage } from "@/shared/lib/i18n/provider"

interface Props { open: boolean; onClose: () => void }

export function ChangePasswordModal({ open, onClose }: Props) {
  const { t } = useLanguage()
  const [newPassword, setNewPassword]         = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError]                     = useState<string>()
  const [success, setSuccess]                 = useState(false)
  const [pending, startTransition]            = useTransition()

  function handleClose() {
    setNewPassword(""); setConfirmPassword(""); setError(undefined); setSuccess(false); onClose()
  }

  function handleConfirm() {
    setError(undefined)
    startTransition(async () => {
      const r = await updatePassword(newPassword, confirmPassword)
      if (r.error) { setError(r.error) }
      else { setSuccess(true); setTimeout(handleClose, 1500) }
    })
  }

  if (!open) return null

  return (
    <ConfirmDialog open={open} title={t.changePassword.title ?? "Alterar senha"}
      confirmLabel={success ? (t.changePassword.saved ?? "✓ Alterada!") : (t.changePassword.save ?? "Salvar")}
      cancelLabel={t.changePassword.cancel ?? "Cancelar"} loading={pending}
      onCancel={handleClose} onConfirm={handleConfirm}>
      <div className="flex flex-col gap-3.5 mt-4">
        <PasswordField label={t.changePassword.newPassword} placeholder={t.changePassword.newPasswordPlaceholder}
          autoComplete="new-password" value={newPassword}
          onChange={(e) => { setError(undefined); setNewPassword(e.target.value) }} />
        <PasswordField label={t.changePassword.confirmPassword} placeholder={t.changePassword.confirmPasswordPlaceholder}
          autoComplete="new-password" value={confirmPassword}
          onChange={(e) => { setError(undefined); setConfirmPassword(e.target.value) }} />
        {error   && <p className="text-xs text-warn">{error}</p>}
        {success && <p className="text-xs text-paid">{t.changePassword.success}</p>}
      </div>
    </ConfirmDialog>
  )
}
