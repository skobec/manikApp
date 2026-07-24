import { ref } from 'vue'
import type { TimeSlot } from '@/types'
import { storage } from '@/services/storage'
import { defaultTimeSlots } from '@/data/timeSlots'

const blockedTimes = ref<Record<string, string[]>>({})

function load() {
  const saved = storage.get<Record<string, string[]>>('blockedTimes')
  blockedTimes.value = saved || {}
}

load()

export function useTimeSlots() {
  function getSlotsForDate(date: string, bookedTimes: string[] = []): TimeSlot[] {
    const dateBlocked = blockedTimes.value[date] || []
    return defaultTimeSlots.map((slot) => ({
      ...slot,
      available: !dateBlocked.includes(slot.time) && !bookedTimes.includes(slot.time),
    }))
  }

  function toggleBlocked(date: string, time: string) {
    if (!blockedTimes.value[date]) {
      blockedTimes.value[date] = []
    }
    const idx = blockedTimes.value[date].indexOf(time)
    if (idx === -1) {
      blockedTimes.value[date].push(time)
    } else {
      blockedTimes.value[date].splice(idx, 1)
    }
    storage.set('blockedTimes', blockedTimes.value)
  }

  function load() {
    const saved = storage.get<Record<string, string[]>>('blockedTimes')
    blockedTimes.value = saved || {}
  }

  return { blockedTimes, getSlotsForDate, toggleBlocked, load }
}
