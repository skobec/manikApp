<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBookings } from '@/composables/useBookings'
import { useAdminScope } from '@/composables/useAdminScope'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/utils/helpers'

const { bookings, cloudError, updateStatus, remove: removeBooking, useCloudScope } = useBookings()
const { show } = useToast()

useAdminScope([useCloudScope])

const filter = ref<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all')

const filtered = computed(() => {
  if (filter.value === 'all') return bookings.value
  return bookings.value.filter((b) => b.status === filter.value)
})

const confirmModal = ref<{ open: boolean; bookingId: string }>({ open: false, bookingId: '' })

async function confirmBooking(id: string) {
  try {
    await updateStatus(id, 'confirmed')
    show('Запись подтверждена', 'success')
  } catch {
    show(cloudError.value || 'Не получилось обновить запись', 'error')
  }
}

async function cancelBooking(id: string) {
  try {
    await updateStatus(id, 'cancelled')
    show('Запись отменена', 'error')
  } catch {
    show(cloudError.value || 'Не получилось обновить запись', 'error')
  }
}

async function deleteBooking(id: string) {
  try {
    await removeBooking(id)
    confirmModal.value = { open: false, bookingId: '' }
    show('Запись удалена', 'info')
  } catch {
    show(cloudError.value || 'Не получилось удалить запись', 'error')
  }
}

function openDeleteConfirm(id: string) {
  confirmModal.value = { open: true, bookingId: id }
}

function statusLabel(status: string) {
  switch (status) {
    case 'pending': return 'Новая'
    case 'confirmed': return 'Подтверждена'
    case 'completed': return 'Завершена'
    case 'cancelled': return 'Отменена'
    default: return status
  }
}

function statusClass(status: string) {
  switch (status) {
    case 'pending': return 'admin-bookings__status--pending'
    case 'confirmed': return 'admin-bookings__status--confirmed'
    case 'completed': return 'admin-bookings__status--completed'
    case 'cancelled': return 'admin-bookings__status--cancelled'
    default: return ''
  }
}
</script>

<template>
  <div class="admin-bookings">
    <div class="admin-bookings__filters">
      <button :class="['admin-bookings__filter', { 'admin-bookings__filter--active': filter === 'all' }]" @click="filter = 'all'">Все</button>
      <button :class="['admin-bookings__filter', { 'admin-bookings__filter--active': filter === 'pending' }]" @click="filter = 'pending'">Новые</button>
      <button :class="['admin-bookings__filter', { 'admin-bookings__filter--active': filter === 'confirmed' }]" @click="filter = 'confirmed'">Подтверждённые</button>
      <button :class="['admin-bookings__filter', { 'admin-bookings__filter--active': filter === 'completed' }]" @click="filter = 'completed'">Завершённые</button>
      <button :class="['admin-bookings__filter', { 'admin-bookings__filter--active': filter === 'cancelled' }]" @click="filter = 'cancelled'">Отменённые</button>
    </div>

    <div v-if="filtered.length === 0" class="admin-bookings__empty">
      <p>Нет записей</p>
    </div>

    <div v-else class="admin-bookings__list">
      <div v-for="b in filtered" :key="b.id" class="admin-bookings__item">
        <div class="admin-bookings__item-main">
          <div class="admin-bookings__item-top">
            <strong>{{ b.name }}</strong>
            <span :class="['admin-bookings__status', statusClass(b.status)]">{{ statusLabel(b.status) }}</span>
          </div>
          <p class="admin-bookings__item-service">{{ b.serviceName }}</p>
          <p class="admin-bookings__item-meta">{{ b.date }} в {{ b.time }} · {{ b.phone }}</p>
          <p v-if="b.comment" class="admin-bookings__item-comment">{{ b.comment }}</p>
          <p class="admin-bookings__item-created">Создано: {{ formatDate(b.createdAt) }}</p>
        </div>
        <div class="admin-bookings__item-actions">
          <AppButton v-if="b.status === 'pending'" size="sm" @click="confirmBooking(b.id)">Подтвердить</AppButton>
          <AppButton v-if="b.status !== 'cancelled'" size="sm" variant="ghost" @click="cancelBooking(b.id)">Отменить</AppButton>
          <AppButton size="sm" variant="danger" @click="openDeleteConfirm(b.id)">Удалить</AppButton>
        </div>
      </div>
    </div>

    <AppModal :open="confirmModal.open" title="Подтверждение" @close="confirmModal.open = false">
      <p>Вы уверены, что хотите удалить запись?</p>
      <div style="display:flex; gap: 12px; margin-top: 20px; justify-content: flex-end;">
        <AppButton variant="secondary" @click="confirmModal.open = false">Отмена</AppButton>
        <AppButton variant="danger" @click="deleteBooking(confirmModal.bookingId)">Удалить</AppButton>
      </div>
    </AppModal>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.admin-bookings {
  &__filters {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  &__filter {
    padding: 8px 16px;
    border: 1px solid $color-border;
    border-radius: 100px;
    background: transparent;
    font-size: 13px;
    font-weight: 500;
    color: $color-text-secondary;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover { border-color: $color-text; color: $color-text; }
    &--active { background: $color-text; border-color: $color-text; color: white; }
  }

  &__empty {
    text-align: center;
    padding: 60px 0;
    color: $color-text-tertiary;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__item {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 20px;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-sm;

    @include mobile {
      flex-direction: column;
    }
  }

  &__item-main {
    flex: 1;
    min-width: 0;
  }

  &__item-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  &__item-service {
    font-size: 14px;
    color: $color-text-secondary;
  }

  &__item-meta {
    font-size: 13px;
    color: $color-text-tertiary;
    margin-top: 2px;
  }

  &__item-comment {
    font-size: 13px;
    color: $color-text-secondary;
    margin-top: 8px;
    padding: 8px 12px;
    background: $color-bg;
    border-radius: $radius-sm;
  }

  &__item-created {
    font-size: 12px;
    color: $color-text-tertiary;
    margin-top: 6px;
  }

  &__item-actions {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    flex-shrink: 0;

    @include mobile {
      flex-wrap: wrap;
    }
  }

  &__status {
    padding: 2px 8px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;

    &--pending { background: #FEF3C7; color: #D97706; }
    &--confirmed { background: #D1FAE5; color: #059669; }
    &--completed { background: #DBEAFE; color: #2563EB; }
    &--cancelled { background: #FEE2E2; color: #DC2626; }
  }
}
</style>
