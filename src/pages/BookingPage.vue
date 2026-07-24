<script setup lang="ts">
import BookingForm from '@/components/BookingForm.vue'
</script>

<template>
  <div class="booking-page">
    <div class="booking-page__inner">
      <BookingForm />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.booking-page {
  @include section;
  min-height: calc(100vh - $nav-height - 200px);

  &__inner {
    @include container;
  }
}
</style>
