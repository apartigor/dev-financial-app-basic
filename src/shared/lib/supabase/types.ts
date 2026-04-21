// Placeholder types — run `supabase gen types typescript --project-id SEU_ID > src/shared/lib/supabase/types.ts`
// after creating the Supabase project to get accurate auto-generated types.
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

type TableDef<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      households:          TableDef<{ id: string; name: string; created_at: string }, { id?: string; name: string; created_at?: string }, { name?: string }>
      household_members:   TableDef<{ household_id: string; user_id: string; role: "owner" | "member"; joined_at: string }, { household_id: string; user_id: string; role?: "owner" | "member"; joined_at?: string }, { role?: "owner" | "member" }>
      household_invitations: TableDef<
        { id: string; household_id: string; token_hash: string; invited_by: string; role: "owner" | "member"; expires_at: string; consumed_at: string | null; consumed_by: string | null; created_at: string },
        { id?: string; household_id: string; token_hash: string; invited_by: string; role?: "owner" | "member"; expires_at: string; consumed_at?: string | null; consumed_by?: string | null },
        { consumed_at?: string | null; consumed_by?: string | null }
      >
      debts: TableDef<
        { id: string; household_id: string; created_by: string; title: string; direction: "payable" | "receivable"; currency: string; due_date: string; notes: string | null; recurrence_rule: "none" | "monthly" | "weekly" | "yearly"; parent_debt_id: string | null; created_at: string; updated_at: string },
        { id?: string; household_id: string; created_by: string; title: string; direction: "payable" | "receivable"; currency?: string; due_date: string; notes?: string | null; recurrence_rule?: "none" | "monthly" | "weekly" | "yearly"; parent_debt_id?: string | null },
        { title?: string; direction?: "payable" | "receivable"; due_date?: string; notes?: string | null; recurrence_rule?: "none" | "monthly" | "weekly" | "yearly" }
      >
      debt_items: TableDef<
        { id: string; debt_id: string; household_id: string; label: string; amount_cents: number; paid: boolean; paid_at: string | null; created_at: string; updated_at: string },
        { id?: string; debt_id: string; household_id: string; label: string; amount_cents: number; paid?: boolean; paid_at?: string | null },
        { label?: string; amount_cents?: number; paid?: boolean }
      >
      debt_reminders: TableDef<
        { id: string; debt_id: string; household_id: string; remind_on: string; kind: "preset" | "custom"; days_before: number | null; created_at: string },
        { id?: string; debt_id: string; household_id: string; remind_on: string; kind?: "preset" | "custom"; days_before?: number | null },
        { remind_on?: string }
      >
      push_subscriptions: TableDef<
        { id: string; user_id: string; endpoint: string; p256dh: string; auth: string; user_agent: string | null; created_at: string },
        { id?: string; user_id: string; endpoint: string; p256dh: string; auth: string; user_agent?: string | null },
        Record<string, never>
      >
      notification_log: TableDef<
        { id: string; household_id: string; debt_id: string; days_before: number; sent_at: string },
        { id?: string; household_id: string; debt_id: string; days_before: number; sent_at?: string },
        Record<string, never>
      >
      user_preferences: TableDef<
        { user_id: string; theme: "light" | "dark" | "system"; density: "comfy" | "compact"; push_enabled: boolean; weekly_digest: boolean; digest_hour_local: number; default_reminders: number[]; updated_at: string },
        { user_id: string; theme?: "light" | "dark" | "system"; density?: "comfy" | "compact"; push_enabled?: boolean; weekly_digest?: boolean; digest_hour_local?: number; default_reminders?: number[] },
        { theme?: "light" | "dark" | "system"; density?: "comfy" | "compact"; push_enabled?: boolean; weekly_digest?: boolean; digest_hour_local?: number; default_reminders?: number[] }
      >
    }
    Views: {
      debts_with_totals: {
        Row: {
          id: string; household_id: string; created_by: string; title: string
          direction: "payable" | "receivable"; currency: string; due_date: string
          notes: string | null; recurrence_rule: "none" | "monthly" | "weekly" | "yearly"
          parent_debt_id: string | null; created_at: string; updated_at: string
          total_cents: number; paid_cents: number
          items_count: number; items_paid_count: number
          status: "pending" | "overdue" | "paid" | "empty"
        }
        Relationships: []
      }
    }
    Functions: {
      current_household_ids: { Args: Record<string, never>; Returns: string[] }
      consume_invite: {
        Args: { p_token: string; p_user_id: string }
        Returns: { success: boolean; error: string | null }
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
