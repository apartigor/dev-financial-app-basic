import { z } from "zod"

export const loginSchema = z.object({
  email:    z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
})

export const registerSchema = z.object({
  name:     z.string().trim().min(2, "Nome muito curto"),
  email:    z.string().email("E-mail inválido"),
  password: z.string().min(12, "Mínimo 12 caracteres"),
})

export type LoginInput    = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
