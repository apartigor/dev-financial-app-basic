import { redirect } from "next/navigation"
import { consumeInvite } from "@/features/household/actions"
import { getUser } from "@/shared/lib/supabase/server"

interface Props { params: Promise<{ token: string }> }

export default async function JoinPage({ params }: Props) {
  const { token } = await params
  const user = await getUser()

  if (!user) {
    redirect(`/auth?next=/join/${token}`)
  }

  const result = await consumeInvite(token)

  if (result.error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-serif text-xl mb-2">Convite inválido</p>
          <p className="text-sm text-ink-muted">{result.error}</p>
        </div>
      </div>
    )
  }

  redirect("/dashboard")
}
