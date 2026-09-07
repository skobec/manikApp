<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import GalleryCard from '@/components/GalleryCard.vue'
import { business } from '@/config/business'
import { isSupabaseEnabled } from '@/services/supabase'
import { listWorks } from '@/services/repositories/media'
import { useGallery } from '@/composables/useGallery'
import type { GalleryItem } from '@/types'

const cloud = isSupabaseEnabled()
const localGallery = useGallery()

const cloudReady = ref(false)
const cloudWorks = ref<GalleryItem[]>([])
const activeCategory = ref('Все')

const works = computed(() => (cloudReady.value ? cloudWorks.value : localGallery.items.value))

const categories = computed(() => {
  const cats = new Set(works.value.map((i) => i.category))
  return ['Все', ...Array.from(cats)]
})

const filtered = computed(() => {
  if (activeCategory.value === 'Все') return works.value
  return works.value.filter((i) => i.category === activeCategory.value)
})

onMounted(async () => {
  if (!cloud) return
  try {
    const { getBusinessBySlug } = await import('@/services/repositories/businesses')
    const found = await getBusinessBySlug(business.featuredSlug)
    if (!found) return
    cloudWorks.value = await listWorks(found.id)
    cloudReady.value = true
  } catch {
    // Показываем демо-данные.
  }
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
      <div v-if="filtered.length === 0" class="gallery-page__empty">
        <p>Работы скоро появятся. Загляните позже.</p>
      </div>
      <div v-else class="gallery-page__grid">
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

  &__empty {
    text-align: center;
    padding: 60px 0;
    color: $color-text-tertiary;
  }
}
</style>
