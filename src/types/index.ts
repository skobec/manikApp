export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  category: string
  active: boolean
}

export interface GalleryItem {
  id: string
  src: string
  alt: string
  description: string
  category: string
  date: string
}

export interface Review {
  id: string
  name: string
  text: string
  rating: number
  date: string
  active: boolean
}

export interface Booking {
  id: string
  serviceId: string
  serviceName: string
  date: string
  time: string
  name: string
  phone: string
  comment: string
  createdAt: string
  status: 'pending' | 'confirmed' | 'cancelled'
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface BusinessInfo {
  name: string
  subtitle: string
  address: string
  phone: string
  email: string
  instagram: string
  telegram: string
  workHours: string
  description: string
}
