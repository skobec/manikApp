// Supabase-шов (см. docs/supabase-setup.md и AGENTS.md §25–27).
//
// Как это работает:
// - Бэкенд НЕ обязателен: если переменные окружения не заданы (или
//   VITE_USE_SUPABASE !== 'true'), `supabase` равен null и всё приложение
//   продолжает работать на localStorage через services/storage.ts.
// - Когда заведёшь бесплатный проект Supabase и положишь ключи в .env.local,
//   этот модуль начнёт отдавать готовый клиент — следующий этап (Phase B)
//   переключит composables (useBookings, useServices, ...) с localStorage
//   на Supabase, не трогая компоненты.
//
// В браузер попадает только ANON KEY (RLS всё равно режет доступ по
// business_id). SERVICE ROLE KEY сюда класть ЗАПРЕЩЕНО.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
// Новый формат ключей Supabase: sb_publishable_* (старый anon JWT тоже подойдёт).
const publishableKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
const enabled = (import.meta.env.VITE_USE_SUPABASE as string | undefined) === 'true'

let client: SupabaseClient | null = null

if (enabled && url && publishableKey) {
  client = createClient(url, publishableKey)
} else if (enabled) {
  console.warn(
    '[supabase] VITE_USE_SUPABASE=true, но VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY не заданы. Работаю на localStorage.',
  )
}

export const supabase: SupabaseClient | null = client

export function isSupabaseEnabled(): boolean {
  return client !== null
}
