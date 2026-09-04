<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import { business } from '@/config/business'

const router = useRouter()

const steps = [
  {
    n: '1',
    title: 'Зарегистрируйтесь',
    text: 'Email и пароль — минута. Подтверждение почты не тормозит: онбординг ждёт вас сразу после входа.',
  },
  {
    n: '2',
    title: 'Создайте студию',
    text: 'Название, адрес страницы (slug), город и часовой пояс. Страница появится мгновенно.',
  },
  {
    n: '3',
    title: 'Делитесь ссылкой',
    text: 'Клиенты открывают вашу страницу, выбирают услугу и время — записи падают вам в кабинет.',
  },
]
</script>

<template>
  <div class="masters">
    <section class="masters__hero">
      <div class="masters__hero-inner">
        <span class="masters__badge">Для мастеров</span>
        <h1>Ваша страница записи за 5 минут</h1>
        <p>
          BeautyBooking — простая онлайн-запись для частных мастеров.
          Услуги, цены, работы, отзывы и свободные окна — на одной странице,
          которой можно делиться в соцсетях.
        </p>
        <div class="masters__actions">
          <AppButton size="lg" @click="router.push('/register')">Создать свою страницу</AppButton>
          <AppButton size="lg" variant="secondary" @click="router.push(`/${business.featuredSlug}`)">
            Смотреть пример
          </AppButton>
        </div>
      </div>
    </section>

    <section class="masters__section">
      <div class="masters__container">
        <div class="masters__steps">
          <div v-for="s in steps" :key="s.n" class="masters__step">
            <span class="masters__step-num">{{ s.n }}</span>
            <h3>{{ s.title }}</h3>
            <p>{{ s.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="masters__section masters__section--alt">
      <div class="masters__container">
        <div class="masters__cta">
          <h2>Начните бесплатно</h2>
          <p>Базовая страница и онлайн-запись — бесплатно. Платные тарифы появятся позже, текущих пользователей это не коснётся внезапно.</p>
          <AppButton size="lg" @click="router.push('/register')">Зарегистрироваться</AppButton>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.masters {
  &__hero {
    @include section;
    background: $color-surface;
  }

  &__hero-inner {
    @include container;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
    max-width: 720px;
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

  &__actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 8px;
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

  &__steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    @include tablet { grid-template-columns: 1fr; }
  }

  &__step {
    @include card;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__step-num {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    @include flex-center;
    font-weight: 700;
    color: $color-primary;
    background: $color-primary-light;
  }

  &__cta {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 40px 0;

    p { max-width: 480px; }
  }
}
</style>
