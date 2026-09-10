<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGallery } from '@/composables/useGallery'
import { useAdminScope } from '@/composables/useAdminScope'
import { useAuthStore } from '@/stores/authStore'
import { isSupabaseEnabled } from '@/services/supabase'
import { uploadWorkImage } from '@/services/repositories/media'
import { fileToResizedDataUrl } from '@/utils/image'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppSkeleton from '@/components/ui/AppSkeleton.vue'
import { useToast } from '@/composables/useToast'
import type { GalleryItem } from '@/types'

const { items, loading, cloudError, add, update, remove, useCloudScope } = useGallery()
const { show } = useToast()
const auth = useAuthStore()

useAdminScope([useCloudScope])

const isCloud = computed(() => isSupabaseEnabled() && !!auth.business)
const uploading = ref(false)
const uploadError = ref('')
const brokenImgs = ref<Record<string, boolean>>({})

function hasPhoto(item: GalleryItem): boolean {
  return !!item.src && /^(https?:|data:)/.test(item.src) && !brokenImgs.value[item.id]
}

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  uploadError.value = ''
  uploading.value = true
  try {
    if (isCloud.value && auth.business) {
      form.value.src = await uploadWorkImage(auth.business.id, file)
      show('Фото загружено в облако', 'success')
    } else {
      form.value.src = await fileToResizedDataUrl(file)
      show('Фото добавлено (хранится локально)', 'success')
    }
  } catch (err) {
    uploadError.value = err instanceof Error ? err.message : 'Не получилось загрузить фото'
  } finally {
    uploading.value = false
  }
}

const editingItem = ref<GalleryItem | null>(null)
const showModal = ref(false)
const form = ref({
  src: '',
  alt: '',
  description: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
})

const categoryOptions = [
  { value: 'Дизайн', label: 'Дизайн' },
  { value: 'Френч', label: 'Френч' },
  { value: 'Покрытие', label: 'Покрытие' },
  { value: 'Форма', label: 'Форма' },
]

function openAdd() {
  editingItem.value = null
  form.value = { src: '', alt: '', description: '', category: 'Дизайн', date: new Date().toISOString().split('T')[0] }
  showModal.value = true
}

function openEdit(item: GalleryItem) {
  editingItem.value = item
  form.value = { src: item.src, alt: item.alt, description: item.description, category: item.category, date: item.date }
  showModal.value = true
}

async function save() {
  if (!form.value.src && !form.value.alt) {
    show('Добавьте ссылку на фото или название работы', 'error')
    return
  }
  try {
    if (editingItem.value) {
      await update(editingItem.value.id, form.value)
      show('Работа обновлена', 'success')
    } else {
      await add(form.value)
      show('Работа добавлена', 'success')
    }
    showModal.value = false
  } catch {
    show(cloudError.value || 'Не получилось сохранить работу', 'error')
  }
}

async function confirmRemove(id: string) {
  try {
    await remove(id)
    show('Работа удалена', 'info')
  } catch {
    show(cloudError.value || 'Не получилось удалить работу', 'error')
  }
}
</script>

<template>
  <div class="admin-gallery">
    <div class="admin-gallery__header">
      <p class="admin-gallery__count">{{ items.length }} работ</p>
      <AppButton @click="openAdd">Добавить работу</AppButton>
    </div>

    <div v-if="loading" class="admin-gallery__grid">
      <AppSkeleton v-for="i in 4" :key="i" height="200px" radius="8px" />
    </div>
    <div v-else-if="items.length === 0" class="admin-gallery__empty">
      <p>Нет работ в портфолио</p>
    </div>

    <div v-else class="admin-gallery__grid">
      <div v-for="item in items" :key="item.id" class="admin-gallery__card">
        <div class="admin-gallery__card-preview">
          <img
            v-if="hasPhoto(item)"
            :src="item.src"
            :alt="item.alt || 'Работа'"
            class="admin-gallery__card-photo"
            loading="lazy"
            @error="brokenImgs[item.id] = true"
          />
          <div v-else class="admin-gallery__card-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
        </div>
        <div class="admin-gallery__card-info">
          <p class="admin-gallery__card-alt">{{ item.alt }}</p>
          <span class="admin-gallery__card-cat">{{ item.category }}</span>
        </div>
        <div class="admin-gallery__card-actions">
          <AppButton size="sm" variant="secondary" @click="openEdit(item)">Ред.</AppButton>
          <AppButton size="sm" variant="danger" @click="confirmRemove(item.id)">Удал.</AppButton>
        </div>
      </div>
    </div>

    <AppModal :open="showModal" :title="editingItem ? 'Редактировать работу' : 'Новая работа'" @close="showModal = false">
      <div style="display:flex; flex-direction:column; gap:16px;">
        <AppInput v-model="form.alt" label="Название" placeholder="Описание работы" />
        <AppInput v-model="form.description" label="Описание" placeholder="Полное описание" multiline />
        <div class="upload-box">
          <label :class="['upload-box__btn', { 'upload-box__btn--busy': uploading }]">
            {{ uploading ? 'Загружаем…' : (isCloud ? 'Загрузить фото в облако' : 'Выбрать фото с устройства') }}
            <input type="file" accept="image/*" hidden :disabled="uploading" @change="onFile" />
          </label>
          <p class="upload-box__hint">{{ isCloud ? 'JPG/PNG/WebP до 5 МБ' : 'Ужмём автоматически для localStorage' }}</p>
          <p v-if="uploadError" class="upload-box__error">{{ uploadError }}</p>
          <img v-if="form.src" :src="form.src" alt="Превью" class="upload-box__preview" />
        </div>
        <AppInput v-model="form.src" label="URL изображения (или загрузите выше)" placeholder="https://..." />
        <AppSelect v-model="form.category" label="Категория" :options="categoryOptions" />
        <AppInput v-model="form.date" label="Дата" type="date" />
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

.admin-gallery {
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

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  &__card {
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    overflow: hidden;
  }

  &__card-preview {
    aspect-ratio: 3/4;
    background: $color-bg;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-text-tertiary;
    overflow: hidden;
  }

  &__card-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__card-info {
    padding: 12px;
  }

  &__card-alt {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 4px;
  }

  &__card-cat {
    font-size: 11px;
    color: $color-text-secondary;
    padding: 2px 6px;
    background: $color-bg;
    border-radius: 100px;
  }

  &__card-actions {
    display: flex;
    gap: 8px;
    padding: 8px 12px 12px;
  }
}

.upload-box {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 16px;
    border: 1px dashed $color-border-hover;
    border-radius: $radius-sm;
    font-size: 14px;
    font-weight: 500;
    color: $color-text;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      border-color: $color-text;
      background: $color-bg;
    }

    &--busy {
      opacity: 0.6;
      pointer-events: none;
    }
  }

  &__hint {
    font-size: 12px;
    color: $color-text-tertiary;
  }

  &__error {
    font-size: 13px;
    color: $color-error;
  }

  &__preview {
    width: 100%;
    max-height: 220px;
    object-fit: cover;
    border-radius: $radius-sm;
    border: 1px solid $color-border;
  }
}
</style>
