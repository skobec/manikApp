<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__grid">
        <div class="footer__col">
          <h4 class="footer__title">Nail Studio</h4>
          <p class="footer__text">Профессиональный маникюр и педикюр. Работаем с душой и любим своё дело.</p>
        </div>
        <div class="footer__col">
          <h4 class="footer__title">Навигация</h4>
          <router-link to="/" class="footer__link">Главная</router-link>
          <router-link to="/gallery" class="footer__link">Работы</router-link>
          <router-link to="/prices" class="footer__link">Цены</router-link>
          <router-link to="/reviews" class="footer__link">Отзывы</router-link>
          <router-link to="/contacts" class="footer__link">Контакты</router-link>
        </div>
        <div class="footer__col">
          <h4 class="footer__title">Контакты</h4>
          <a href="tel:+79991234567" class="footer__link">+7 (999) 123-45-67</a>
          <a href="mailto:hello@nailstudio.ru" class="footer__link">hello@nailstudio.ru</a>
          <a href="https://instagram.com" target="_blank" class="footer__link">Instagram</a>
          <a href="https://t.me" target="_blank" class="footer__link">Telegram</a>
        </div>
      </div>
      <div class="footer__bottom">
        <p class="footer__copyright">&copy; {{ year }} Nail Studio. Все права защищены.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.footer {
  border-top: 1px solid $color-border;
  background: $color-surface;
  margin-top: auto;

  &__inner {
    @include container;
    padding-top: 60px;
    padding-bottom: 32px;
  }

  &__grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 48px;

    @include mobile {
      grid-template-columns: 1fr;
      gap: 32px;
    }
  }

  &__col {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__title {
    font-size: 16px;
    margin-bottom: 4px;
  }

  &__text {
    font-size: 14px;
    color: $color-text-secondary;
    line-height: 1.6;
  }

  &__link {
    font-size: 14px;
    color: $color-text-secondary;
    text-decoration: none;
    transition: color $transition-fast;
    width: fit-content;

    &:hover {
      color: $color-text;
    }
  }

  &__bottom {
    margin-top: 48px;
    padding-top: 24px;
    border-top: 1px solid $color-border;
  }

  &__copyright {
    font-size: 13px;
    color: $color-text-tertiary;
  }
}
</style>
