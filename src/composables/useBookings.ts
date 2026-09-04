import { ref } from 'vue'
import type { Booking } from '@/types'
import { storage } from '@/services/storage'
import { generateId } from '@/utils/helpers'
import { isSupabaseEnabled } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'
import {
  listAppointments,
  updateAppointmentStatus,
  deleteAppointment,
} from '@/services/repositories/bookings'
import { ruError } from '@/utils/errors'

const bookings = ref<Booking[]>([])
const cloudBusinessId = ref<string | null>(null)
const cloudError = ref('')

function load() {
  bookings.value = storage.getAll<Booking>('bookings')
}

load()

function isCloud(): boolean {
  return cloudBusinessId.value !== null && isSupabaseEnabled()
}

export function useBookings() {
  async function useCloudScope(businessId: string) {
    cloudBusinessId.value = businessId
    await reload()
  }

  function useLocalScope() {
    cloudBusinessId.value = null
    load()
  }

  async function reload() {
    if (!isCloud()) return
    cloudError.value = ''
    try {
      const tz = useAuthStore().business?.timezone
      bookings.value = await listAppointments(cloudBusinessId.value as string, tz ?? undefined)
    } catch (e) {
      cloudError.value = ruError(e instanceof Error ? e.message : '')
    }
  }

  // Локальное создание (localStorage). В cloud-режиме публичная запись идёт
  // напрямую через createAppointment из repositories/bookings.ts.
  function create(data: Omit<Booking, 'id' | 'createdAt' | 'status'>) {
    const booking: Booking = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    }
    bookings.value.push(booking)
    storage.addItem('bookings', booking)
    return booking
  }

  async function updateStatus(id: string, status: Booking['status']) {
    if (isCloud()) {
      cloudError.value = ''
      try {
        await updateAppointmentStatus(id, status)
      } catch (e) {
        cloudError.value = ruError(e instanceof Error ? e.message : '')
        throw e
      }
    }
    const index = bookings.value.findIndex((b) => b.id === id)
    if (index !== -1) {
      bookings.value[index].status = status
      if (!isCloud()) storage.updateItem<Booking>('bookings', id, { status })
    }
  }

  async function remove(id: string) {
    if (isCloud()) {
      cloudError.value = ''
      try {
        await deleteAppointment(id)
      } catch (e) {
        cloudError.value = ruError(e instanceof Error ? e.message : '')
        throw e
      }
    }
    bookings.value = bookings.value.filter((b) => b.id !== id)
    if (!isCloud()) storage.removeItem('bookings', id)
  }

  function getAll() {
    return bookings.value
  }

  function getByDate(date: string) {
    return bookings.value.filter((b) => b.date === date)
  }

  return {
    bookings,
    cloudError,
    create,
    updateStatus,
    remove,
    getAll,
    getByDate,
    load,
    useCloudScope,
    useLocalScope,
    reload,
  }
}
