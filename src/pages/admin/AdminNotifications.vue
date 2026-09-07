<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/authStore'
import { isSupabaseEnabled } from '@/services/supabase'
import {
  getNotificationSettings,
  saveNotificationSettings,
  testTelegramNotification,
} from '@/services/repositories/notifications'
import { ruError } from '@/utils/errors'

const auth = useAuthStore()
const { show } = useToast()

const enabled = ref(false)
const chatId = ref('')
const loading = ref(false)
const testing = ref(false)
const saving = ref(false)

onMounted(async () => {
  if (!isSupabaseEnabled() || !auth.business) return
  loading.value = true
  try {
    const s = await getNotificationSettings(auth.business.id)
    if (s) {
      enabled.value = s.telegram_enabled
      chatId.value = s.telegram_chat_id
    }
  } catch (e) {
    show(ruError(e instanceof Error ? e.message : ''), 'error')
  } finally {
    loading.value = false
  }
})

async function save() {
  if (!auth.business) return
  saving.value = true
  try {
    await saveNotificationSettings(auth.business.id, {
      telegram_enabled: enabled.value,
      telegram_chat_id: chatId.value,
    })
    show('Настройки сохранены', 'success')
  } catch (e) {
    show(ruError(e instanceof Error ? e.message : ''), 'error')
  } finally {
    saving.value = false
  }
}

async function sendTest() {
  testing.value = true
  try {
    await testTelegramNotification()
    show('Тестовое сообщение отправлено — проверьте Telegram', 'success')
  } catch (e) {
    const msg = (e instanceof Error ? e.message : '').toLowerCase()
    if (msg.includes('no_chat_id')) {
      show('Сначала впишите chat id и сохраните', 'error')
    } else if (msg.includes('no_bot_token')) {
      show('В базе нет токена бота. Выполните vault-команду из docs/notifications.md', 'error')
    } else if (msg.includes('no_business')) {
      show('Студия не найдена. Перезайдите в админку.', 'error')
    } else {
      show(ruError(e instanceof Error ? e.message : ''), 'error')
    }
  } finally {
    testing.value = false
  }
}
</script>

<template>
  <div class="admin-notify">
    <div v-if="!isSupabaseEnabled()" class="admin-notify__warn">
      Уведомления работают только с подключённым Supabase (см. docs/supabase-setup.md).
    </div>

    <div class="admin-notify__card">
      <h3>Telegram-уведомления о записях</h3>
      <p class="admin-notify__desc">
        Каждая новая запись с сайта будет мгновенно приходить вам в Telegram.
        Это бесплатно и быстрее email. Подробная инструкция —
        <strong>docs/notifications.md</strong>.
      </p>

      <ol class="admin-notify__steps">
        <li>Создайте бота через <strong>@BotFather</strong> → <strong>/newbot</strong> → скопируйте токен.</li>
        <li>
          В <strong>SQL Editor</strong> выполните (подставив токен):
          <code>select vault.create_secret('&lt;TOKEN&gt;', 'telegram_bot_token');</code>
        </li>
        <li>Напишите боту <strong>/start</strong>, узнайте свой chat id через <strong>@userinfobot</strong>.</li>
        <li>Впишите chat id ниже, включите, сохраните и нажмите «Отправить тестовое».</li>
      </ol>

      <label class="admin-notify__toggle">
        <input v-model="enabled" type="checkbox" />
        <span>Включить уведомления</span>
      </label>

      <AppInput v-model="chatId" label="Telegram chat id" placeholder="Например: 123456789" />

      <div class="admin-notify__actions">
        <AppButton :loading="saving" @click="save">Сохранить</AppButton>
        <AppButton variant="secondary" :loading="testing" @click="sendTest">Отправить тестовое</AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.admin-notify {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 640px;

  &__warn {
    font-size: 13px;
    color: #b45309;
    background: #fef3c7;
    border-radius: $radius-sm;
    padding: 12px 16px;
  }

  &__card {
    @include card;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    h3 { font-size: 18px; }
  }

  &__desc {
    font-size: 14px;
  }

  &__steps {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 14px;
    color: $color-text-secondary;
    padding-left: 20px;
    list-style: decimal;

    code {
      display: block;
      margin-top: 4px;
      padding: 8px 12px;
      background: $color-bg;
      border: 1px solid $color-border;
      border-radius: $radius-sm;
      font-size: 12px;
      overflow-x: auto;
      white-space: nowrap;
    }
  }

  &__toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;

    input {
      width: 18px;
      height: 18px;
      accent-color: $color-text;
    }
  }

  &__actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}
</style>
