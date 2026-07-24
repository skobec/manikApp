<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  type?: string
  error?: string
  multiline?: boolean
  rows?: number
}>(), {
  type: 'text',
  multiline: false,
  rows: 3,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(e: Event) {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="app-input" :class="{ 'app-input--error': !!error }">
    <label v-if="label" class="app-input__label">{{ label }}</label>
    <textarea
      v-if="multiline"
      :value="modelValue"
      @input="onInput"
      :placeholder="placeholder"
      :rows="rows"
      class="app-input__field"
    />
    <input
      v-else
      :value="modelValue"
      @input="onInput"
      :type="type"
      :placeholder="placeholder"
      class="app-input__field"
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

  :deep(textarea) {
    resize: vertical;
    min-height: 80px;
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
