<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ReviewCard from '@/components/ReviewCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { business } from '@/config/business'
import { isSupabaseEnabled } from '@/services/supabase'
import { listReviews } from '@/services/repositories/reviews'
import { useReviews } from '@/composables/useReviews'
import type { Review } from '@/types'

const router = useRouter()
const cloud = isSupabaseEnabled()
const localReviews = useReviews()

const cloudReady = ref(false)
const cloudReviews = ref<Review[]>([])

const reviews = computed(() =>
  cloudReady.value ? cloudReviews.value.filter((r) => r.active) : localReviews.activeReviews.value,
)

onMounted(async () => {
  if (!cloud) return
  try {
    const { getBusinessBySlug } = await import('@/services/repositories/businesses')
    const found = await getBusinessBySlug(business.featuredSlug)
    if (!found) return
    cloudReviews.value = await listReviews(found.id)
    cloudReady.value = true
  } catch {
    // Показываем демо-данные.
  }
})
</script>

<template>
  <div class="reviews-page">
    <div class="reviews-page__inner">
      <div class="reviews-page__header">
        <span class="reviews-page__badge">Отзывы</span>
        <h1>Что говорят клиенты</h1>
      </div>
      <div v-if="reviews.length === 0" class="reviews-page__empty">
        <p>Отзывов пока нет — станьте первым!</p>
      </div>
      <div v-else class="reviews-page__grid">
        <ReviewCard v-for="r in reviews" :key="r.id" :review="r" />
      </div>
      <div class="reviews-page__cta">
        <p>Запишитесь и оцените качество сами</p>
        <AppButton @click="router.push('/booking')">Записаться</AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.reviews-page {
  @include section;

  &__inner {
    @include container;
  }

  &__header {
    text-align: center;
    margin-bottom: 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  &__badge {
    display: inline-flex;
    padding: 6px 14px;
    background: $color-primary-light;
    color: $color-primary;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 600;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;

    @include mobile { grid-template-columns: 1fr; }
  }

  &__empty {
    text-align: center;
    padding: 60px 0;
    color: $color-text-tertiary;
  }

  &__cta {
    text-align: center;
    margin-top: 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
}
</style>
