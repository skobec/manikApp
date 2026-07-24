<script setup lang="ts">
defineProps<{
  open: boolean
  title?: string
  maxWidth?: string
}>()

const emit = defineEmits<{
  close: []
}>()

function onBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('app-modal__backdrop')) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="app-modal__backdrop" @click="onBackdropClick">
        <div class="app-modal__content" :style="{ maxWidth: maxWidth || '480px' }">
          <div class="app-modal__header">
            <h3 v-if="title" class="app-modal__title">{{ title }}</h3>
            <button class="app-modal__close" @click="emit('close')" aria-label="Закрыть">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="app-modal__body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.app-modal {
  &__backdrop {
    position: fixed;
    inset: 0;
    background: $color-overlay;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 24px;
  }

  &__content {
    background: $color-surface;
    border-radius: $radius-lg;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: $shadow-xl;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 0;
  }

  &__title {
    font-size: 18px;
  }

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: $color-text-secondary;
    cursor: pointer;
    transition: all $transition-fast;
    &:hover {
      background: $color-bg;
      color: $color-text;
    }
  }

  &__body {
    padding: 20px 24px 24px;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
  .app-modal__content {
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  .app-modal__content {
    transform: scale(0.95) translateY(10px);
    opacity: 0;
  }
}
</style>
