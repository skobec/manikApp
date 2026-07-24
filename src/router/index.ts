import { createRouter, createWebHistory } from 'vue-router'

const DEFAULT_TITLE = 'Nail Studio — маникюр на каждый день'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/pages/HomePage.vue'),
          meta: { title: 'Главная' },
        },
        {
          path: 'gallery',
          name: 'gallery',
          component: () => import('@/pages/GalleryPage.vue'),
          meta: { title: 'Работы' },
        },
        {
          path: 'prices',
          name: 'prices',
          component: () => import('@/pages/PricesPage.vue'),
          meta: { title: 'Цены' },
        },
        {
          path: 'reviews',
          name: 'reviews',
          component: () => import('@/pages/ReviewsPage.vue'),
          meta: { title: 'Отзывы' },
        },
        {
          path: 'contacts',
          name: 'contacts',
          component: () => import('@/pages/ContactsPage.vue'),
          meta: { title: 'Контакты' },
        },
        {
          path: 'booking',
          name: 'booking',
          component: () => import('@/pages/BookingPage.vue'),
          meta: { title: 'Запись онлайн' },
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/pages/admin/AdminLayout.vue'),
      children: [
        {
          path: '',
          name: 'admin',
          component: () => import('@/pages/admin/AdminDashboard.vue'),
          meta: { title: 'Админ-панель' },
        },
        {
          path: 'bookings',
          name: 'admin-bookings',
          component: () => import('@/pages/admin/AdminBookings.vue'),
          meta: { title: 'Записи' },
        },
        {
          path: 'services',
          name: 'admin-services',
          component: () => import('@/pages/admin/AdminServices.vue'),
          meta: { title: 'Услуги' },
        },
        {
          path: 'gallery',
          name: 'admin-gallery',
          component: () => import('@/pages/admin/AdminGallery.vue'),
          meta: { title: 'Галерея' },
        },
        {
          path: 'reviews',
          name: 'admin-reviews',
          component: () => import('@/pages/admin/AdminReviews.vue'),
          meta: { title: 'Отзывы' },
        },
        {
          path: 'calendar',
          name: 'admin-calendar',
          component: () => import('@/pages/admin/AdminCalendar.vue'),
          meta: { title: 'Календарь' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.afterEach((to) => {
  const title = to.meta?.title
    ? `${to.meta.title} | Nail Studio`
    : DEFAULT_TITLE
  document.title = title

  let description = 'Профессиональный маникюр и педикюр. Запись онлайн.'
  if (to.meta?.description) {
    description = to.meta.description as string
  }
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc) {
    metaDesc.setAttribute('content', description)
  }
})

export default router
