<script setup lang="ts">
import { useRouter } from 'vue-router'
import HeroSection from '@/components/HeroSection.vue'
import ServiceCard from '@/components/ServiceCard.vue'
import GalleryCard from '@/components/GalleryCard.vue'
import ReviewCard from '@/components/ReviewCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useServices } from '@/composables/useServices'
import { useGallery } from '@/composables/useGallery'
import { useReviews } from '@/composables/useReviews'

const router = useRouter()
const { activeServices } = useServices()
const { items } = useGallery()
const { activeReviews } = useReviews()
</script>

<template>
  <div class="home">
    <HeroSection />

    <!-- Services Preview -->
    <section class="home__section">
      <div class="home__container">
        <div class="home__section-header">
          <span class="home__badge">Услуги</span>
          <h2>Что мы предлагаем</h2>
          <p>Широкий спектр услуг маникюра и педикюра на любой вкус</p>
        </div>
        <div class="home__services-grid">
          <ServiceCard
            v-for="s in activeServices.slice(0, 4)"
            :key="s.id"
            :service="s"
            @select="router.push('/booking')"
          />
        </div>
        <div class="home__section-action">
          <AppButton variant="secondary" @click="router.push('/prices')">Все услуги и цены</AppButton>
        </div>
      </div>
    </section>

    <!-- Gallery Preview -->
    <section class="home__section home__section--alt">
      <div class="home__container">
        <div class="home__section-header">
          <span class="home__badge">Портфолио</span>
          <h2>Наши работы</h2>
          <p>Примеры дизайнов и покрытий</p>
        </div>
        <div class="home__gallery-grid">
          <GalleryCard v-for="item in items.slice(0, 4)" :key="item.id" :item="item" />
        </div>
        <div class="home__section-action">
          <AppButton variant="secondary" @click="router.push('/gallery')">Вся галерея</AppButton>
        </div>
      </div>
    </section>

    <!-- Reviews Preview -->
    <section class="home__section">
      <div class="home__container">
        <div class="home__section-header">
          <span class="home__badge">Отзывы</span>
          <h2>Что говорят клиенты</h2>
        </div>
        <div class="home__reviews-grid">
          <ReviewCard v-for="r in activeReviews.slice(0, 3)" :key="r.id" :review="r" />
        </div>
        <div class="home__section-action">
          <AppButton variant="secondary" @click="router.push('/reviews')">Все отзывы</AppButton>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="home__section home__section--cta">
      <div class="home__container">
        <div class="home__cta">
          <h2>Запишитесь прямо сейчас</h2>
          <p>Оставьте заявку и мы подберём удобное время</p>
          <AppButton size="lg" @click="router.push('/booking')">Записаться онлайн</AppButton>
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
