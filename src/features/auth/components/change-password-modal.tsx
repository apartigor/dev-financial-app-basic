"use client"
import { useState, useTransition } from "react"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import { PasswordField } from "@/shared/ui/password-field"
import { updatePassword } from "../actions"

interface Props {
  open: boolean
  onClose: () => void
}

export function ChangePasswordModal({ open, onClose }: Props) {
  const [newPassword, setNewPassword]         = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError]                     = useState<string>()
  const [success, setSuccess]                 = useState(false)
  const [pending, startTransition]            = useTransition()

  function handleClose() {
    setNewPassword("")
    setConfirmPassword("")
    setError(undefined)
    setSuccess(false)
    onClose()
  }

  function handleConfirm() {
    setError(undefined)
    startTransition(async () => {
      const r = await updatePassword(newPassword, confirmPassword)
      if (r.error) {
        setError(r.error)
      } else {
        setSuccess(true)
        setTimeout(handleClose, 1500)
      }
    })
  }

  if (!open) return null

  return (
    <ConfirmDialog
      open={open}
      title="Alterar senha"
      confirmLabel={success ? "✓ Senha alterada!" : "Salvar"}
      cancelLabel="Cancelar"
      loading={pending}
      onCancel={handleClose}
      onConfirm={handleConfirm}
    >
      <div className="flex flex-col gap-3.5 mt-4">
        <PasswordField
          label="Nova senha"
          placeholder="Mínimo 12 caracteres"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => { setError(undefined); setNewPassword(e.target.value) }}
        />
        <PasswordField
          label="Confirmar senha"
          placeholder="Repita a nova senha"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => { setError(undefined); setConfirmPassword(e.target.value) }}
        />
        {error && <p className="text-xs text-warn">{error}</p>}
        {success && <p className="text-xs text-paid">Senha atualizada com sucesso.</p>}
      </div>
    </ConfirmDialog>
  )
}
