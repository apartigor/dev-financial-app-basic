import { NextResponse } from "next/server"
import { z } from "zod"
import { savePushSubscription } from "@/features/notifications/repository"

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth:   z.string(),
  }),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 })

  const result = await savePushSubscription({
    endpoint:  parsed.data.endpoint,
    p256dh:    parsed.data.keys.p256dh,
    auth:      parsed.data.keys.auth,
    userAgent: req.headers.get("user-agent") ?? undefined,
  })

  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ ok: true })
}
