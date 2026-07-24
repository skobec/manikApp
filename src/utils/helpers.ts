export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTime(time: string): string {
  return time
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(price)
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

export function getDaysAround(count: number = 30): string[] {
  const days: string[] = []
  const today = new Date()
  for (let i = 0; i < count; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    days.push(date.toISOString().split('T')[0])
  }
  return days
}

export function getDayName(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', { weekday: 'short' })
}

export function getMonthDay(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
