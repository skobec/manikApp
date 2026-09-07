<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')

function target(): string {
  return (route.query.redirect as string) || '/admin'
}

onMounted(() => {
  if (auth.initialized && auth.user) router.replace(target())
})

async function submit() {
  emailError.value = ''
  passwordError.value = ''
  if (!email.value.includes('@')) {
    emailError.value = 'Введите корректный email.'
    return
  }
  if (!password.value) {
    passwordError.value = 'Введите пароль.'
    return
  }
  const res = await auth.signIn(email.value.trim(), password.value)
  if (res.ok) router.replace(target())
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-page__card">
      <h1>Вход для мастера</h1>
      <p class="auth-page__sub">Войдите, чтобы управлять записями и расписанием.</p>

      <p v-if="!auth.backendEnabled" class="auth-page__warn">
        Бэкенд не подключён: задайте Supabase-ключи в .env.local (см. docs/supabase-setup.md).
      </p>

      <form class="auth-page__form" @submit.prevent="submit">
        <AppInput v-model="email" label="Email" type="email" placeholder="you@example.com" :error="emailError" />
        <AppInput v-model="password" label="Пароль" type="password" placeholder="••••••••" :error="passwordError" />
        <p v-if="auth.error" class="auth-page__error">{{ auth.error }}</p>
        <AppButton type="submit" block :loading="auth.loading">Войти</AppButton>
      </form>

      <p class="auth-page__alt">
        Вход только для владельца студии.<br />
        Первый вход? <router-link to="/register">Создать аккаунт владельца</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.auth-page {
  @include section;
  display: flex;
  justify-content: center;

  &__card {
    @include card;
    width: 100%;
    max-width: 420px;
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    h1 { font-size: 24px; }
  }

  &__sub { font-size: 14px; }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 8px;
  }

  &__error {
    font-size: 14px;
    color: $color-error;
  }

  &__warn {
    font-size: 13px;
    color: #b45309;
    background: #fef3c7;
    border-radius: $radius-sm;
    padding: 10px 12px;
  }

  &__alt {
    font-size: 14px;
    text-align: center;

    a { color: $color-primary; font-weight: 500; }
  }
}
</style>
