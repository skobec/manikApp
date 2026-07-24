export class StorageService {
  private prefix: string

  constructor(prefix: string = 'manik_') {
    this.prefix = prefix
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(this.getKey(key))
      if (!raw) return null
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value))
    } catch (e) {
      console.error('StorageService.set error:', e)
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.getKey(key))
  }

  getAll<T>(key: string): T[] {
    return this.get<T[]>(key) || []
  }

  addItem<T extends { id: string }>(key: string, item: T): void {
    const items = this.getAll<T>(key)
    items.push(item)
    this.set(key, items)
  }

  updateItem<T extends { id: string }>(key: string, id: string, updates: Partial<T>): void {
    const items = this.getAll<T>(key)
    const index = items.findIndex((i) => i.id === id)
    if (index !== -1) {
      items[index] = { ...items[index], ...updates }
      this.set(key, items)
    }
  }

  removeItem<T extends { id: string }>(key: string, id: string): void {
    const items = this.getAll<T>(key)
    this.set(key, items.filter((i) => i.id !== id))
  }
}

export const storage = new StorageService()
