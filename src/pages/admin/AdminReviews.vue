<script setup lang="ts">
import { ref } from 'vue'
import { useReviews } from '@/composables/useReviews'
import { useAdminScope } from '@/composables/useAdminScope'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppInput from '@/components/ui/AppInput.vue'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/utils/helpers'
import type { Review } from '@/types'

const { reviews, cloudError, add, update, remove, useCloudScope } = useReviews()
const { show } = useToast()

useAdminScope([useCloudScope])

const editingReview = ref<Review | null>(null)
const showModal = ref(false)
const form = ref({
  name: '',
  text: '',
  rating: 5,
  date: new Date().toISOString().split('T')[0],
  active: true,
})

function openAdd() {
  editingReview.value = null
  form.value = { name: '', text: '', rating: 5, date: new Date().toISOString().split('T')[0], active: true }
  showModal.value = true
}

function openEdit(r: Review) {
  editingReview.value = r
  form.value = { name: r.name, text: r.text, rating: r.rating, date: r.date, active: r.active }
  showModal.value = true
}

async function save() {
  if (!form.value.name || !form.value.text) {
    show('Заполните имя и текст отзыва', 'error')
    return
  }
  try {
    if (editingReview.value) {
      await update(editingReview.value.id, form.value)
      show('Отзыв обновлён', 'success')
    } else {
      await add(form.value)
      show('Отзыв добавлен', 'success')
    }
    showModal.value = false
  } catch {
    show(cloudError.value || 'Не получилось сохранить отзыв', 'error')
  }
}

async function confirmRemove(id: string) {
  try {
    await remove(id)
    show('Отзыв удалён', 'info')
  } catch {
    show(cloudError.value || 'Не получилось удалить отзыв', 'error')
  }
}

async function toggleActive(r: Review) {
  try {
    await update(r.id, { active: !r.active })
    show(r.active ? 'Отзыв скрыт' : 'Отзыв опубликован', 'info')
  } catch {
    show(cloudError.value || 'Не получилось обновить отзыв', 'error')
  }
}

function renderStars(rating: number) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}
</script>

<template>
  <div class="admin-reviews">
    <div class="admin-reviews__header">
      <p class="admin-reviews__count">{{ reviews.length }} отзывов</p>
      <AppButton @click="openAdd">Добавить отзыв</AppButton>
    </div>

    <div v-if="reviews.length === 0" class="admin-reviews__empty">
      <p>Нет отзывов</p>
    </div>

    <div v-else class="admin-reviews__list">
      <div v-for="r in reviews" :key="r.id" class="admin-reviews__item" :class="{ 'admin-reviews__item--inactive': !r.active }">
        <div class="admin-reviews__item-content">
          <div class="admin-reviews__item-top">
            <strong>{{ r.name }}</strong>
            <span class="admin-reviews__item-stars">{{ renderStars(r.rating) }}</span>
            <span v-if="!r.active" class="admin-reviews__item-badge">Скрыт</span>
          </div>
          <p class="admin-reviews__item-text">"{{ r.text }}"</p>
          <p class="admin-reviews__item-date">{{ formatDate(r.date) }}</p>
        </div>
        <div class="admin-reviews__item-actions">
          <AppButton size="sm" variant="secondary" @click="openEdit(r)">Ред.</AppButton>
          <AppButton size="sm" variant="ghost" @click="toggleActive(r)">{{ r.active ? 'Скрыть' : 'Показать' }}</AppButton>
          <AppButton size="sm" variant="danger" @click="confirmRemove(r.id)">Удал.</AppButton>
        </div>
      </div>
    </div>

    <AppModal :open="showModal" :title="editingReview ? 'Редактировать отзыв' : 'Новый отзыв'" @close="showModal = false">
      <div style="display:flex; flex-direction:column; gap:16px;">
        <AppInput v-model="form.name" label="Имя" placeholder="Имя клиента" />
        <AppInput v-model="form.text" label="Текст отзыва" placeholder="Текст отзыва" multiline />
        <div>
          <label class="admin-reviews__rating-label">Оценка</label>
          <div class="admin-reviews__rating">
            <button v-for="i in 5" :key="i" :class="['admin-reviews__star', { 'admin-reviews__star--filled': i <= form.rating }]" @click="form.rating = i">
              ★
            </button>
          </div>
        </div>
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

.admin-reviews {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  &__count { font-size: 14px; color: $color-text-secondary; }

  &__empty { text-align: center; padding: 60px 0; color: $color-text-tertiary; }

  &__list { display: flex; flex-direction: column; gap: 8px; }

  &__item {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 16px;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-sm;

    &--inactive { opacity: 0.6; }

    @include mobile { flex-direction: column; }
  }

  &__item-content { flex: 1; }

  &__item-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  &__item-stars { color: #f59e0b; font-size: 14px; letter-spacing: 2px; }

  &__item-badge {
    padding: 1px 6px;
    background: #FEE2E2;
    color: #DC2626;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
  }

  &__item-text {
    font-size: 13px;
    color: $color-text-secondary;
    font-style: italic;
  }

  &__item-date { font-size: 12px; color: $color-text-tertiary; margin-top: 4px; }

  &__item-actions { display: flex; gap: 8px; align-items: flex-start; flex-shrink: 0; }

  &__rating-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  &__rating { display: flex; gap: 4px; }

  &__star {
    font-size: 28px;
    border: none;
    background: none;
    cursor: pointer;
    color: $color-border;
    transition: color $transition-fast;
    line-height: 1;

    &--filled { color: #f59e0b; }
    &:hover { color: #f59e0b; }
  }
}
</style>
