<script setup lang="ts">
import { formatRuPhone } from '@/utils/phone'

withDefaults(defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  error?: string
}>(), {
  placeholder: '+7 (___) ___-__-__',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  const formatted = formatRuPhone(target.value)
  target.value = formatted
  emit('update:modelValue', formatted)
}
</script>

<template>
  <div class="app-input" :class="{ 'app-input--error': !!error }">
    <label v-if="label" class="app-input__label">{{ label }}</label>
    <input
      :value="modelValue"
      type="tel"
      inputmode="tel"
      autocomplete="tel"
      :placeholder="placeholder"
      class="app-input__field"
      @input="onInput"
    />
    <span v-if="error" class="app-input__error">{{ error }}</span>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.app-input {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__label {
    font-size: 14px;
    font-weight: 500;
    color: $color-text;
  }

  &__field {
    @include input-base;
  }

  &__error {
    font-size: 13px;
    color: $color-error;
  }

  &--error &__field {
    border-color: $color-error;
    &:focus {
      box-shadow: 0 0 0 3px rgba($color-error, 0.1);
    }
  }
}
</style>
