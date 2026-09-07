import { supabase } from '@/services/supabase'
import type { Business } from '@/types'

function requireClient() {
  if (!supabase) throw new Error('Supabase не подключён.')
  return supabase
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const { data, error } = await requireClient()
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as Business | null) ?? null
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const { data, error } = await requireClient()
    .from('businesses')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as Business | null) ?? null
}

export async function getOwnBusiness(ownerId: string): Promise<Business | null> {
  const { data, error } = await requireClient()
    .from('businesses')
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as Business | null) ?? null
}

export interface BusinessPatch {
  name?: string
  description?: string
  phone?: string
  email?: string
  city?: string
  address?: string
  timezone?: string
  avatar_url?: string
}

export async function updateBusiness(id: string, patch: BusinessPatch): Promise<Business> {
  const { data, error } = await requireClient()
    .from('businesses')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Business
}
