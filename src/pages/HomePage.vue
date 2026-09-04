<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HeroSection from '@/components/HeroSection.vue'
import ServiceCard from '@/components/ServiceCard.vue'
import GalleryCard from '@/components/GalleryCard.vue'
import ReviewCard from '@/components/ReviewCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { business } from '@/config/business'
import { isSupabaseEnabled } from '@/services/supabase'
import { getBusinessBySlug } from '@/services/repositories/businesses'
import { listServices } from '@/services/repositories/services'
import { listReviews } from '@/services/repositories/reviews'
import { listWorks } from '@/services/repositories/media'
import { useServices } from '@/composables/useServices'
import { useGallery } from '@/composables/useGallery'
import { useReviews } from '@/composables/useReviews'
import type { Service, Review, GalleryItem } from '@/types'

const router = useRouter()
const cloud = isSupabaseEnabled()
const featuredSlug = business.featuredSlug

// Local-режим: демо-данные. Cloud: витрина флагманской студии.
const localServices = useServices()
const localGallery = useGallery()
const localReviews = useReviews()

const cloudReady = ref(false)
const cloudServices = ref<Service[]>([])
const cloudWorks = ref<GalleryItem[]>([])
const cloudReviews = ref<Review[]>([])

const services = computed(() =>
  cloudReady.value ? cloudServices.value.filter((s) => s.active) : localServices.activeServices.value,
)
const works = computed(() => (cloudReady.value ? cloudWorks.value : localGallery.items.value))
const reviews = computed(() =>
  cloudReady.value ? cloudReviews.value.filter((r) => r.active) : localReviews.activeReviews.value,
)

onMounted(async () => {
  if (!cloud) return
  try {
    const found = await getBusinessBySlug(featuredSlug)
    if (!found) return
    const [s, w, r] = await Promise.all([
      listServices(found.id),
      listWorks(found.id),
      listReviews(found.id),
    ])
    cloudServices.value = s
    cloudWorks.value = w
    cloudReviews.value = r
    cloudReady.value = true
  } catch {
    // Флагман не найден или сеть недоступна — показываем демо-данные.
  }
})

function goStudio() {
  router.push(`/${featuredSlug}`)
}

function goBooking() {
  router.push(`/${featuredSlug}/booking`)
}
</script>

<template>
  <div class="home">
    <HeroSection />

    <!-- Services Preview -->
    <section v-if="services.length > 0" class="home__section">
      <div class="home__container">
        <div class="home__section-header">
          <span class="home__badge">Услуги</span>
          <h2>Что мы предлагаем</h2>
          <p>Широкий спектр услуг маникюра и педикюра на любой вкус</p>
        </div>
        <div class="home__services-grid">
          <ServiceCard
            v-for="s in services.slice(0, 4)"
            :key="s.id"
            :service="s"
            @select="goBooking"
          />
        </div>
        <div class="home__section-action">
          <AppButton variant="secondary" @click="goStudio">Все услуги и цены</AppButton>
        </div>
      </div>
    </section>

    <!-- Gallery Preview -->
    <section v-if="works.length > 0" class="home__section home__section--alt">
      <div class="home__container">
        <div class="home__section-header">
          <span class="home__badge">Портфолио</span>
          <h2>Наши работы</h2>
          <p>Примеры дизайнов и покрытий</p>
        </div>
        <div class="home__gallery-grid">
          <GalleryCard v-for="item in works.slice(0, 4)" :key="item.id" :item="item" />
        </div>
        <div class="home__section-action">
          <AppButton variant="secondary" @click="goStudio">Вся галерея</AppButton>
        </div>
      </div>
    </section>

    <!-- Reviews Preview -->
    <section v-if="reviews.length > 0" class="home__section">
      <div class="home__container">
        <div class="home__section-header">
          <span class="home__badge">Отзывы</span>
          <h2>Что говорят клиенты</h2>
        </div>
        <div class="home__reviews-grid">
          <ReviewCard v-for="r in reviews.slice(0, 3)" :key="r.id" :review="r" />
        </div>
        <div class="home__section-action">
          <AppButton variant="secondary" @click="goStudio">Все отзывы</AppButton>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="home__section home__section--cta">
      <div class="home__container">
        <div class="home__cta">
          <h2>Запишитесь прямо сейчас</h2>
          <p>Оставьте заявку и мы подберём удобное время</p>
          <AppButton size="lg" @click="goBooking">Записаться онлайн</AppButton>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.home {
  &__section {
    @include section;

    &--alt {
      background: $color-surface;
    }

    &--cta {
      background: $color-surface;
    }
  }

  &__container {
    @include container;
  }

  &__section-header {
    text-align: center;
    margin-bottom: 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    p {
      max-width: 480px;
    }
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

  &__services-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    @include mobile {
      grid-template-columns: 1fr;
    }
  }

  &__gallery-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;

    @include tablet {
      grid-template-columns: repeat(2, 1fr);
    }

    @include mobile {
      grid-template-columns: 1fr;
    }
  }

  &__reviews-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    @include tablet {
      grid-template-columns: repeat(2, 1fr);
    }

    @include mobile {
      grid-template-columns: 1fr;
    }
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
    gap: 16px;
    padding: 60px 0;

    p {
      max-width: 400px;
    }
  }
}
</style>
