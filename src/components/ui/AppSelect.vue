<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: string
  label?: string
  options: { value: string; label: string }[]
  placeholder?: string
}>(), {
  placeholder: 'Выберите...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onChange(e: Event) {
  const target = e.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="app-select">
    <label v-if="label" class="app-select__label">{{ label }}</label>
    <div class="app-select__wrapper">
      <select :value="modelValue" @change="onChange" class="app-select__field">
        <option value="" disabled>{{ placeholder }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <svg class="app-select__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.app-select {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__label {
    font-size: 14px;
    font-weight: 500;
    color: $color-text;
  }

  &__wrapper {
    position: relative;
  }

  &__field {
    @include input-base;
    appearance: none;
    padding-right: 40px;
    cursor: pointer;
  }

  &__arrow {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: $color-text-secondary;
  }
}
</style>
