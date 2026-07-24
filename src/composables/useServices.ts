import { ref, computed } from 'vue'
import type { Service } from '@/types'
import { storage } from '@/services/storage'
import { defaultServices } from '@/data/services'
import { generateId } from '@/utils/helpers'

const services = ref<Service[]>([])

function load() {
  const saved = storage.getAll<Service>('services')
  services.value = saved.length > 0 ? saved : defaultServices
  if (saved.length === 0) {
    storage.set('services', services.value)
  }
}

load()

export function useServices() {
  const activeServices = computed(() => services.value.filter((s) => s.active))

  const categories = computed(() => {
    const cats = new Set(activeServices.value.map((s) => s.category))
    return Array.from(cats)
  })

  function getById(id: string) {
    return services.value.find((s) => s.id === id) || null
  }

  function add(service: Omit<Service, 'id'>) {
    const newService: Service = { ...service, id: generateId() }
    services.value.push(newService)
    save()
    return newService
  }

  function update(id: string, updates: Partial<Service>) {
    const index = services.value.findIndex((s) => s.id === id)
    if (index !== -1) {
      services.value[index] = { ...services.value[index], ...updates }
      save()
    }
  }

  function remove(id: string) {
    services.value = services.value.filter((s) => s.id !== id)
    save()
  }

  function save() {
    storage.set('services', services.value)
  }

  return { services, activeServices, categories, getById, add, update, remove, load }
}
