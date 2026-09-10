<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PriceCard from '@/components/PriceCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSkeleton from '@/components/ui/AppSkeleton.vue'
import { useFeatured } from '@/composables/useFeatured'

const router = useRouter()
const { cloud, loading, services, ensureLoaded } = useFeatured()

const grouped = computed(() => {
  const cats = Array.from(new Set(services.value.map((s) => s.category)))
  return cats.map((cat) => ({
    category: cat,
    services: services.value.filter((s) => s.category === cat),
  }))
})

onMounted(ensureLoaded)
</script>

<template>
  <div class="prices-page">
    <div class="prices-page__inner">
      <div class="prices-page__header">
        <span class="prices-page__badge">Прайс</span>
        <h1>Цены на услуги</h1>
        <p>Прозрачные цены без скрытых доплат</p>
      </div>
      <div v-if="cloud && loading" class="prices-page__sections">
        <AppSkeleton v-for="i in 4" :key="i" height="76px" radius="16px" />
      </div>
      <div v-else-if="grouped.length === 0" class="prices-page__empty">
        <p>Услуги скоро появятся. Загляните позже.</p>
      </div>
      <div v-else class="prices-page__sections">
        <div v-for="group in grouped" :key="group.category" class="prices-page__group">
          <h2 class="prices-page__group-title">{{ group.category }}</h2>
          <div class="prices-page__list">
            <PriceCard v-for="s in group.services" :key="s.id" :service="s" />
          </div>
        </div>
      </div>
      <div class="prices-page__cta">
        <p>Остались вопросы? Свяжитесь с нами</p>
        <AppButton @click="router.push('/booking')">Записаться</AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.prices-page {
  @include section;

  &__inner {
    @include container;
    max-width: 720px;
  }

  &__header {
    text-align: center;
    margin-bottom: 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    p { max-width: 480px; }
  }

  &__badge {
    display: inline-flex;
    padding: 6px 14px;
    background: $color-primary-light;
    color: $color-primary;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 600;
  }

  &__sections {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  &__group-title {
    font-size: 18px;
    margin-bottom: 12px;
    color: $color-text-secondary;
  }

  &__list {
    display: flex;
    flex-direction: column;
  }

  &__empty {
    text-align: center;
    padding: 60px 0;
    color: $color-text-tertiary;
  }

  &__cta {
    text-align: center;
    margin-top: 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    p {
      color: $color-text-secondary;
    }
  }
}
</style>
