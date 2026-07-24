<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const mobileOpen = ref(false)
const isScrolled = ref(false)

const links = [
  { to: '/', label: 'Главная' },
  { to: '/gallery', label: 'Работы' },
  { to: '/prices', label: 'Цены' },
  { to: '/reviews', label: 'Отзывы' },
  { to: '/contacts', label: 'Контакты' },
  { to: '/booking', label: 'Запись' },
]

watch(
  () => route.path,
  () => { mobileOpen.value = false }
)

onMounted(() => {
  const onScroll = () => { isScrolled.value = window.scrollY > 20 }
  window.addEventListener('scroll', onScroll, { passive: true })
})

function goBooking() {
  router.push('/booking')
}
</script>

<template>
  <header :class="['navbar', { 'navbar--scrolled': isScrolled }]">
    <div class="navbar__inner">
      <router-link to="/" class="navbar__logo">
        <span class="navbar__logo-text">Nail Studio</span>
      </router-link>

      <nav class="navbar__links">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="navbar__link"
          :class="{ 'navbar__link--active': route.path === link.to }"
        >
          {{ link.label }}
        </router-link>
      </nav>

      <div class="navbar__actions">
        <button class="navbar__book-btn" @click="goBooking">Записаться</button>
        <button class="navbar__burger" @click="mobileOpen = !mobileOpen" aria-label="Меню">
          <span class="navbar__burger-line" />
          <span class="navbar__burger-line" />
          <span class="navbar__burger-line" />
        </button>
      </div>
    </div>

    <Transition name="mobile-menu">
      <div v-if="mobileOpen" class="navbar__mobile">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="navbar__mobile-link"
          :class="{ 'navbar__mobile-link--active': route.path === link.to }"
        >
          {{ link.label }}
        </router-link>
      </div>
    </Transition>
  </header>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: $nav-height;
  transition: all $transition-base;

  &--scrolled {
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid $color-border;
  }

  &__inner {
    @include container;
    height: 100%;
    @include flex-between;
  }

  &__logo {
    text-decoration: none;
  }

  &__logo-text {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: $color-text;
  }

  &__links {
    display: flex;
    gap: 4px;

    @include mobile {
      display: none;
    }
  }

  &__link {
    padding: 8px 14px;
    border-radius: $radius-sm;
    font-size: 14px;
    font-weight: 500;
    color: $color-text-secondary;
    transition: all $transition-fast;
    text-decoration: none;

    &:hover {
      color: $color-text;
      background: rgba(0,0,0,0.04);
    }

    &--active {
      color: $color-text;
      background: rgba(0,0,0,0.04);
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__book-btn {
    @include button-primary;
    padding: 8px 18px;
    font-size: 13px;

    @include mobile {
      display: none;
    }
  }

  &__burger {
    display: none;
    width: 36px;
    height: 36px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    border: none;
    background: transparent;
    border-radius: 8px;
    cursor: pointer;

    @include mobile {
      display: flex;
    }

    &-line {
      display: block;
      width: 20px;
      height: 2px;
      background: $color-text;
      border-radius: 2px;
      transition: all $transition-fast;
    }
  }

  &__mobile {
    position: fixed;
    top: $nav-height;
    left: 0;
    right: 0;
    background: $color-surface;
    border-bottom: 1px solid $color-border;
    padding: 12px 24px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    box-shadow: $shadow-lg;
  }

  &__mobile-link {
    padding: 12px 16px;
    border-radius: $radius-sm;
    font-size: 16px;
    font-weight: 500;
    color: $color-text-secondary;
    text-decoration: none;
    transition: all $transition-fast;

    &:hover { background: $color-bg; color: $color-text; }
    &--active { color: $color-text; background: $color-bg; }
  }
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.25s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
