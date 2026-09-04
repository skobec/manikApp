<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Такой страницы нет. Возможно, адрес студии изменился.</p>
    <AppButton @click="router.push('/')">На главную</AppButton>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.not-found {
  @include container;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;

  h1 {
    font-size: 72px;
    font-weight: 700;
    letter-spacing: -0.04em;
  }
}
</style>
