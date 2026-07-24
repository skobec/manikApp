<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="app-toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['app-toast', `app-toast--${toast.type}`]"
        >
          <span class="app-toast__message">{{ toast.message }}</span>
          <button class="app-toast__close" @click="remove(toast.id)">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 3L3 11M3 3L11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.app-toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 360px;
}

.app-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  box-shadow: $shadow-lg;
  font-size: 14px;

  &--success { border-left: 3px solid $color-success; }
  &--error { border-left: 3px solid $color-error; }
  &--info { border-left: 3px solid $color-primary; }

  &__message {
    flex: 1;
    color: $color-text;
  }

  &__close {
    display: flex;
    padding: 4px;
    border: none;
    background: transparent;
    color: $color-text-tertiary;
    cursor: pointer;
    border-radius: 4px;
    &:hover { color: $color-text; }
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
