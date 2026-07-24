import { ref, computed } from 'vue'
import type { Review } from '@/types'
import { storage } from '@/services/storage'
import { defaultReviews } from '@/data/reviews'
import { generateId } from '@/utils/helpers'

const reviews = ref<Review[]>([])

function load() {
  const saved = storage.getAll<Review>('reviews')
  reviews.value = saved.length > 0 ? saved : defaultReviews
  if (saved.length === 0) {
    storage.set('reviews', reviews.value)
  }
}

load()

export function useReviews() {
  const activeReviews = computed(() => reviews.value.filter((r) => r.active))

  function add(review: Omit<Review, 'id'>) {
    const newReview: Review = { ...review, id: generateId() }
    reviews.value.push(newReview)
    save()
    return newReview
  }

  function update(id: string, updates: Partial<Review>) {
    const index = reviews.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      reviews.value[index] = { ...reviews.value[index], ...updates }
      save()
    }
  }

  function remove(id: string) {
    reviews.value = reviews.value.filter((r) => r.id !== id)
    save()
  }

  function save() {
    storage.set('reviews', reviews.value)
  }

  return { reviews, activeReviews, add, update, remove, load }
}
