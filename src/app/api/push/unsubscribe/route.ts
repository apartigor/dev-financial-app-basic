import { NextResponse } from "next/server"
import { z } from "zod"
import { deletePushSubscription } from "@/features/notifications/repository"

const schema = z.object({ endpoint: z.string().url() })

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 })
  await deletePushSubscription(parsed.data.endpoint)
  return NextResponse.json({ ok: true })
}
