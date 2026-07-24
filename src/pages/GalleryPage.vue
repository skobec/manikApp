<script setup lang="ts">
import { ref, computed } from 'vue'
import GalleryCard from '@/components/GalleryCard.vue'
import { useGallery } from '@/composables/useGallery'

const { items } = useGallery()

const categories = computed(() => {
  const cats = new Set(items.value.map((i) => i.category))
  return ['Все', ...Array.from(cats)]
})

const activeCategory = ref('Все')

const filtered = computed(() => {
  if (activeCategory.value === 'Все') return items.value
  return items.value.filter((i) => i.category === activeCategory.value)
})
</script>

<template>
  <div class="gallery-page">
    <div class="gallery-page__inner">
      <div class="gallery-page__header">
        <span class="gallery-page__badge">Портфолио</span>
        <h1>Наши работы</h1>
        <p>Примеры дизайнов, покрытий и форм</p>
      </div>
      <div class="gallery-page__categories">
        <button
          v-for="cat in categories"
          :key="cat"
          :class="['gallery-page__cat-btn', { 'gallery-page__cat-btn--active': activeCategory === cat }]"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
      <div class="gallery-page__grid">
        <GalleryCard v-for="item in filtered" :key="item.id" :item="item" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.gallery-page {
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

    p { max-width: 480px; }
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

  &__categories {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-bottom: 40px;
  }

  &__cat-btn {
    padding: 8px 18px;
    border: 1px solid $color-border;
    border-radius: 100px;
    background: transparent;
    font-size: 14px;
    font-weight: 500;
    color: $color-text-secondary;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover { border-color: $color-text; color: $color-text; }
    &--active { background: $color-text; border-color: $color-text; color: white; }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    @include tablet { grid-template-columns: repeat(2, 1fr); }
    @include mobile { grid-template-columns: 1fr; }
  }
}
</style>
