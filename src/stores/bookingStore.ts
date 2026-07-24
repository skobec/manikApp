import { defineStore } from 'pinia'
import { useBookings } from '@/composables/useBookings'

export const useBookingStore = defineStore('booking', () => {
  const { bookings, create, updateStatus, remove, getAll } = useBookings()
  return { bookings, create, updateStatus, remove, getAll }
})
