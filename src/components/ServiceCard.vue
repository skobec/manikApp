<script setup lang="ts">
import type { Service } from '@/types'
import { formatPrice } from '@/utils/helpers'

defineProps<{
  service: Service
  selected?: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
}>()
</script>

<template>
  <div
    :class="['service-card', { 'service-card--selected': selected }]"
    @click="emit('select', service.id)"
  >
    <div class="service-card__header">
      <h3 class="service-card__name">{{ service.name }}</h3>
      <span class="service-card__category">{{ service.category }}</span>
    </div>
    <p class="service-card__desc">{{ service.description }}</p>
    <div class="service-card__footer">
      <span class="service-card__price">{{ formatPrice(service.price) }}</span>
      <span class="service-card__duration">{{ service.duration }} мин</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.service-card {
  @include card;
  @include card-hover;
  padding: 24px;
  cursor: pointer;

  &--selected {
    border-color: $color-primary;
    background: $color-primary-light;
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  &__name {
    font-size: 18px;
    font-weight: 600;
  }

  &__category {
    padding: 4px 10px;
    background: $color-bg;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 500;
    color: $color-text-secondary;
    white-space: nowrap;
  }

  &__desc {
    font-size: 14px;
    color: $color-text-secondary;
    margin-bottom: 16px;
    line-height: 1.6;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__price {
    font-size: 20px;
    font-weight: 700;
    color: $color-text;
  }

  &__duration {
    font-size: 13px;
    color: $color-text-tertiary;
  }
}
</style>
