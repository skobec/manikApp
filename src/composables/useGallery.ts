import { ref } from 'vue'
import type { GalleryItem } from '@/types'
import { storage } from '@/services/storage'
import { defaultGallery } from '@/data/gallery'
import { generateId } from '@/utils/helpers'
import { isSupabaseEnabled } from '@/services/supabase'
import { listWorks, createWork, updateWork, deleteWork } from '@/services/repositories/media'
import { ruError } from '@/utils/errors'

const items = ref<GalleryItem[]>([])
const cloudBusinessId = ref<string | null>(null)
const cloudError = ref('')

function load() {
  const saved = storage.getAll<GalleryItem>('gallery')
  items.value = saved.length > 0 ? saved : defaultGallery
  if (saved.length === 0) {
    storage.set('gallery', items.value)
  }
}

load()

function isCloud(): boolean {
  return cloudBusinessId.value !== null && isSupabaseEnabled()
}

export function useGallery() {
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
      items.value = await listWorks(cloudBusinessId.value as string)
    } catch (e) {
      cloudError.value = ruError(e instanceof Error ? e.message : '')
    }
  }

  async function add(item: Omit<GalleryItem, 'id'>) {
    if (isCloud()) {
      cloudError.value = ''
      try {
        const created = await createWork(cloudBusinessId.value as string, {
          url: item.src,
          alt: item.alt,
          description: item.description,
          category: item.category,
        })
        items.value.push(created)
        return created
      } catch (e) {
        cloudError.value = ruError(e instanceof Error ? e.message : '')
        throw e
      }
    }
    const newItem: GalleryItem = { ...item, id: generateId() }
    items.value.push(newItem)
    save()
    return newItem
  }

  async function update(id: string, updates: Partial<GalleryItem>) {
    if (isCloud()) {
      cloudError.value = ''
      try {
        const updated = await updateWork(id, {
          url: updates.src,
          alt: updates.alt,
          description: updates.description,
          category: updates.category,
        })
        const index = items.value.findIndex((i) => i.id === id)
        if (index !== -1) items.value[index] = { ...updated, date: items.value[index].date }
        return
      } catch (e) {
        cloudError.value = ruError(e instanceof Error ? e.message : '')
        throw e
      }
    }
    const index = items.value.findIndex((i) => i.id === id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updates }
      save()
    }
  }

  async function remove(id: string) {
    if (isCloud()) {
      cloudError.value = ''
      try {
        await deleteWork(id)
      } catch (e) {
        cloudError.value = ruError(e instanceof Error ? e.message : '')
        throw e
      }
    }
    items.value = items.value.filter((i) => i.id !== id)
    if (!isCloud()) save()
  }

  function save() {
    storage.set('gallery', items.value)
  }

  return { items, cloudError, add, update, remove, load, useCloudScope, useLocalScope, reload }
}
