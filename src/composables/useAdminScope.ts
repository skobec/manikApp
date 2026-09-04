import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { isSupabaseEnabled } from '@/services/supabase'

// Один вызов в каждой админ-странице: в cloud-режиме composables
// переключаются на бизнес владельца, в local-режиме ничего не меняется.
export function useAdminScope(scopes: Array<(businessId: string) => Promise<void>>) {
  const auth = useAuthStore()
  onMounted(async () => {
    if (auth.initialized && auth.user && auth.business && isSupabaseEnabled()) {
      await Promise.all(scopes.map((fn) => fn(auth.business!.id)))
    }
  })
}
