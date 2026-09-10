import { ref, computed } from 'vue'
import { business } from '@/config/business'
import { isSupabaseEnabled } from '@/services/supabase'
import { getBusinessBySlug } from '@/services/repositories/businesses'
import { listServices } from '@/services/repositories/services'
import { listReviews } from '@/services/repositories/reviews'
import { listWorks } from '@/services/repositories/media'
import { useServices } from '@/composables/useServices'
import { useGallery } from '@/composables/useGallery'
import { useReviews } from '@/composables/useReviews'
import type { Business, Service, Review, GalleryItem } from '@/types'

// Единая точка данных флагмана (твой салон) для публичных страниц.
// Local-режим: мгновенно демо-данные, без скелетонов.
// Cloud-режим: пока грузится — loading=true (показываем скелетоны,
// а НЕ демо, чтобы мок не мелькал); при ошибке — graceful fallback на демо.
const cloud = isSupabaseEnabled()

const loading = ref(false)
const ready = ref(false)
const biz = ref<Business | null>(null)
const cloudServices = ref<Service[]>([])
const cloudWorks = ref<GalleryItem[]>([])
const cloudReviews = ref<Review[]>([])

async function ensureLoaded(): Promise<void> {
  if (!cloud || ready.value || loading.value) return
  loading.value = true
  try {
    const found = await getBusinessBySlug(business.featuredSlug)
    if (!found) return
    const [s, w, r] = await Promise.all([
      listServices(found.id),
      listWorks(found.id),
      listReviews(found.id),
    ])
    biz.value = found
    cloudServices.value = s
    cloudWorks.value = w
    cloudReviews.value = r
    ready.value = true
  } catch {
    // Сеть/бизнес недоступны — страницы покажут демо-данные.
  } finally {
    loading.value = false
  }
}

export function useFeatured() {
  const localServices = useServices()
  const localGallery = useGallery()
  const localReviews = useReviews()

  const services = computed(() =>
    ready.value ? cloudServices.value.filter((s) => s.active) : localServices.activeServices.value,
  )
  const works = computed(() => (ready.value ? cloudWorks.value : localGallery.items.value))
  const reviews = computed(() =>
    ready.value ? cloudReviews.value.filter((r) => r.active) : localReviews.activeReviews.value,
  )

  return { cloud, loading, ready, biz, services, works, reviews, ensureLoaded }
}
