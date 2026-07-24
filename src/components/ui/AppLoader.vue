<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md',
})
</script>

<template>
  <div :class="['app-loader', `app-loader--${size}`]">
    <div class="app-loader__dot" />
    <div class="app-loader__dot" />
    <div class="app-loader__dot" />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.app-loader {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $color-text-tertiary;
    animation: bounce 0.6s infinite alternate;
  }

  &__dot:nth-child(2) { animation-delay: 0.15s; }
  &__dot:nth-child(3) { animation-delay: 0.3s; }

  &--sm { gap: 4px; .app-loader__dot { width: 6px; height: 6px; } }
  &--lg { gap: 8px; .app-loader__dot { width: 10px; height: 10px; } }
}

@keyframes bounce {
  from { transform: translateY(0); opacity: 0.4; }
  to { transform: translateY(-8px); opacity: 1; }
}
</style>
