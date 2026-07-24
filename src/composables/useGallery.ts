import { ref } from 'vue'
import type { GalleryItem } from '@/types'
import { storage } from '@/services/storage'
import { defaultGallery } from '@/data/gallery'
import { generateId } from '@/utils/helpers'

const items = ref<GalleryItem[]>([])

function load() {
  const saved = storage.getAll<GalleryItem>('gallery')
  items.value = saved.length > 0 ? saved : defaultGallery
  if (saved.length === 0) {
    storage.set('gallery', items.value)
  }
}

load()

export function useGallery() {
  function add(item: Omit<GalleryItem, 'id'>) {
    const newItem: GalleryItem = { ...item, id: generateId() }
    items.value.push(newItem)
    save()
    return newItem
  }

  function update(id: string, updates: Partial<GalleryItem>) {
    const index = items.value.findIndex((i) => i.id === id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updates }
      save()
    }
  }

  function remove(id: string) {
    items.value = items.value.filter((i) => i.id !== id)
    save()
  }

  function save() {
    storage.set('gallery', items.value)
  }

  return { items, add, update, remove, load }
}
