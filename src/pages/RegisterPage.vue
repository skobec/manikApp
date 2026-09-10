<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import { useAuthStore } from '@/stores/authStore'
import { backendHint } from '@/services/supabase'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')
const checkInbox = ref(false)

async function submit() {
  emailError.value = ''
  passwordError.value = ''
  if (!email.value.includes('@')) {
    emailError.value = 'Введите корректный email.'
    return
  }
  if (password.value.length < 6) {
    passwordError.value = 'Минимум 6 символов.'
    return
  }
  const res = await auth.signUp(email.value.trim(), password.value)
  if (!res.ok) return
  if (res.needsConfirmation) {
    checkInbox.value = true
    return
  }
  router.replace(auth.business ? '/admin' : '/onboarding')
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-page__card">
      <template v-if="!checkInbox">
        <h1>Регистрация мастера</h1>
        <p class="auth-page__sub">Аккаунт + страница студии создаются автоматически, ничего настраивать вручную не нужно.</p>

        <p v-if="!auth.backendEnabled" class="auth-page__warn">
          {{ backendHint() }}
        </p>

        <form class="auth-page__form" @submit.prevent="submit">
          <AppInput v-model="email" label="Email" type="email" placeholder="you@example.com" :error="emailError" />
          <AppInput v-model="password" label="Пароль" type="password" placeholder="Минимум 6 символов" :error="passwordError" />
          <p v-if="auth.error" class="auth-page__error">{{ auth.error }}</p>
          <AppButton type="submit" block :loading="auth.loading">Создать аккаунт</AppButton>
        </form>

        <p class="auth-page__alt">
          Уже есть аккаунт? <router-link to="/login">Войти</router-link>
        </p>
      </template>

      <template v-else>
        <h1>Проверьте почту ✉️</h1>
        <p class="auth-page__sub">
          Мы отправили письмо на <strong>{{ email }}</strong>. Перейдите по ссылке из письма,
          затем войдите — и мы сразу создадим страницу вашей студии.
        </p>
        <AppButton block @click="router.push('/login')">Я подтвердил — войти</AppButton>
      </template>
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
