import { AuthForm } from "@/features/auth/components/auth-form"

interface Props {
  searchParams: Promise<{ mode?: string }>
}

export default async function AuthPage({ searchParams }: Props) {
  const { mode } = await searchParams
  return <AuthForm mode={mode === "register" ? "register" : "login"} />
}
