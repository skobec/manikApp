<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: string
    height?: string
    radius?: string
  }>(),
  {
    width: '100%',
    height: '16px',
    radius: '8px',
  },
)
</script>

<template>
  <div class="app-skeleton" :style="{ width, height, borderRadius: radius }" />
</template>

<style scoped lang="scss">
.app-skeleton {
  background: linear-gradient(90deg, #eeeeee 25%, #f7f7f7 50%, #eeeeee 75%);
  background-size: 200% 100%;
  animation: app-skeleton-shimmer 1.4s ease-in-out infinite;
}

@keyframes app-skeleton-shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}
</style>
