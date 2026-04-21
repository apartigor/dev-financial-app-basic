import { BrandMark } from "@/features/auth/components/brand-mark"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile */}
      <div className="md:hidden min-h-screen">{children}</div>

      {/* Desktop split 50/50 */}
      <div className="hidden md:flex min-h-screen">
        {/* Left: brand panel */}
        <div className="w-1/2 bg-surface-alt flex flex-col justify-between px-12 py-14">
          <BrandMark size="md" />

          <div>
            <h2 className="font-serif text-[40px] leading-[1.05] tracking-[-0.6px] text-ink max-w-[360px]">
              Dívidas sem estresse.{" "}
              <em className="text-accent not-italic">Lembretes</em> no seu ritmo.
            </h2>
            <p className="mt-4 text-sm text-ink-muted max-w-[340px]">
              Cadastre, divida entre amigos, e escolha exatamente quando quer ser lembrado.
            </p>
          </div>

          <p className="text-xs text-ink-faint tracking-[0.6px] uppercase">PWA · Android · iOS</p>
        </div>

        {/* Right: form vertically centered */}
        <div className="w-1/2 flex items-center justify-center px-12 py-14">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>
    </div>
  )
}
