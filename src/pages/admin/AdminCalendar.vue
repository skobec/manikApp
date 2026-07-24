<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTimeSlots } from '@/composables/useTimeSlots'
import { useBookings } from '@/composables/useBookings'
import { getDaysAround, getDayName, getMonthDay } from '@/utils/helpers'
import { useToast } from '@/composables/useToast'

const { getSlotsForDate, toggleBlocked } = useTimeSlots()
const { bookings: allBookings } = useBookings()
const { show } = useToast()

const selectedDate = ref(getDaysAround(1)[0])

const days = computed(() => getDaysAround(14))

const dayBookings = computed(() =>
  allBookings.value.filter((b) => b.date === selectedDate.value && b.status !== 'cancelled')
)

const bookedTimes = computed(() => dayBookings.value.map((b) => b.time))

const slots = computed(() => getSlotsForDate(selectedDate.value, bookedTimes.value))

function toggle(time: string) {
  toggleBlocked(selectedDate.value, time)
  show('Время обновлено', 'info')
}

function statusClass(status: string) {
  switch (status) {
    case 'pending': return 'admin-calendar__booking--pending'
    case 'confirmed': return 'admin-calendar__booking--confirmed'
    case 'cancelled': return 'admin-calendar__booking--cancelled'
    default: return ''
  }
}
</script>

<template>
  <div class="admin-calendar">
    <div class="admin-calendar__top">
      <h3>Управление временными слотами</h3>
    </div>

    <div class="admin-calendar__dates">
      <button
        v-for="day in days"
        :key="day"
        :class="['admin-calendar__date-btn', { 'admin-calendar__date-btn--active': selectedDate === day }]"
        @click="selectedDate = day"
      >
        <span class="admin-calendar__date-day">{{ getDayName(day) }}</span>
        <span class="admin-calendar__date-num">{{ getMonthDay(day) }}</span>
      </button>
    </div>

    <div class="admin-calendar__layout">
      <div class="admin-calendar__slots">
        <p class="admin-calendar__section-title">Доступность времени</p>
        <p class="admin-calendar__section-hint">Нажмите на слот, чтобы заблокировать/разблокировать</p>
        <div class="admin-calendar__slots-grid">
          <button
            v-for="slot in slots"
            :key="slot.time"
            :class="['admin-calendar__slot', {
              'admin-calendar__slot--unavailable': !slot.available,
              'admin-calendar__slot--booked': !slot.available && bookedTimes.includes(slot.time)
            }]"
            :disabled="bookedTimes.includes(slot.time)"
            @click="toggle(slot.time)"
          >
            <span class="admin-calendar__slot-time">{{ slot.time }}</span>
            <span class="admin-calendar__slot-status">
              {{ bookedTimes.includes(slot.time) ? 'Забронировано' : (slot.available ? 'Доступно' : 'Заблокировано') }}
            </span>
          </button>
        </div>
      </div>

      <div class="admin-calendar__bookings">
        <p class="admin-calendar__section-title">
          Записи на {{ getMonthDay(selectedDate) }}
        </p>
        <div v-if="dayBookings.length === 0" class="admin-calendar__no-bookings">
          <p>Нет записей на этот день</p>
        </div>
        <div v-else class="admin-calendar__bookings-list">
          <div v-for="b in dayBookings" :key="b.id" :class="['admin-calendar__booking', statusClass(b.status)]">
            <div class="admin-calendar__booking-time">{{ b.time }}</div>
            <div class="admin-calendar__booking-info">
              <strong>{{ b.name }}</strong>
              <span>{{ b.serviceName }}</span>
              <span class="admin-calendar__booking-phone">{{ b.phone }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.admin-calendar {
  &__top {
    margin-bottom: 24px;
    h3 { font-size: 16px; }
  }

  &__dates {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 12px;
    margin-bottom: 24px;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }

  &__date-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 14px;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    background: $color-surface;
    cursor: pointer;
    transition: all $transition-fast;
    white-space: nowrap;
    &:hover { border-color: $color-text; }
    &--active { background: $color-text; border-color: $color-text; color: white; }
  }

  &__date-day { font-size: 11px; font-weight: 500; text-transform: lowercase; }
  &__date-num { font-size: 13px; font-weight: 600; }

  &__layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    @include mobile { grid-template-columns: 1fr; }
  }

  &__section-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  &__section-hint {
    font-size: 12px;
    color: $color-text-tertiary;
    margin-bottom: 16px;
  }

  &__slots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }

  &__slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px 8px;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    background: $color-surface;
    cursor: pointer;
    transition: all $transition-fast;
    &:hover:not(:disabled) { border-color: $color-text; }

    &--unavailable {
      background: #FEF2F2;
      border-color: #FECACA;
      opacity: 0.7;
    }

    &--booked {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  &__slot-time { font-size: 14px; font-weight: 600; }
  &__slot-status { font-size: 11px; color: $color-text-secondary; }

  &__no-bookings {
    text-align: center;
    padding: 40px 0;
    color: $color-text-tertiary;
    border: 1px dashed $color-border;
    border-radius: $radius-sm;
  }

  &__bookings-list { display: flex; flex-direction: column; gap: 8px; }

  &__booking {
    display: flex;
    gap: 12px;
    padding: 12px;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    border-left: 3px solid transparent;
    &--pending { border-left-color: #F59E0B; }
    &--confirmed { border-left-color: #10B981; }
    &--cancelled { border-left-color: #EF4444; opacity: 0.6; }
  }

  &__booking-time { font-size: 14px; font-weight: 700; min-width: 50px; }

  &__booking-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 13px;
    strong { font-size: 14px; }
  }

  &__booking-phone { color: $color-text-secondary; font-size: 12px; }
}
</style>
