<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import { business as featuredConfig } from '@/config/business'
import { isSupabaseEnabled } from '@/services/supabase'
import type { Business } from '@/types'

const router = useRouter()
const cloud = isSupabaseEnabled()

const biz = ref<Business | null>(null)

const phone = computed(() => (cloud ? (biz.value?.phone ?? '') : '+7 (999) 123-45-67'))
const email = computed(() => (cloud ? (biz.value?.email ?? '') : 'hello@didinails.ru'))
const address = computed(() => {
  if (!cloud) return 'г. Москва, ул. Тверская, д. 15'
  const parts = [biz.value?.city, biz.value?.address].filter(Boolean)
  return parts.join(', ')
})

onMounted(async () => {
  if (!cloud) return
  try {
    const { getBusinessBySlug } = await import('@/services/repositories/businesses')
    biz.value = await getBusinessBySlug(featuredConfig.featuredSlug)
  } catch {
    // Показываем демо-контакты.
  }
})

function telHref(value: string): string {
  return `tel:${value.replace(/[^+\d]/g, '')}`
}
</script>

<template>
  <div class="contacts-page">
    <div class="contacts-page__inner">
      <div class="contacts-page__header">
        <span class="contacts-page__badge">Контакты</span>
        <h1>Свяжитесь с нами</h1>
        <p>Всегда на связи и готовы ответить на ваши вопросы</p>
      </div>
      <div class="contacts-page__grid">
        <div class="contacts-page__info">
          <div v-if="address" class="contacts-page__item">
            <div class="contacts-page__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div>
              <p class="contacts-page__label">Адрес</p>
              <p class="contacts-page__value">{{ address }}</p>
            </div>
          </div>
          <div v-if="phone" class="contacts-page__item">
            <div class="contacts-page__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div>
              <p class="contacts-page__label">Телефон</p>
              <a :href="telHref(phone)" class="contacts-page__value contacts-page__value--link">{{ phone }}</a>
            </div>
          </div>
          <div v-if="email" class="contacts-page__item">
            <div class="contacts-page__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <p class="contacts-page__label">Email</p>
              <a :href="`mailto:${email}`" class="contacts-page__value contacts-page__value--link">{{ email }}</a>
            </div>
          </div>
          <div class="contacts-page__item">
            <div class="contacts-page__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <p class="contacts-page__label">Режим работы</p>
              <p class="contacts-page__value">Пн-Сб: 9:00 — 21:00<br />Вс: Выходной</p>
            </div>
          </div>
        </div>
        <div class="contacts-page__action">
          <h3>Запишитесь онлайн</h3>
          <p>Выберите удобное время и мы вас запишем</p>
          <AppButton size="lg" @click="router.push('/booking')">Записаться</AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.contacts-page {
  @include section;

  &__inner {
    @include container;
    max-width: 720px;
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

  &__grid {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  &__icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $color-primary-light;
    border-radius: $radius-sm;
    color: $color-primary;
    flex-shrink: 0;
  }

  &__label {
    font-size: 13px;
    color: $color-text-tertiary;
    margin-bottom: 2px;
  }

  &__value {
    font-size: 15px;
    color: $color-text;

    &--link {
      color: $color-primary;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }
  }

  &__action {
    text-align: center;
    padding: 40px;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    p { max-width: 320px; }
  }
}
</style>
