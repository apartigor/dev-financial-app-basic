/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import webpush from "web-push"
import { createAdminClient } from "@/shared/lib/supabase/admin"
import { toISODate, todayBRT } from "@/shared/lib/date"
import { formatBRL } from "@/shared/lib/money"

function requireCron(req: Request) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    throw new Response("unauthorized", { status: 401 })
  }
}

export async function GET(req: Request) {
  try {
    requireCron(req)
  } catch (r) {
    return r as Response
  }

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const admin = createAdminClient()
  const today = toISODate(todayBRT())

  // Fetch reminders due today with debt info
  const { data: reminders } = await admin
    .from("debt_reminders")
    .select("id, debt_id, household_id, days_before, debts(id, title, direction, due_date)")
    .eq("remind_on", today)

  let sent = 0

  for (const r of reminders ?? []) {
    const debt = (r as any).debts
    if (!debt) continue

    // Get totals from view
    const { data: totals } = await admin
      .from("debts_with_totals")
      .select("status, total_cents, paid_cents")
      .eq("id", debt.id)
      .single()

    if (!totals || totals.status === "paid") continue
    const pendingCents = Number(totals.total_cents) - Number(totals.paid_cents)
    if (pendingCents <= 0) continue

    const daysBefore = r.days_before ?? 0

    // Dedupe via unique constraint
    const { error: logErr } = await admin.from("notification_log").insert({
      household_id: r.household_id,
      debt_id: debt.id,
      days_before: daysBefore,
    })
    if (logErr?.code === "23505") continue
    if (logErr) { console.error("[cron]", logErr); continue }

    // Get members with push_enabled
    const { data: members } = await admin
      .from("household_members")
      .select("user_id")
      .eq("household_id", r.household_id)

    const memberIds = (members ?? []).map((m: any) => m.user_id)
    if (memberIds.length === 0) continue

    const { data: prefs } = await admin
      .from("user_preferences")
      .select("user_id")
      .in("user_id", memberIds)
      .eq("push_enabled", true)

    const userIds = (prefs ?? []).map((p: any) => p.user_id)
    if (userIds.length === 0) continue

    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("*")
      .in("user_id", userIds)

    const verb = debt.direction === "receivable" ? "cobrar" : "pagar"
    const when = daysBefore === 0 ? "hoje" : `em ${daysBefore} dia${daysBefore === 1 ? "" : "s"}`
    const title = `${debt.direction === "receivable" ? "A receber" : "A pagar"} — vence ${when}`
    const body  = `${debt.title} · ${formatBRL(pendingCents)} em aberto (${verb})`
    const url   = `/debts/${debt.id}`

    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title, body, url })
        )
        sent++
      } catch (e: any) {
        if (e.statusCode === 404 || e.statusCode === 410) {
          await admin.from("push_subscriptions").delete().eq("id", sub.id)
        } else {
          console.error("[cron push]", e.message)
        }
      }
    }
  }

  return NextResponse.json({ ok: true, sent, date: today })
}
