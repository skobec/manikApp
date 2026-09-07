import { supabase } from '@/services/supabase'

export interface NotificationSettings {
  business_id: string
  telegram_enabled: boolean
  telegram_chat_id: string
}

function requireClient() {
  if (!supabase) throw new Error('Supabase не подключён.')
  return supabase
}

export async function getNotificationSettings(
  businessId: string,
): Promise<NotificationSettings | null> {
  const { data, error } = await requireClient()
    .from('notification_settings')
    .select('*')
    .eq('business_id', businessId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as NotificationSettings | null) ?? null
}

export async function saveNotificationSettings(
  businessId: string,
  input: { telegram_enabled: boolean; telegram_chat_id: string },
): Promise<void> {
  const { error } = await requireClient().from('notification_settings').upsert(
    {
      business_id: businessId,
      telegram_enabled: input.telegram_enabled,
      telegram_chat_id: input.telegram_chat_id.trim(),
    },
    { onConflict: 'business_id' },
  )
  if (error) throw new Error(error.message)
}

export async function testTelegramNotification(): Promise<void> {
  const { error } = await requireClient().rpc('test_telegram_notification')
  if (error) throw new Error(error.message)
}
