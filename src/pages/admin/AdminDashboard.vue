<script setup lang="ts">
import { useBookings } from '@/composables/useBookings'
import { useServices } from '@/composables/useServices'
import { useReviews } from '@/composables/useReviews'
import { useGallery } from '@/composables/useGallery'
import { useAdminScope } from '@/composables/useAdminScope'
import { computed } from 'vue'

const { bookings, useCloudScope: bookingsScope } = useBookings()
const { activeServices, useCloudScope: servicesScope } = useServices()
const { activeReviews, useCloudScope: reviewsScope } = useReviews()
const { items, useCloudScope: galleryScope } = useGallery()

useAdminScope([bookingsScope, servicesScope, reviewsScope, galleryScope])

const pendingBookings = computed(() => bookings.value.filter((b) => b.status === 'pending'))
const todayBookings = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return bookings.value.filter((b) => b.date === today)
})
</script>

<template>
  <div class="admin-dashboard">
    <div class="admin-dashboard__stats">
      <div class="admin-dashboard__stat">
        <span class="admin-dashboard__stat-value">{{ pendingBookings.length }}</span>
        <span class="admin-dashboard__stat-label">Новых записей</span>
      </div>
      <div class="admin-dashboard__stat">
        <span class="admin-dashboard__stat-value">{{ todayBookings.length }}</span>
        <span class="admin-dashboard__stat-label">Записей сегодня</span>
      </div>
      <div class="admin-dashboard__stat">
        <span class="admin-dashboard__stat-value">{{ activeServices.length }}</span>
        <span class="admin-dashboard__stat-label">Услуг</span>
      </div>
      <div class="admin-dashboard__stat">
        <span class="admin-dashboard__stat-value">{{ items.length }}</span>
        <span class="admin-dashboard__stat-label">Работ в портфолио</span>
      </div>
      <div class="admin-dashboard__stat">
        <span class="admin-dashboard__stat-value">{{ activeReviews.length }}</span>
        <span class="admin-dashboard__stat-label">Отзывов</span>
      </div>
      <div class="admin-dashboard__stat">
        <span class="admin-dashboard__stat-value">{{ bookings.length }}</span>
        <span class="admin-dashboard__stat-label">Всего записей</span>
      </div>
    </div>

    <div v-if="pendingBookings.length > 0" class="admin-dashboard__section">
      <h3>Новые записи</h3>
      <div class="admin-dashboard__pending-list">
        <div v-for="b in pendingBookings" :key="b.id" class="admin-dashboard__pending-item">
          <div>
            <strong>{{ b.name }}</strong> — {{ b.serviceName }}
            <div class="admin-dashboard__pending-meta">{{ b.date }} в {{ b.time }} · {{ b.phone }}</div>
          </div>
          <router-link to="/admin/bookings" class="admin-dashboard__pending-link">Перейти к записям</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.admin-dashboard {
  &__stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }

  &__stat {
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__stat-value {
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  &__stat-label {
    font-size: 13px;
    color: $color-text-secondary;
  }

  &__section {
    h3 {
      margin-bottom: 16px;
    }
  }

  &__pending-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__pending-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    font-size: 14px;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }

  &__pending-meta {
    font-size: 13px;
    color: $color-text-secondary;
    margin-top: 2px;
  }

  &__pending-link {
    color: $color-primary;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
}
</style>
