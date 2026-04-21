import "server-only"
import { createClient } from "@/shared/lib/supabase/server"

export async function getHousehold() {
  const supabase = await createClient()
  const { data: member } = await supabase
    .from("household_members")
    .select("household_id, role, households(id, name)")
    .limit(1)
    .single()
  return member
}

export async function getMembers(householdId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("household_members")
    .select("user_id, role, joined_at")
    .eq("household_id", householdId)
  return data ?? []
}
