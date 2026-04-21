import "server-only"
import { z } from "zod"

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL:      z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY:     z.string().min(20),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY:  z.string().min(20),
  VAPID_PRIVATE_KEY:             z.string().min(20),
  VAPID_EMAIL:                   z.string().startsWith("mailto:"),
  CRON_SECRET:                   z.string().min(32),
})

function getEnv() {
  const parsed = schema.safeParse(process.env)
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ")
    throw new Error(`[budFin] Missing/invalid env vars: ${missing}`)
  }
  return parsed.data
}

export const env = getEnv()
