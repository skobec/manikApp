<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BookingForm, { type BookingContext } from '@/components/BookingForm.vue'
import AppLoader from '@/components/ui/AppLoader.vue'
import { business } from '@/config/business'
import { isSupabaseEnabled } from '@/services/supabase'
import type { Business } from '@/types'

const cloud = isSupabaseEnabled()
const loading = ref(false)
const biz = ref<Business | null>(null)

const context = computed<BookingContext | null>(() => {
  if (!cloud || !biz.value) return null
  return {
    businessId: biz.value.id,
    businessName: biz.value.name,
    timezone: biz.value.timezone || 'Europe/Moscow',
  }
})

onMounted(async () => {
  if (!cloud) return
  loading.value = true
  try {
    const { getBusinessBySlug } = await import('@/services/repositories/businesses')
    biz.value = await getBusinessBySlug(business.featuredSlug)
  } catch {
    // Форма откроется в local-режиме.
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="booking-page">
    <div class="booking-page__inner">
      <div v-if="cloud && loading" class="booking-page__loading">
        <AppLoader size="lg" />
      </div>
      <BookingForm v-else :context="context" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.booking-page {
  @include section;
  min-height: calc(100vh - $nav-height - 200px);

  &__inner {
    @include container;
  }

  &__loading {
    min-height: 50vh;
    @include flex-center;
  }
}
</style>
