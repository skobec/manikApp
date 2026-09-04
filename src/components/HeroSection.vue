<script setup lang="ts">
import { useRouter } from 'vue-router'
import { business } from '@/config/business'

const router = useRouter()
</script>

<template>
  <section class="hero">
    <div class="hero__inner">
      <div class="hero__content">
        <p class="hero__badge">Мастер маникюра</p>
        <h1 class="hero__title">
          Красота<br />
          <span class="hero__accent">в твоих руках</span>
        </h1>
        <p class="hero__subtitle">
          Профессиональный маникюр и педикюр в уютной студии. Индивидуальный подход, качественные материалы и безупречный результат.
        </p>
        <div class="hero__actions">
          <button class="hero__btn-primary" @click="router.push(`/${business.featuredSlug}/booking`)">Записаться онлайн</button>
          <button class="hero__btn-secondary" @click="router.push(`/${business.featuredSlug}`)">Смотреть работы</button>
        </div>
      </div>
      <div class="hero__visual">
        <div class="hero__circle" />
        <div class="hero__card">
          <div class="hero__card-dot" />
          <div class="hero__card-lines">
            <span /><span /><span />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.hero {
  @include section;
  min-height: calc(100vh - $nav-height);
  display: flex;
  align-items: center;
  overflow: hidden;

  &__inner {
    @include container;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;

    @include tablet {
      grid-template-columns: 1fr;
      gap: 48px;
      text-align: center;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    background: $color-primary-light;
    color: $color-primary;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 600;
    width: fit-content;

    @include tablet {
      margin: 0 auto;
    }
  }

  &__title {
    font-size: 56px;
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.03em;

    @include mobile {
      font-size: 40px;
    }
  }

  &__accent {
    color: $color-primary;
  }

  &__subtitle {
    font-size: 18px;
    color: $color-text-secondary;
    max-width: 480px;
    line-height: 1.7;

    @include tablet {
      margin: 0 auto;
    }
  }

  &__actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;

    @include tablet {
      justify-content: center;
    }

    @include mobile {
      flex-direction: column;
    }
  }

  &__btn-primary {
    @include button-primary;
    padding: 16px 32px;
    font-size: 16px;
  }

  &__btn-secondary {
    @include button-secondary;
    padding: 16px 32px;
    font-size: 16px;
  }

  &__visual {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    @include tablet {
      display: none;
    }
  }

  &__circle {
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: linear-gradient(135deg, $color-primary-light 0%, $color-primary 100%);
    opacity: 0.3;
    animation: pulse 4s ease-in-out infinite;
  }

  &__card {
    position: absolute;
    width: 200px;
    height: 260px;
    background: $color-surface;
    border-radius: $radius-xl;
    box-shadow: $shadow-xl;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    animation: float 6s ease-in-out infinite;
  }

  &__card-dot {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, $color-primary-light, $color-primary);
  }

  &__card-lines {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;

    span {
      display: block;
      height: 4px;
      border-radius: 2px;
      background: $color-border;

      &:nth-child(1) { width: 80px; }
      &:nth-child(2) { width: 60px; }
      &:nth-child(3) { width: 40px; }
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.05); opacity: 0.5; }
}
</style>
