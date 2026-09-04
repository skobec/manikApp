// Single-tenant шов под будущий multi-tenant SaaS (см. AGENTS.md §6, §20).
//
// Сейчас один бизнес: slug/name/timezone берутся из env с дефолтами.
// Позже этот же модуль станет источником `business_id` для всех запросов:
// composables уже ходят в данные только через services/storage.ts,
// поэтому добавление tenant-scoping не потребует переписывания компонентов.

export interface BusinessConfig {
  slug: string
  name: string
  timezone: string
  // Флагманская студия для `/` (твой салон). После онбординга поставь сюда
  // свой slug через VITE_FEATURED_SLUG — главная станет твоей страницей.
  featuredSlug: string
}

function env(key: string, fallback: string): string {
  const value = (import.meta.env[key] as string | undefined)?.trim()
  return value ? value : fallback
}

export const business: BusinessConfig = {
  slug: env('VITE_BUSINESS_SLUG', 'nail-studio'),
  name: env('VITE_APP_NAME', 'Nail Studio'),
  timezone: env('VITE_BUSINESS_TIMEZONE', 'Europe/Moscow'),
  featuredSlug: env('VITE_FEATURED_SLUG', 'nail-studio'),
}
