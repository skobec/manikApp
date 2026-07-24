<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  as?: string
}>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
  as: 'button',
})
</script>

<template>
  <component
    :is="as"
    :class="[
      'app-btn',
      `app-btn--${variant}`,
      `app-btn--${size}`,
      { 'app-btn--block': block, 'app-btn--loading': loading }
    ]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="app-btn__loader" />
    <slot />
  </component>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.app-btn {
  @include button-base;

  &--primary {
    background: $color-text;
    color: white;
    border-color: $color-text;
    &:hover:not(:disabled) {
      background: #3a3a5c;
      transform: translateY(-1px);
      box-shadow: $shadow-md;
    }
  }

  &--secondary {
    background: transparent;
    color: $color-text;
    border-color: $color-border;
    &:hover:not(:disabled) {
      border-color: $color-text;
      background: $color-bg;
    }
  }

  &--ghost {
    background: transparent;
    color: $color-text-secondary;
    border-color: transparent;
    &:hover:not(:disabled) {
      background: $color-bg;
      color: $color-text;
    }
  }

  &--danger {
    background: $color-error;
    color: white;
    border-color: $color-error;
    &:hover:not(:disabled) {
      background: #dc2626;
    }
  }

  &--sm { padding: 8px 16px; font-size: 13px; }
  &--md { padding: 12px 24px; font-size: 15px; }
  &--lg { padding: 16px 32px; font-size: 17px; }

  &--block { width: 100%; }

  &--loading { pointer-events: none; opacity: 0.8; }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__loader {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
