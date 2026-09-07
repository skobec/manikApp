<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBookings } from '@/composables/useBookings'
import { useServices } from '@/composables/useServices'
import { useTimeSlots } from '@/composables/useTimeSlots'
import { useAdminScope } from '@/composables/useAdminScope'
import { useAuthStore } from '@/stores/authStore'
import { isSupabaseEnabled } from '@/services/supabase'
import { createAppointment } from '@/services/repositories/bookings'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppPhoneInput from '@/components/ui/AppPhoneInput.vue'
import { useToast } from '@/composables/useToast'
import { formatDate, getToday } from '@/utils/helpers'
import { isValidRuPhone } from '@/utils/phone'
import { ruError } from '@/utils/errors'

const { bookings, cloudError, create, updateStatus, remove: removeBooking, useCloudScope, reload } = useBookings()
const { services, useCloudScope: servicesScope } = useServices()
const { getSlotsForDate, useCloudScope: slotsScope } = useTimeSlots()
const auth = useAuthStore()
const { show } = useToast()

useAdminScope([useCloudScope, servicesScope, slotsScope])

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

async function completeBooking(id: string) {
  try {
    await updateStatus(id, 'completed')
    show('Запись завершена', 'success')
  } catch {
    show(cloudError.value || 'Не получилось обновить запись', 'error')
  }
}

// --- Ручное создание записи мастером ---
const showCreate = ref(false)
const form = ref({
  serviceId: '',
  date: getToday(),
  time: '',
  name: '',
  phone: '',
  comment: '',
})

const serviceOptions = computed(() =>
  services.value
    .filter((s) => s.active)
    .map((s) => ({ value: s.id, label: `${s.name} · ${s.duration} мин` })),
)

const freeTimes = computed(() => {
  if (!form.value.date) return []
  const booked = bookings.value
    .filter((b) => b.date === form.value.date && b.status !== 'cancelled')
    .map((b) => b.time)
  return getSlotsForDate(form.value.date, booked).filter((s) => s.available)
})

function openCreate() {
  form.value = { serviceId: '', date: getToday(), time: '', name: '', phone: '', comment: '' }
  showCreate.value = true
}

async function saveBooking() {
  const service = services.value.find((s) => s.id === form.value.serviceId)
  if (!service) {
    show('Выберите услугу', 'error')
    return
  }
  if (!form.value.date || !form.value.time) {
    show('Выберите дату и время', 'error')
    return
  }
  if (!form.value.name.trim()) {
    show('Введите имя клиента', 'error')
    return
  }
  if (!isValidRuPhone(form.value.phone)) {
    show('Введите номер полностью: +7 (___) ___-__-__', 'error')
    return
  }
  // Cloud: запись создаётся владельцем (RLS owner), клиент находится/создаётся.
  if (isSupabaseEnabled() && auth.business) {
    try {
      await createAppointment(auth.business.id, {
        serviceId: service.id,
        date: form.value.date,
        time: form.value.time,
        durationMinutes: service.duration,
        timezone: auth.business.timezone,
        name: form.value.name.trim(),
        phone: form.value.phone,
        comment: form.value.comment.trim(),
      })
      await reload()
      showCreate.value = false
      show('Запись создана', 'success')
    } catch (e) {
      show(ruError(e instanceof Error ? e.message : ''), 'error')
    }
    return
  }
  // Local: обычная заявка со статусом pending, мастер её видит сразу.
  create({
    serviceId: service.id,
    serviceName: service.name,
    date: form.value.date,
    time: form.value.time,
    name: form.value.name.trim(),
    phone: form.value.phone,
    comment: form.value.comment.trim(),
  })
  showCreate.value = false
  show('Запись создана', 'success')
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
    <div class="admin-bookings__top">
      <p class="admin-bookings__count">{{ filtered.length }} записей</p>
      <AppButton @click="openCreate">Новая запись</AppButton>
    </div>
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
          <AppButton v-if="b.status === 'confirmed'" size="sm" variant="secondary" @click="completeBooking(b.id)">Завершить</AppButton>
          <AppButton v-if="b.status !== 'cancelled' && b.status !== 'completed'" size="sm" variant="ghost" @click="cancelBooking(b.id)">Отменить</AppButton>
          <AppButton size="sm" variant="danger" @click="openDeleteConfirm(b.id)">Удалить</AppButton>
        </div>
      </div>
    </div>

    <AppModal :open="showCreate" title="Новая запись" max-width="520px" @close="showCreate = false">
      <div style="display:flex; flex-direction:column; gap:16px;">
        <AppSelect v-model="form.serviceId" label="Услуга" :options="serviceOptions" placeholder="Выберите услугу" />
        <AppInput v-model="form.date" label="Дата" type="date" />
        <div v-if="form.date">
          <p style="font-size:14px; font-weight:500; margin-bottom:8px;">Время</p>
          <div class="admin-bookings__times">
            <button
              v-for="s in freeTimes"
              :key="s.time"
              :class="['admin-bookings__time', { 'admin-bookings__time--active': form.time === s.time }]"
              @click="form.time = s.time"
            >
              {{ s.time }}
            </button>
          </div>
          <p v-if="freeTimes.length === 0" style="font-size:13px; color:#9CA3AF;">Нет свободного времени на эту дату</p>
        </div>
        <AppInput v-model="form.name" label="Имя клиента" placeholder="Как зовут" />
        <AppPhoneInput v-model="form.phone" label="Телефон" />
        <AppInput v-model="form.comment" label="Комментарий" placeholder="Необязательно" multiline />
        <div style="display:flex; gap: 12px; justify-content:flex-end; margin-top:8px;">
          <AppButton variant="secondary" @click="showCreate = false">Отмена</AppButton>
          <AppButton @click="saveBooking">Создать</AppButton>
        </div>
      </div>
    </AppModal>

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
  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__count {
    font-size: 14px;
    color: $color-text-secondary;
  }

  &__times {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
    gap: 8px;
  }

  &__time {
    padding: 8px;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    background: transparent;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover { border-color: $color-text; }
    &--active { background: $color-text; border-color: $color-text; color: white; }
  }

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
