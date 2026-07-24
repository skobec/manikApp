<script setup lang="ts">
import type { Review } from '@/types'
import { formatDate } from '@/utils/helpers'

defineProps<{
  review: Review
}>()
</script>

<template>
  <div class="review-card">
    <div class="review-card__stars">
      <svg
        v-for="i in 5"
        :key="i"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        :class="{ 'review-card__star--filled': i <= review.rating }"
      >
        <path
          d="M8 1.5L9.8 5.1L13.8 5.7L10.9 8.6L11.6 12.5L8 10.8L4.4 12.5L5.1 8.6L2.2 5.7L6.2 5.1L8 1.5Z"
          fill="currentColor"
        />
      </svg>
    </div>
    <p class="review-card__text">"{{ review.text }}"</p>
    <div class="review-card__footer">
      <span class="review-card__name">{{ review.name }}</span>
      <span class="review-card__date">{{ formatDate(review.date) }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.review-card {
  @include card;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__stars {
    display: flex;
    gap: 2px;
    color: $color-border;

    .review-card__star--filled {
      color: #f59e0b;
    }
  }

  &__text {
    font-size: 15px;
    color: $color-text;
    line-height: 1.7;
    font-style: italic;
    flex: 1;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: $color-text;
  }

  &__date {
    font-size: 13px;
    color: $color-text-tertiary;
  }
}
</style>
