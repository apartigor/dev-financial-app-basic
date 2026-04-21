export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center gap-4">
      <div className="bg-ink text-bg w-12 h-12 rounded-[14px] flex items-center justify-center font-serif text-2xl">b</div>
      <h1 className="font-serif text-[28px] tracking-tight">Bem-vindo ao budFin</h1>
      <p className="text-sm text-ink-muted max-w-[280px]">
        Você precisa de um convite para acessar. Peça um link para o dono da conta.
      </p>
    </div>
  )
}
