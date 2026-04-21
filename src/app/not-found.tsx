import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-serif text-[48px] text-ink-faint">404</p>
      <p className="text-ink-muted text-base">Página não encontrada.</p>
      <Link href="/dashboard" className="text-accent text-sm font-medium underline underline-offset-4">
        Voltar ao início
      </Link>
    </div>
  )
}
