import { ref, computed } from 'vue'
import type { Review } from '@/types'
import { storage } from '@/services/storage'
import { defaultReviews } from '@/data/reviews'
import { generateId } from '@/utils/helpers'
import { isSupabaseEnabled } from '@/services/supabase'
import { listReviews, createReview, updateReview, deleteReview } from '@/services/repositories/reviews'
import { ruError } from '@/utils/errors'

const reviews = ref<Review[]>([])
const cloudBusinessId = ref<string | null>(null)
const cloudError = ref('')

function load() {
  const saved = storage.getAll<Review>('reviews')
  reviews.value = saved.length > 0 ? saved : defaultReviews
  if (saved.length === 0) {
    storage.set('reviews', reviews.value)
  }
}

load()

function isCloud(): boolean {
  return cloudBusinessId.value !== null && isSupabaseEnabled()
}

export function useReviews() {
  const activeReviews = computed(() => reviews.value.filter((r) => r.active))

  async function useCloudScope(businessId: string) {
    cloudBusinessId.value = businessId
    await reload()
  }

  function useLocalScope() {
    cloudBusinessId.value = null
    load()
  }

  async function reload() {
    if (!isCloud()) return
    cloudError.value = ''
    try {
      reviews.value = await listReviews(cloudBusinessId.value as string)
    } catch (e) {
      cloudError.value = ruError(e instanceof Error ? e.message : '')
    }
  }

  async function add(review: Omit<Review, 'id'>) {
    if (isCloud()) {
      cloudError.value = ''
      try {
        const created = await createReview(cloudBusinessId.value as string, {
          name: review.name,
          text: review.text,
          rating: review.rating,
          active: review.active,
        })
        reviews.value.unshift(created)
        return created
      } catch (e) {
        cloudError.value = ruError(e instanceof Error ? e.message : '')
        throw e
      }
    }
    const newReview: Review = { ...review, id: generateId() }
    reviews.value.push(newReview)
    save()
    return newReview
  }

  async function update(id: string, updates: Partial<Review>) {
    if (isCloud()) {
      cloudError.value = ''
      try {
        const updated = await updateReview(id, {
          name: updates.name,
          text: updates.text,
          rating: updates.rating,
          active: updates.active,
        })
        const index = reviews.value.findIndex((r) => r.id === id)
        if (index !== -1) reviews.value[index] = updated
        return
      } catch (e) {
        cloudError.value = ruError(e instanceof Error ? e.message : '')
        throw e
      }
    }
    const index = reviews.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      reviews.value[index] = { ...reviews.value[index], ...updates }
      save()
    }
  }

  async function remove(id: string) {
    if (isCloud()) {
      cloudError.value = ''
      try {
        await deleteReview(id)
      } catch (e) {
        cloudError.value = ruError(e instanceof Error ? e.message : '')
        throw e
      }
    }
    reviews.value = reviews.value.filter((r) => r.id !== id)
    if (!isCloud()) save()
  }

  function save() {
    storage.set('reviews', reviews.value)
  }

  return { reviews, activeReviews, cloudError, add, update, remove, load, useCloudScope, useLocalScope, reload }
}
