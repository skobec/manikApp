<script setup lang="ts">
import { ref } from 'vue'
import { useServices } from '@/composables/useServices'
import { useAdminScope } from '@/composables/useAdminScope'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppSkeleton from '@/components/ui/AppSkeleton.vue'
import { useToast } from '@/composables/useToast'
import { formatPrice } from '@/utils/helpers'
import type { Service } from '@/types'

const { services, loading, cloudError, add, update, remove, useCloudScope } = useServices()
const { show } = useToast()

useAdminScope([useCloudScope])

const editingService = ref<Service | null>(null)
const showModal = ref(false)
const form = ref({
  name: '',
  description: '',
  price: 0,
  duration: 60,
  category: '',
  active: true,
})

const categoryOptions = [
  { value: 'Маникюр', label: 'Маникюр' },
  { value: 'Покрытие', label: 'Покрытие' },
  { value: 'Дизайн', label: 'Дизайн' },
  { value: 'Наращивание', label: 'Наращивание' },
  { value: 'Педикюр', label: 'Педикюр' },
  { value: 'Укрепление', label: 'Укрепление' },
  { value: 'Услуги', label: 'Услуги' },
]

function openAdd() {
  editingService.value = null
  form.value = { name: '', description: '', price: 0, duration: 60, category: 'Маникюр', active: true }
  showModal.value = true
}

function openEdit(s: Service) {
  editingService.value = s
  form.value = { ...s }
  showModal.value = true
}

async function save() {
  if (!form.value.name || !form.value.price) {
    show('Заполните обязательные поля', 'error')
    return
  }
  try {
    if (editingService.value) {
      await update(editingService.value.id, form.value)
      show('Услуга обновлена', 'success')
    } else {
      await add(form.value)
      show('Услуга добавлена', 'success')
    }
    showModal.value = false
  } catch {
    show(cloudError.value || 'Не получилось сохранить услугу', 'error')
  }
}

async function confirmRemove(id: string) {
  try {
    await remove(id)
    show('Услуга удалена', 'info')
  } catch {
    show(cloudError.value || 'Не получилось удалить услугу', 'error')
  }
}

async function toggleService(s: Service) {
  try {
    await update(s.id, { active: !s.active })
  } catch {
    show(cloudError.value || 'Не получилось обновить услугу', 'error')
  }
}
</script>

<template>
  <div class="admin-services">
    <div class="admin-services__header">
      <p class="admin-services__count">{{ services.length }} услуг</p>
      <AppButton @click="openAdd">Добавить услугу</AppButton>
    </div>

    <div v-if="loading" class="admin-services__list">
      <AppSkeleton v-for="i in 3" :key="i" height="88px" radius="8px" />
    </div>
    <div v-else-if="services.length === 0" class="admin-services__empty">
      <p>Нет услуг. Добавьте первую.</p>
    </div>

    <div v-else class="admin-services__list">
      <div v-for="s in services" :key="s.id" class="admin-services__item" :class="{ 'admin-services__item--inactive': !s.active }">
        <div class="admin-services__item-info">
          <div class="admin-services__item-top">
            <strong>{{ s.name }}</strong>
            <span v-if="!s.active" class="admin-services__item-badge">Неактивна</span>
            <span class="admin-services__item-category">{{ s.category }}</span>
          </div>
          <p class="admin-services__item-desc">{{ s.description }}</p>
          <p class="admin-services__item-meta">{{ formatPrice(s.price) }} · {{ s.duration }} мин</p>
        </div>
        <div class="admin-services__item-actions">
          <AppButton size="sm" variant="secondary" @click="openEdit(s)">Ред.</AppButton>
          <AppButton size="sm" variant="ghost" @click="toggleService(s)">
            {{ s.active ? 'Деакт.' : 'Акт.' }}
          </AppButton>
          <AppButton size="sm" variant="danger" @click="confirmRemove(s.id)">Удал.</AppButton>
        </div>
      </div>
    </div>

    <AppModal :open="showModal" :title="editingService ? 'Редактировать услугу' : 'Новая услуга'" @close="showModal = false">
      <div style="display:flex; flex-direction:column; gap:16px;">
        <AppInput v-model="form.name" label="Название" placeholder="Название услуги" />
        <AppInput v-model="form.description" label="Описание" placeholder="Описание услуги" multiline />
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <AppInput :model-value="String(form.price)" @update:model-value="form.price = Number($event)" label="Цена (₽)" type="number" />
          <AppInput :model-value="String(form.duration)" @update:model-value="form.duration = Number($event)" label="Длительность (мин)" type="number" />
        </div>
        <AppSelect v-model="form.category" label="Категория" :options="categoryOptions" />
        <div style="display:flex; gap: 12px; justify-content:flex-end; margin-top:8px;">
          <AppButton variant="secondary" @click="showModal = false">Отмена</AppButton>
          <AppButton @click="save">Сохранить</AppButton>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.admin-services {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  &__count {
    font-size: 14px;
    color: $color-text-secondary;
  }

  &__empty {
    text-align: center;
    padding: 60px 0;
    color: $color-text-tertiary;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__item {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 16px;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-sm;

    &--inactive {
      opacity: 0.6;
    }

    @include mobile {
      flex-direction: column;
    }
  }

  &__item-info {
    flex: 1;
  }

  &__item-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  &__item-badge {
    padding: 1px 6px;
    background: #FEE2E2;
    color: #DC2626;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
  }

  &__item-category {
    padding: 1px 6px;
    background: $color-bg;
    border-radius: 100px;
    font-size: 11px;
    color: $color-text-secondary;
  }

  &__item-desc {
    font-size: 13px;
    color: $color-text-secondary;
  }

  &__item-meta {
    font-size: 13px;
    color: $color-text-tertiary;
    margin-top: 4px;
  }

  &__item-actions {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    flex-shrink: 0;
  }
}
</style>
