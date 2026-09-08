<script setup lang="ts">
import { ref, computed } from 'vue'
import type { GalleryItem } from '@/types'

const props = defineProps<{
  item: GalleryItem
}>()

// Реальный URL (Storage, внешний https или локальный dataURL) — показываем фото,
// иначе (или если файл битый) — заглушку.
const hasSrc = computed(() => !!props.item.src && /^(https?:|data:)/.test(props.item.src))
const imgOk = ref(true)
</script>

<template>
  <div class="gallery-card">
    <div class="gallery-card__image">
      <img
        v-if="hasSrc && imgOk"
        :src="item.src"
        :alt="item.alt || 'Работа мастера'"
        class="gallery-card__photo"
        loading="lazy"
        @error="imgOk = false"
      />
      <div v-else class="gallery-card__placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
    </div>
    <div v-if="item.category || item.description" class="gallery-card__info">
      <span v-if="item.category" class="gallery-card__category">{{ item.category }}</span>
      <p v-if="item.description" class="gallery-card__desc">{{ item.description }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.gallery-card {
  @include card;
  @include card-hover;
  overflow: hidden;

  &__image {
    aspect-ratio: 3/4;
    overflow: hidden;
  }

  &__photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, $color-primary-light, #fef5f2);
    color: $color-primary;
    opacity: 0.6;
  }

  &__info {
    padding: 16px;
  }

  &__category {
    display: inline-block;
    padding: 3px 8px;
    background: $color-bg;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
    color: $color-text-secondary;
    margin-bottom: 6px;
  }

  &__desc {
    font-size: 14px;
    color: $color-text;
  }
}
</style>
