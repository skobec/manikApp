import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@supabase/supabase-js'
import { supabase, isSupabaseEnabled, backendHint } from '@/services/supabase'
import { ruError } from '@/utils/errors'
import type { Business } from '@/types'

export interface BusinessInput {
  name: string
  slug: string
  city: string
  timezone: string
  address?: string
}

export type AuthResult =
  | { ok: true; needsConfirmation: boolean }
  | { ok: false }

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const business = ref<Business | null>(null)
  const loading = ref(false)
  const initialized = ref(false)
  const error = ref('')

  async function loadBusiness() {
    if (!supabase || !user.value) return
    const { data, error: err } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', user.value.id)
      .maybeSingle()
    if (!err) business.value = (data as Business | null) ?? null
  }

  async function init() {
    if (initialized.value) return
    if (!isSupabaseEnabled() || !supabase) {
      initialized.value = true
      return
    }
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    if (user.value) await loadBusiness()
    supabase.auth.onAuthStateChange(async (_event, session) => {
      user.value = session?.user ?? null
      if (user.value) await loadBusiness()
      else business.value = null
    })
    initialized.value = true
  }

  async function signUp(email: string, password: string): Promise<AuthResult> {
    error.value = ''
    if (!supabase) {
      error.value = backendHint()
      return { ok: false }
    }
    loading.value = true
    try {
      const { data, error: err } = await supabase.auth.signUp({ email, password })
      if (err) {
        error.value = ruError(err.message)
        return { ok: false }
      }
      if (data.session) {
        user.value = data.session.user
        await loadBusiness()
        return { ok: true, needsConfirmation: false }
      }
      // В проекте включено подтверждение email — сессии нет, бизнес
      // создадим после первого входа (см. OnboardingPage).
      return { ok: true, needsConfirmation: true }
    } finally {
      loading.value = false
    }
  }

  async function signIn(email: string, password: string): Promise<AuthResult> {
    error.value = ''
    if (!supabase) {
      error.value = backendHint()
      return { ok: false }
    }
    loading.value = true
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) {
        error.value = ruError(err.message)
        return { ok: false }
      }
      user.value = data.session?.user ?? null
      if (user.value) await loadBusiness()
      return { ok: true, needsConfirmation: false }
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut()
    user.value = null
    business.value = null
    error.value = ''
  }

  async function createBusiness(input: BusinessInput): Promise<boolean> {
    error.value = ''
    if (!supabase || !user.value) {
      error.value = 'Нет сессии. Войдите заново.'
      return false
    }
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('businesses')
        .insert({
          owner_id: user.value.id,
          name: input.name,
          slug: input.slug,
          city: input.city,
          address: input.address ?? '',
          timezone: input.timezone,
          is_active: true,
        })
        .select()
        .single()
      if (err) {
        error.value = ruError(err.message)
        return false
      }
      business.value = data as Business
      return true
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    business,
    loading,
    initialized,
    error,
    backendEnabled: isSupabaseEnabled(),
    init,
    signUp,
    signIn,
    signOut,
    createBusiness,
  }
})
