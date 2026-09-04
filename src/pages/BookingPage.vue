<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import BookingForm, { type BookingContext } from '@/components/BookingForm.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppLoader from '@/components/ui/AppLoader.vue'
import { business } from '@/config/business'
import { isSupabaseEnabled } from '@/services/supabase'
import { getBusinessBySlug } from '@/services/repositories/businesses'
import { ruError } from '@/utils/errors'
import type { Business } from '@/types'

const props = defineProps<{ slug?: string }>()
const router = useRouter()

const slug = computed(() => props.slug || business.featuredSlug)
const cloud = isSupabaseEnabled()

const loading = ref(false)
const loadError = ref('')
const biz = ref<Business | null>(null)

const context = computed<BookingContext | null>(() => {
  if (!cloud || !biz.value) return null
  return {
    businessId: biz.value.id,
    businessName: biz.value.name,
    timezone: biz.value.timezone || 'Europe/Moscow',
  }
})

async function load() {
  if (!cloud) return
  loading.value = true
  loadError.value = ''
  biz.value = null
  try {
    biz.value = await getBusinessBySlug(slug.value)
    if (biz.value) {
      document.title = `Запись — ${biz.value.name} | BeautyBooking`
    }
  } catch (e) {
    loadError.value = ruError(e instanceof Error ? e.message : '')
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(slug, load)
</script>

<template>
  <div class="booking-page">
    <div class="booking-page__inner">
      <div v-if="cloud && loading" class="booking-page__loading">
        <AppLoader size="lg" />
      </div>
      <div v-else-if="cloud && (loadError || !biz)" class="booking-page__state">
        <h1>Страница записи недоступна</h1>
        <p>{{ loadError || 'Похоже, такой студии нет или она отключена.' }}</p>
        <AppButton variant="secondary" @click="router.push('/')">На главную</AppButton>
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

  &__state {
    min-height: 50vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    text-align: center;
  }
}
</style>
