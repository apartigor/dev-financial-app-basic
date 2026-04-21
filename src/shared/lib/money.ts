/** Converte centavos inteiros em reais (número). Ex: 19000 → 190.00 */
export function centsToReais(cents: number): number {
  return cents / 100
}

/** Converte reais em centavos inteiros. Ex: 190.5 → 19050 */
export function reaisToCents(reais: number): number {
  return Math.round(reais * 100)
}

/** Formata centavos como "190,00" (sem prefixo). */
export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Formata centavos como "R$ 190,00". */
export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

/** Divide um valor em centavos nas partes inteira e decimal. Ex: 19090 → { whole: "190", decimal: "90" } */
export function splitCents(cents: number): { whole: string; decimal: string } {
  const reais = cents / 100
  const [whole, decimal = "00"] = reais.toFixed(2).split(".")
  return { whole: Number(whole).toLocaleString("pt-BR"), decimal }
}
