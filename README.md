# Nail Studio — сайт для частного мастера маникюра

MVP современного сайта с онлайн-записью, админ-панелью и архитектурой, готовой к подключению Supabase.

---

## Стек

- **Vue 3** (Composition API, `<script setup>`)
- **Vite 8**
- **TypeScript**
- **Vue Router 4** (ленивая загрузка страниц)
- **Pinia** (управление состоянием)
- **SCSS** (модульная система стилей)
- Анимации, адаптив, localStorage

---

## Запуск

```bash
npm install
npm run dev       # разработка на localhost:5173
npm run build     # production-сборка в dist/
npm run preview   # превью собранного проекта
```

---

## Структура проекта

```
src/
├── assets/styles/         # Глобальные SCSS-стили
│   ├── _variables.scss    # Цвета, тени, шрифты, отступы
│   ├── _mixins.scss       # Миксины (кнопки, поля, адаптив)
│   ├── _reset.scss        # Сброс браузерных стилей
│   ├── _typography.scss   # Типографика
│   └── main.scss          # Главный файл (подключает всё)
│
├── components/
│   ├── ui/                # Переиспользуемые UI-компоненты
│   │   ├── AppButton.vue
│   │   ├── AppInput.vue
│   │   ├── AppSelect.vue
│   │   ├── AppModal.vue
│   │   ├── AppToast.vue
│   │   └── AppLoader.vue
│   ├── layout/            # Компоненты макета
│   │   ├── AppNavbar.vue  # Навигация (десктоп + мобильная)
│   │   ├── AppFooter.vue
│   │   └── AppLayout.vue  # Основной слой с <router-view>
│   ├── HeroSection.vue
│   ├── ServiceCard.vue
│   ├── GalleryCard.vue
│   ├── ReviewCard.vue
│   ├── PriceCard.vue
│   └── BookingForm.vue    # Форма записи в 4 шага
│
├── composables/           # Логика, общая для компонентов
│   ├── useBookings.ts     # CRUD для записей
│   ├── useServices.ts     # CRUD для услуг
│   ├── useGallery.ts      # CRUD для галереи
│   ├── useReviews.ts      # CRUD для отзывов
│   ├── useTimeSlots.ts    # Управление слотами времени (per-date)
│   └── useToast.ts        # Система уведомлений
│
├── data/                  # Моковые данные (начальное наполнение)
│   ├── services.ts
│   ├── gallery.ts
│   ├── reviews.ts
│   └── timeSlots.ts
│
├── pages/                 # Страницы приложения
│   ├── HomePage.vue       # ← главная
│   ├── GalleryPage.vue    # /gallery
│   ├── PricesPage.vue     # /prices
│   ├── ReviewsPage.vue    # /reviews
│   ├── ContactsPage.vue   # /contacts
│   ├── BookingPage.vue    # /booking
│   └── admin/
│       ├── AdminLayout.vue       # Боковая панель
│       ├── AdminDashboard.vue    # /admin
│       ├── AdminBookings.vue     # /admin/bookings
│       ├── AdminServices.vue     # /admin/services
│       ├── AdminGallery.vue      # /admin/gallery
│       ├── AdminReviews.vue      # /admin/reviews
│       └── AdminCalendar.vue     # /admin/calendar
│
├── router/index.ts        # Маршрутизация (ленивая загрузка)
├── services/storage.ts    # Абстракция над localStorage
├── stores/                # Pinia-стори
│   ├── bookingStore.ts
│   └── adminStore.ts
├── types/index.ts         # Все TypeScript-интерфейсы
│   └── helpers.ts         # Утилиты (форматирование, даты)
│
├── App.vue                # Корневой компонент
└── main.ts                # Точка входа
```

---

## Страницы

| Путь | Описание |
|------|----------|
| `/` | Главная с превью услуг, работ, отзывов и CTA |
| `/gallery` | Портфолио с фильтрацией по категориям |
| `/prices` | Прайс-лист, сгруппированный по категориям |
| `/reviews` | Отзывы клиентов |
| `/contacts` | Контакты, адрес, соцсети, режим работы |
| `/booking` | Онлайн-запись в 4 шага (услуга → дата/время → контакты → готово) |
| `/admin` | Дашборд со статистикой |
| `/admin/bookings` | Управление записями (подтверждение, отмена, удаление) |
| `/admin/services` | Управление услугами и ценами |
| `/admin/gallery` | Управление портфолио |
| `/admin/reviews` | Управление отзывами |
| `/admin/calendar` | Управление слотами времени по дням |

---

## Хранение данных

Все данные хранятся в **localStorage** через сервис `services/storage.ts`.

Ключи в localStorage:
- `manik_bookings` — записи клиентов
- `manik_services` — услуги
- `manik_gallery` — галерея
- `manik_reviews` — отзывы
- `manik_blockedTimes` — заблокированные админом временные слоты

---

## Подключение Supabase (в будущем)

Архитектура спроектирована так, чтобы backend подключался без переписывания фронтенда:

1. В `services/storage.ts` заменить вызовы `localStorage` на `supabase.from('table')...`
2. Композаблы (`useBookings`, `useServices`, и т.д.) не меняются — они уже работают через `storage`
3. Компоненты не меняются — они уже работают через композаблы

---

## Дизайн

Стиль: минимализм, Apple/Linear/Vercel.

- Светлая тема, большие отступы, плавные анимации
- Адаптив: мобильные, планшеты, десктоп
- Цветовая схема: `_variables.scss`
- Основной цвет акцента: `#E88D7A` (тёплый коралловый)

---

## Команды

```bash
npm run dev       # Запуск dev-сервера
npm run build     # Сборка в dist/
npm run preview   # Просмотр собранного проекта
npm run lint      # Линтинг (если настроен)
```
