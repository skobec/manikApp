<script setup lang="ts">
import type { Service } from '@/types'
import { formatPrice } from '@/utils/helpers'

defineProps<{
  service: Service
}>()
</script>

<template>
  <div class="price-card">
    <div class="price-card__top">
      <div>
        <h3 class="price-card__name">{{ service.name }}</h3>
        <span class="price-card__duration">{{ service.duration }} мин</span>
      </div>
      <span class="price-card__price">{{ formatPrice(service.price) }}</span>
    </div>
    <p class="price-card__desc">{{ service.description }}</p>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.price-card {
  @include card;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &:not(:last-child) {
    border-bottom: none;
    border-radius: 0;
  }

  &:first-child {
    border-radius: $radius-lg $radius-lg 0 0;
  }

  &:last-child {
    border-radius: 0 0 $radius-lg $radius-lg;
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  &__name {
    font-size: 16px;
    font-weight: 600;
  }

  &__duration {
    font-size: 13px;
    color: $color-text-tertiary;
  }

  &__price {
    font-size: 18px;
    font-weight: 700;
    color: $color-text;
    white-space: nowrap;
  }

  &__desc {
    font-size: 14px;
    color: $color-text-secondary;
  }
}
</style>
