import { AppShell } from "@/shared/ui/app-shell"
import { SettingsClient } from "@/features/settings/components/settings-client"
import { getPreferences } from "@/features/settings/actions"
import { getUser } from "@/shared/lib/supabase/server"

export default async function SettingsPage() {
  const [user, prefs] = await Promise.all([getUser(), getPreferences()])
  const userName = (user?.user_metadata?.full_name as string | undefined)
  return (
    <AppShell titleKey="settings">
      <SettingsClient prefs={prefs} userEmail={user?.email} userName={userName} />
    </AppShell>
  )
}
