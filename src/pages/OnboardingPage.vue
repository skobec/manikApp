<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import { useAuthStore } from '@/stores/authStore'
import { isSlugAvailablePattern, RESERVED_SLUGS } from '@/utils/errors'

const router = useRouter()
const auth = useAuthStore()

const name = ref('')
const slug = ref('')
const city = ref('')
const timezone = ref('Europe/Moscow')
const nameError = ref('')
const slugError = ref('')
const slugTouched = ref(false)

const timezoneOptions = [
  { value: 'Europe/Moscow', label: 'Москва (UTC+3)' },
  { value: 'Europe/Kaliningrad', label: 'Калининград (UTC+2)' },
  { value: 'Europe/Samara', label: 'Самара (UTC+4)' },
  { value: 'Asia/Yekaterinburg', label: 'Екатеринбург (UTC+5)' },
  { value: 'Asia/Novosibirsk', label: 'Новосибирск (UTC+7)' },
  { value: 'Asia/Krasnoyarsk', label: 'Красноярск (UTC+7)' },
  { value: 'Asia/Irkutsk', label: 'Иркутск (UTC+8)' },
  { value: 'Asia/Vladivostok', label: 'Владивосток (UTC+10)' },
  { value: 'Europe/Minsk', label: 'Минск (UTC+3)' },
  { value: 'Asia/Almaty', label: 'Алматы (UTC+6)' },
  { value: 'Europe/Amsterdam', label: 'Амстердам (UTC+1)' },
]

const RU: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

function transliterate(value: string): string {
  return value
    .toLowerCase()
    .split('')
    .map((ch) => RU[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

function onNameInput() {
  if (!slugTouched.value) slug.value = transliterate(name.value)
}

onMounted(async () => {
  if (!auth.initialized) await auth.init()
  if (!auth.user) {
    router.replace({ path: '/login', query: { redirect: '/onboarding' } })
    return
  }
  if (auth.business) router.replace('/admin')
})

async function submit() {
  nameError.value = ''
  slugError.value = ''
  if (name.value.trim().length < 2) {
    nameError.value = 'Введите название студии.'
    return
  }
  if (!isSlugAvailablePattern(slug.value)) {
    slugError.value = RESERVED_SLUGS.includes(slug.value)
      ? 'Этот адрес зарезервирован системой. Придумайте другой.'
      : 'Только латиница, цифры и дефис (3–40 символов).'
    return
  }
  const ok = await auth.createBusiness({
    name: name.value.trim(),
    slug: slug.value,
    city: city.value.trim(),
    timezone: timezone.value,
  })
  if (ok) router.replace('/admin')
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-page__card">
      <h1>Ваша студия</h1>
      <p class="auth-page__sub">Один шаг — и откроется личный кабинет. Публичная страница позже будет жить по адресу <strong>/{{ slug || 'vash-adres' }}</strong>.</p>

      <form class="auth-page__form" @submit.prevent="submit">
        <AppInput v-model="name" label="Название студии" placeholder="Maria Nails" :error="nameError" @update:model-value="onNameInput" />
        <AppInput v-model="slug" label="Адрес страницы (slug)" placeholder="maria-nails" :error="slugError" @update:model-value="slugTouched = true" />
        <AppInput v-model="city" label="Город" placeholder="Москва" />
        <AppSelect v-model="timezone" label="Часовой пояс" :options="timezoneOptions" />
        <p v-if="auth.error" class="auth-page__error">{{ auth.error }}</p>
        <AppButton type="submit" block :loading="auth.loading">Создать студию</AppButton>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.auth-page {
  @include section;
  display: flex;
  justify-content: center;

  &__card {
    @include card;
    width: 100%;
    max-width: 460px;
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    h1 { font-size: 24px; }
  }

  &__sub { font-size: 14px; }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 8px;
  }

  &__error {
    font-size: 14px;
    color: $color-error;
  }
}
</style>
