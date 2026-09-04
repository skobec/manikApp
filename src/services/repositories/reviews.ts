import { supabase } from '@/services/supabase'
import type { Review } from '@/types'

interface ReviewRow {
  id: string
  business_id: string
  author_name: string
  text: string
  rating: number
  is_active: boolean
  created_at: string
}

export function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    name: row.author_name,
    text: row.text,
    rating: row.rating,
    date: row.created_at.slice(0, 10),
    active: row.is_active,
  }
}

function requireClient() {
  if (!supabase) throw new Error('Supabase не подключён.')
  return supabase
}

export async function listReviews(businessId: string): Promise<Review[]> {
  const { data, error } = await requireClient()
    .from('reviews')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return ((data ?? []) as ReviewRow[]).map(mapReview)
}

export async function createReview(
  businessId: string,
  input: { name: string; text: string; rating: number; active: boolean },
): Promise<Review> {
  const { data, error } = await requireClient()
    .from('reviews')
    .insert({
      business_id: businessId,
      author_name: input.name,
      text: input.text,
      rating: input.rating,
      is_active: input.active,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapReview(data as ReviewRow)
}

export async function updateReview(
  id: string,
  input: Partial<{ name: string; text: string; rating: number; active: boolean }>,
): Promise<Review> {
  const payload: Record<string, unknown> = {}
  if (input.name !== undefined) payload.author_name = input.name
  if (input.text !== undefined) payload.text = input.text
  if (input.rating !== undefined) payload.rating = input.rating
  if (input.active !== undefined) payload.is_active = input.active
  const { data, error } = await requireClient()
    .from('reviews')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapReview(data as ReviewRow)
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await requireClient().from('reviews').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
