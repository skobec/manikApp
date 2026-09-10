import { ref, computed } from 'vue'
import type { Service } from '@/types'
import { storage } from '@/services/storage'
import { defaultServices } from '@/data/services'
import { generateId } from '@/utils/helpers'
import { isSupabaseEnabled } from '@/services/supabase'
import { listServices, createService, updateService, deleteService } from '@/services/repositories/services'
import { ruError } from '@/utils/errors'

const services = ref<Service[]>([])
const cloudBusinessId = ref<string | null>(null)
const cloudError = ref('')
const loading = ref(false)

function load() {
  const saved = storage.getAll<Service>('services')
  services.value = saved.length > 0 ? saved : defaultServices
  if (saved.length === 0) {
    storage.set('services', services.value)
  }
}

load()

function isCloud(): boolean {
  return cloudBusinessId.value !== null && isSupabaseEnabled()
}

export function useServices() {
  const activeServices = computed(() => services.value.filter((s) => s.active))

  const categories = computed(() => {
    const cats = new Set(activeServices.value.map((s) => s.category))
    return Array.from(cats)
  })

  async function useCloudScope(businessId: string) {
    cloudBusinessId.value = businessId
    // Сбрасываем мок, чтобы он не мелькал, пока грузится база.
    services.value = []
    loading.value = true
    try {
      await reload()
    } finally {
      loading.value = false
    }
  }

  function useLocalScope() {
    cloudBusinessId.value = null
    load()
  }

  async function reload() {
    if (!isCloud()) return
    cloudError.value = ''
    try {
      services.value = await listServices(cloudBusinessId.value as string)
    } catch (e) {
      cloudError.value = ruError(e instanceof Error ? e.message : '')
    }
  }

  function getById(id: string) {
    return services.value.find((s) => s.id === id) || null
  }

  async function add(service: Omit<Service, 'id'>) {
    if (isCloud()) {
      cloudError.value = ''
      try {
        const created = await createService(cloudBusinessId.value as string, {
          name: service.name,
          description: service.description,
          price: service.price,
          duration_minutes: service.duration,
          category: service.category,
          is_active: service.active,
        })
        services.value.push(created)
        return created
      } catch (e) {
        cloudError.value = ruError(e instanceof Error ? e.message : '')
        throw e
      }
    }
    const newService: Service = { ...service, id: generateId() }
    services.value.push(newService)
    save()
    return newService
  }

  async function update(id: string, updates: Partial<Service>) {
    if (isCloud()) {
      cloudError.value = ''
      try {
        const payload: Record<string, unknown> = {}
        if (updates.name !== undefined) payload.name = updates.name
        if (updates.description !== undefined) payload.description = updates.description
        if (updates.price !== undefined) payload.price = updates.price
        if (updates.duration !== undefined) payload.duration_minutes = updates.duration
        if (updates.category !== undefined) payload.category = updates.category
        if (updates.active !== undefined) payload.is_active = updates.active
        const updated = await updateService(id, payload as never)
        const index = services.value.findIndex((s) => s.id === id)
        if (index !== -1) services.value[index] = updated
        return
      } catch (e) {
        cloudError.value = ruError(e instanceof Error ? e.message : '')
        throw e
      }
    }
    const index = services.value.findIndex((s) => s.id === id)
    if (index !== -1) {
      services.value[index] = { ...services.value[index], ...updates }
      save()
    }
  }

  async function remove(id: string) {
    if (isCloud()) {
      cloudError.value = ''
      try {
        await deleteService(id)
      } catch (e) {
        cloudError.value = ruError(e instanceof Error ? e.message : '')
        throw e
      }
    }
    services.value = services.value.filter((s) => s.id !== id)
    if (!isCloud()) save()
  }

  function save() {
    storage.set('services', services.value)
  }

  return {
    services,
    activeServices,
    categories,
    loading,
    cloudError,
    getById,
    add,
    update,
    remove,
    load,
    useCloudScope,
    useLocalScope,
    reload,
  }
}
