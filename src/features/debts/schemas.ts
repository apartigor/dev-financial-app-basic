import { z } from "zod"

export const debtItemSchema = z.object({
  id:          z.string().optional(),
  label:       z.string().trim().min(1, "Nome obrigatório").max(80),
  amountCents: z.coerce.number().int().positive("Valor inválido").max(100_000_000, "Valor muito alto"),
})

export const debtSchema = z.object({
  title:          z.string().trim().min(1, "Título obrigatório").max(120),
  direction:      z.enum(["payable", "receivable"]),
  totalCents:     z.coerce.number().int().positive("Informe o valor total").max(100_000_000, "Valor muito alto"),
  dueDate:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  notes:          z.string().max(2000).optional(),
  recurrenceRule: z.enum(["none", "monthly", "weekly", "yearly"]).default("none"),
  items:          z.array(debtItemSchema).default([]),
  reminderDays:   z.array(z.number().int().min(0)).default([7, 3, 1, 0]),
  customReminders: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).default([]),
}).refine(
  (d) => d.items.length === 0 || d.items.reduce((s, i) => s + i.amountCents, 0) === d.totalCents,
  { message: "Soma das cobranças deve ser igual ao valor total", path: ["items"] }
)

export type DebtItemInput = z.infer<typeof debtItemSchema>
export type DebtInput     = z.infer<typeof debtSchema>
