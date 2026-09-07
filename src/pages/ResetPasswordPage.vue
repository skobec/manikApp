<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import { supabase } from '@/services/supabase'

const router = useRouter()

const ready = ref(false)
const invalid = ref(false)
const password = ref('')
const passwordError = ref('')
const error = ref('')
const loading = ref(false)

let unsubscribe: (() => void) | null = null

onMounted(async () => {
  if (!supabase) {
    invalid.value = true
    return
  }
  // supabase-js сам разбирает ?code= / #access_token из URL при старте.
  const { data } = await supabase.auth.getSession()
  if (data.session) {
    ready.value = true
    return
  }
  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY' && session) {
      ready.value = true
    }
  })
  unsubscribe = () => listener.subscription.unsubscribe()
  // Если за 5 секунд сессия не появилась — ссылка битая/протухшая.
  setTimeout(() => {
    if (!ready.value) invalid.value = true
  }, 5000)
})

onUnmounted(() => {
  unsubscribe?.()
})

async function submit() {
  passwordError.value = ''
  error.value = ''
  if (password.value.length < 6) {
    passwordError.value = 'Минимум 6 символов.'
    return
  }
  if (!supabase) return
  loading.value = true
  try {
    const { error: err } = await supabase.auth.updateUser({ password: password.value })
    if (err) throw err
    router.replace('/admin')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не получилось обновить пароль.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-page__card">
      <template v-if="ready">
        <h1>Новый пароль</h1>
        <p class="auth-page__sub">Придумайте пароль для входа в админку.</p>
        <form class="auth-page__form" @submit.prevent="submit">
          <AppInput v-model="password" label="Новый пароль" type="password" placeholder="Минимум 6 символов" :error="passwordError" />
          <p v-if="error" class="auth-page__error">{{ error }}</p>
          <AppButton type="submit" block :loading="loading">Сохранить и войти</AppButton>
        </form>
      </template>
      <template v-else-if="invalid">
        <h1>Ссылка не подошла</h1>
        <p class="auth-page__sub">Возможно, она устарела или уже использована. Запросите новую.</p>
        <AppButton block @click="router.push('/forgot-password')">Запросить снова</AppButton>
      </template>
      <template v-else>
        <h1>Проверяем ссылку…</h1>
        <p class="auth-page__sub">Секунду, подтверждаем переход из письма.</p>
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
}
</style>
