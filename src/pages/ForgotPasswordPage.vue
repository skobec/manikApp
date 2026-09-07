<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import { supabase, isSupabaseEnabled } from '@/services/supabase'

const email = ref('')
const emailError = ref('')
const error = ref('')
const loading = ref(false)
const sent = ref(false)

async function submit() {
  emailError.value = ''
  error.value = ''
  if (!email.value.includes('@')) {
    emailError.value = 'Введите корректный email.'
    return
  }
  if (!supabase) {
    error.value = 'Бэкенд не подключён.'
    return
  }
  loading.value = true
  try {
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.value.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (err) throw err
    sent.value = true
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не получилось отправить письмо.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-page__card">
      <template v-if="!sent">
        <h1>Сброс пароля</h1>
        <p class="auth-page__sub">Пришлём письмо со ссылкой для установки нового пароля.</p>

        <p v-if="!isSupabaseEnabled()" class="auth-page__warn">Бэкенд не подключён.</p>

        <form class="auth-page__form" @submit.prevent="submit">
          <AppInput v-model="email" label="Email" type="email" placeholder="you@example.com" :error="emailError" />
          <p v-if="error" class="auth-page__error">{{ error }}</p>
          <AppButton type="submit" block :loading="loading">Отправить письмо</AppButton>
        </form>

        <p class="auth-page__alt">
          <router-link to="/login">Назад ко входу</router-link>
        </p>
      </template>

      <template v-else>
        <h1>Проверьте почту ✉️</h1>
        <p class="auth-page__sub">
          Отправили письмо на <strong>{{ email }}</strong>. Перейдите по ссылке из него
          и придумайте новый пароль.
        </p>
        <AppButton block @click="$router.push('/login')">Ко входу</AppButton>
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
