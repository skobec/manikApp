import { supabase } from '@/services/supabase'
import type { GalleryItem } from '@/types'

interface MediaRow {
  id: string
  business_id: string
  kind: string
  url: string
  alt?: string | null
  description?: string | null
  category?: string | null
  sort_order: number
  created_at: string
}

export function mapMedia(row: MediaRow): GalleryItem {
  return {
    id: row.id,
    src: row.url,
    alt: row.alt || 'Работа мастера',
    description: row.description ?? '',
    category: row.category || 'Работы',
    date: row.created_at.slice(0, 10),
  }
}

function requireClient() {
  if (!supabase) throw new Error('Supabase не подключён.')
  return supabase
}

export async function listWorks(businessId: string): Promise<GalleryItem[]> {
  const { data, error } = await requireClient()
    .from('media')
    .select('*')
    .eq('business_id', businessId)
    .eq('kind', 'work')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return ((data ?? []) as MediaRow[]).map(mapMedia)
}

export interface WorkInput {
  url: string
  alt: string
  description: string
  category: string
}

export async function createWork(businessId: string, input: WorkInput): Promise<GalleryItem> {
  const payload: Record<string, unknown> = {
    business_id: businessId,
    kind: 'work',
    url: input.url,
    alt: input.alt,
    description: input.description,
    category: input.category || 'Работы',
  }
  let { data, error } = await requireClient().from('media').insert(payload).select().single()
  if (error && isUnknownColumn(error)) {
    // Миграция 0005 ещё не применена — сохраняем хотя бы url.
    delete payload.alt
    delete payload.description
    delete payload.category
    ;({ data, error } = await requireClient().from('media').insert(payload).select().single())
  }
  if (error) throw new Error(error.message)
  return mapMedia(data as MediaRow)
}

export async function updateWork(id: string, input: Partial<WorkInput>): Promise<GalleryItem> {
  const payload: Record<string, unknown> = { ...input }
  let { data, error } = await requireClient()
    .from('media')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error && isUnknownColumn(error)) {
    delete payload.alt
    delete payload.description
    delete payload.category
    ;({ data, error } = await requireClient()
      .from('media')
      .update(payload)
      .eq('id', id)
      .select()
      .single())
  }
  if (error) throw new Error(error.message)
  return mapMedia(data as MediaRow)
}

function isUnknownColumn(err: { code?: string; message?: string }): boolean {
  const code = err.code ?? ''
  const msg = (err.message ?? '').toLowerCase()
  return (
    code === '42703' ||
    code === 'PGRST204' ||
    (msg.includes('column') && (msg.includes('alt') || msg.includes('description') || msg.includes('category')))
  )
}

export async function deleteWork(id: string): Promise<void> {
  const { error } = await requireClient().from('media').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// Загрузка файла в Storage-бакет `works` (нужна сессия мастера —
// RLS разрешает запись только authenticated). Возвращает публичный URL.
export async function uploadWorkImage(businessId: string, file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Выберите файл-изображение (JPG, PNG или WebP).')
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Файл больше 5 МБ. Уменьшите фото и попробуйте снова.')
  }
  const client = requireClient()
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${businessId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await client.storage
    .from('works')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw new Error(error.message)
  const { data } = client.storage.from('works').getPublicUrl(path)
  return data.publicUrl
}
