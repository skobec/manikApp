<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import PriceCard from '@/components/PriceCard.vue'
import GalleryCard from '@/components/GalleryCard.vue'
import ReviewCard from '@/components/ReviewCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppLoader from '@/components/ui/AppLoader.vue'
import { business as featuredConfig } from '@/config/business'
import { isSupabaseEnabled } from '@/services/supabase'
import { getBusinessBySlug } from '@/services/repositories/businesses'
import { listServices } from '@/services/repositories/services'
import { listReviews } from '@/services/repositories/reviews'
import { listWorks } from '@/services/repositories/media'
import { useServices } from '@/composables/useServices'
import { useReviews } from '@/composables/useReviews'
import { useGallery } from '@/composables/useGallery'
import { ruError } from '@/utils/errors'
import type { Business, Service, Review, GalleryItem } from '@/types'

const props = defineProps<{ slug: string }>()
const router = useRouter()
const cloud = isSupabaseEnabled()

// Local-режим: демо-данные одного салона.
const localServices = useServices()
const localReviews = useReviews()
const localGallery = useGallery()

const loading = ref(false)
const loadError = ref('')
const biz = ref<Business | null>(null)
const cloudServices = ref<Service[]>([])
const cloudReviews = ref<Review[]>([])
const cloudWorks = ref<GalleryItem[]>([])

const services = computed(() =>
  cloud ? cloudServices.value.filter((s) => s.active) : localServices.activeServices.value,
)
const reviews = computed(() =>
  cloud ? cloudReviews.value.filter((r) => r.active) : localReviews.activeReviews.value,
)
const works = computed(() => (cloud ? cloudWorks.value : localGallery.items.value))

const grouped = computed(() => {
  const cats = Array.from(new Set(services.value.map((s) => s.category)))
  return cats.map((cat) => ({
    category: cat,
    services: services.value.filter((s) => s.category === cat),
  }))
})

const displayName = computed(() => (cloud ? (biz.value?.name ?? 'Студия') : featuredConfig.name))
const displayCity = computed(() => (cloud ? (biz.value?.city ?? '') : 'Москва'))
const displayAddress = computed(() => (cloud ? (biz.value?.address ?? '') : 'ул. Тверская, д. 15'))
const displayPhone = computed(() => (cloud ? (biz.value?.phone ?? '') : '+7 (999) 123-45-67'))
const displayDescription = computed(() =>
  cloud
    ? (biz.value?.description ?? '')
    : 'Профессиональный маникюр и педикюр в уютной студии. Индивидуальный подход и безупречный результат.',
)

async function load() {
  if (!cloud) return
  loading.value = true
  loadError.value = ''
  biz.value = null
  try {
    const found = await getBusinessBySlug(props.slug)
    biz.value = found
    if (found) {
      const [s, r, w] = await Promise.all([
        listServices(found.id),
        listReviews(found.id),
        listWorks(found.id),
      ])
      cloudServices.value = s
      cloudReviews.value = r
      cloudWorks.value = w
      document.title = `${found.name} — запись онлайн | BeautyBooking`
    }
  } catch (e) {
    loadError.value = ruError(e instanceof Error ? e.message : '')
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(
  () => props.slug,
  () => load(),
)

function goBooking() {
  router.push(`/${props.slug}/booking`)
}

function initial(name: string): string {
  return (name.trim()[0] ?? 'N').toUpperCase()
}
</script>

<template>
  <div class="studio">
    <div v-if="cloud && loading" class="studio__loading">
      <AppLoader size="lg" />
    </div>

    <div v-else-if="cloud && loadError" class="studio__state">
      <h1>Не получилось загрузить страницу</h1>
      <p>{{ loadError }}</p>
      <AppButton @click="load">Попробовать снова</AppButton>
    </div>

    <div v-else-if="cloud && !biz" class="studio__state">
      <h1>Студия не найдена</h1>
      <p>Похоже, такой страницы нет или она отключена. Проверьте адрес.</p>
      <AppButton variant="secondary" @click="router.push('/')">На главную</AppButton>
    </div>

    <template v-else>
      <!-- Шапка студии -->
      <section class="studio__hero">
        <div class="studio__hero-inner">
          <div class="studio__avatar">{{ initial(displayName) }}</div>
          <p v-if="displayCity" class="studio__city">{{ displayCity }}</p>
          <h1>{{ displayName }}</h1>
          <p v-if="displayDescription" class="studio__desc">{{ displayDescription }}</p>
          <p v-if="displayAddress" class="studio__addr">{{ displayAddress }}</p>
          <div class="studio__actions">
            <AppButton size="lg" @click="goBooking">Записаться онлайн</AppButton>
            <a v-if="displayPhone" :href="`tel:${displayPhone.replace(/[^+\d]/g, '')}`">
              <AppButton size="lg" variant="secondary">{{ displayPhone }}</AppButton>
            </a>
          </div>
        </div>
      </section>

      <!-- Услуги и цены -->
      <section v-if="grouped.length > 0" class="studio__section">
        <div class="studio__container">
          <div class="studio__section-header">
            <span class="studio__badge">Прайс</span>
            <h2>Услуги и цены</h2>
          </div>
          <div v-for="group in grouped" :key="group.category" class="studio__group">
            <h3 class="studio__group-title">{{ group.category }}</h3>
            <div class="studio__list">
              <PriceCard v-for="s in group.services" :key="s.id" :service="s" />
            </div>
          </div>
          <div class="studio__section-action">
            <AppButton @click="goBooking">Выбрать время</AppButton>
          </div>
        </div>
      </section>

      <!-- Работы -->
      <section v-if="works.length > 0" class="studio__section studio__section--alt">
        <div class="studio__container">
          <div class="studio__section-header">
            <span class="studio__badge">Портфолио</span>
            <h2>Наши работы</h2>
          </div>
          <div class="studio__gallery-grid">
            <GalleryCard v-for="item in works.slice(0, 6)" :key="item.id" :item="item" />
          </div>
        </div>
      </section>

      <!-- Отзывы -->
      <section v-if="reviews.length > 0" class="studio__section">
        <div class="studio__container">
          <div class="studio__section-header">
            <span class="studio__badge">Отзывы</span>
            <h2>Что говорят клиенты</h2>
          </div>
          <div class="studio__reviews-grid">
            <ReviewCard v-for="r in reviews.slice(0, 6)" :key="r.id" :review="r" />
          </div>
        </div>
      </section>

      <!-- Контакты + CTA -->
      <section class="studio__section studio__section--alt">
        <div class="studio__container">
          <div class="studio__cta">
            <h2>Запишитесь прямо сейчас</h2>
            <p v-if="displayAddress">{{ displayAddress }}</p>
            <p v-if="displayPhone">{{ displayPhone }}</p>
            <AppButton size="lg" @click="goBooking">Записаться онлайн</AppButton>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.studio {
  &__loading {
    min-height: 60vh;
    @include flex-center;
  }

  &__state {
    @include container;
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    text-align: center;
    padding-top: 60px;
    padding-bottom: 60px;
  }

  &__hero {
    @include section;
    background: $color-surface;
  }

  &__hero-inner {
    @include container;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
  }

  &__avatar {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    @include flex-center;
    font-size: 40px;
    font-weight: 700;
    color: $color-primary;
    background: $color-primary-light;
  }

  &__city {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: $color-text-tertiary;
  }

  &__desc {
    max-width: 560px;
  }

  &__addr {
    font-size: 14px;
    color: $color-text-tertiary;
  }

  &__actions {
    display: flex;
    gap: 12px;
    margin-top: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }

  &__section {
    @include section;

    &--alt {
      background: $color-surface;
    }
  }

  &__container {
    @include container;
  }

  &__section-header {
    text-align: center;
    margin-bottom: 40px;
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

  &__group {
    max-width: 720px;
    margin: 0 auto 32px;
  }

  &__group-title {
    font-size: 18px;
    margin-bottom: 12px;
    color: $color-text-secondary;
  }

  &__list {
    display: flex;
    flex-direction: column;
  }

  &__gallery-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    @include tablet { grid-template-columns: repeat(2, 1fr); }
    @include mobile { grid-template-columns: 1fr; }
  }

  &__reviews-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;

    @include mobile { grid-template-columns: 1fr; }
  }

  &__section-action {
    display: flex;
    justify-content: center;
    margin-top: 32px;
  }

  &__cta {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 40px 0;
  }
}
</style>
