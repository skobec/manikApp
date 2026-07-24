import { ref } from 'vue'
import type { Booking } from '@/types'
import { storage } from '@/services/storage'
import { generateId } from '@/utils/helpers'

const bookings = ref<Booking[]>([])

function load() {
  bookings.value = storage.getAll<Booking>('bookings')
}

load()

export function useBookings() {
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

  function updateStatus(id: string, status: Booking['status']) {
    const index = bookings.value.findIndex((b) => b.id === id)
    if (index !== -1) {
      bookings.value[index].status = status
      storage.updateItem<Booking>('bookings', id, { status })
    }
  }

  function remove(id: string) {
    bookings.value = bookings.value.filter((b) => b.id !== id)
    storage.removeItem('bookings', id)
  }

  function getAll() {
    return bookings.value
  }

  function getByDate(date: string) {
    return bookings.value.filter((b) => b.date === date)
  }

  return { bookings, create, updateStatus, remove, getAll, getByDate, load }
}
