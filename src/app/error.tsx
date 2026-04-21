"use client"
import { useEffect } from "react"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-serif text-2xl text-ink">Algo deu errado.</p>
      <button onClick={reset} className="text-accent text-sm font-medium underline underline-offset-4">
        Tentar novamente
      </button>
    </div>
  )
}
