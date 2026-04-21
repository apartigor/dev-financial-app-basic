"use client"
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body style={{ background: "#f6f3ec", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "system-ui" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 24 }}>Algo deu errado.</p>
          <button onClick={reset} style={{ marginTop: 16, color: "#5e6b3a", cursor: "pointer", background: "none", border: "none", fontSize: 14 }}>
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
