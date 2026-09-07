// Маска и валидация российского номера + антиспам-лимит заявок.

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function normalizeRuPhone(value: string): string {
  let d = digitsOnly(value)
  if (d.startsWith('8')) d = '7' + d.slice(1)
  if (d && !d.startsWith('7')) d = '7' + d
  return d.slice(0, 11)
}

// +7 (___) ___-__-__ — достраивается по мере ввода.
export function formatRuPhone(value: string): string {
  const d = normalizeRuPhone(value)
  if (!d) return ''
  const rest = d.slice(1)
  let out = '+7'
  if (rest.length > 0) out += ' (' + rest.slice(0, 3)
  if (rest.length >= 3) out += ')'
  if (rest.length > 3) out += ' ' + rest.slice(3, 6)
  if (rest.length > 6) out += '-' + rest.slice(6, 8)
  if (rest.length > 8) out += '-' + rest.slice(8, 10)
  return out
}

export function isValidRuPhone(value: string): boolean {
  const d = normalizeRuPhone(value)
  return d.length === 11 && d.startsWith('7')
}

// --- Антиспам: не больше N заявок в час с одного устройства (localStorage).
// Это первый рубеж; боты дополнительно отсекаются honeypot и time-trap в форме.
import { storage } from '@/services/storage'

const ATTEMPTS_KEY = 'booking_attempts'
const WINDOW_MS = 3600000

export function checkBookingRateLimit(max = 3): boolean {
  const now = Date.now()
  const all = storage.get<number[]>(ATTEMPTS_KEY) || []
  return all.filter((t) => now - t < WINDOW_MS).length < max
}

export function recordBookingAttempt(): void {
  const now = Date.now()
  const all = (storage.get<number[]>(ATTEMPTS_KEY) || []).filter((t) => now - t < WINDOW_MS)
  all.push(now)
  storage.set(ATTEMPTS_KEY, all)
}
