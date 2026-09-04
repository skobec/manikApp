import { supabase } from '@/services/supabase'
import type { Service } from '@/types'

interface ServiceRow {
  id: string
  business_id: string
  name: string
  description: string | null
  price: number | string
  currency: string
  duration_minutes: number
  is_active: boolean
  sort_order: number
  category?: string | null
}

export function mapService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    price: Number(row.price),
    duration: row.duration_minutes,
    category: row.category ?? 'Услуги',
    active: row.is_active,
  }
}

function requireClient() {
  if (!supabase) throw new Error('Supabase не подключён.')
  return supabase
}

// Колонка category появилась в миграции 0002. Если владелец её ещё не применил,
// повторяем запрос без category, чтобы ничего не ломалось.
function isUnknownColumn(err: { code?: string; message?: string }): boolean {
  const code = err.code ?? ''
  const msg = (err.message ?? '').toLowerCase()
  return code === '42703' || code === 'PGRST204' || msg.includes('category')
}

export async function listServices(businessId: string): Promise<Service[]> {
  const client = requireClient()
  const base = client
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true })
  const { data, error } = await base
  if (error) throw new Error(error.message)
  return ((data ?? []) as ServiceRow[]).map(mapService)
}

export interface ServiceInput {
  name: string
  description: string
  price: number
  duration_minutes: number
  category: string
  is_active: boolean
}

export async function createService(businessId: string, input: ServiceInput): Promise<Service> {
  const client = requireClient()
  const payload: Record<string, unknown> = { business_id: businessId, ...input }
  let { data, error } = await client.from('services').insert(payload).select().single()
  if (error && isUnknownColumn(error)) {
    delete payload.category
    ;({ data, error } = await client.from('services').insert(payload).select().single())
  }
  if (error) throw new Error(error.message)
  return mapService(data as ServiceRow)
}

export async function updateService(
  id: string,
  input: Partial<ServiceInput & { sort_order: number }>,
): Promise<Service> {
  const client = requireClient()
  const payload: Record<string, unknown> = { ...input }
  let { data, error } = await client.from('services').update(payload).eq('id', id).select().single()
  if (error && isUnknownColumn(error)) {
    delete payload.category
    ;({ data, error } = await client.from('services').update(payload).eq('id', id).select().single())
  }
  if (error) throw new Error(error.message)
  return mapService(data as ServiceRow)
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await requireClient().from('services').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
