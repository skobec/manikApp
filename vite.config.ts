import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  // Base по умолчанию — корень (dev, preview, Vercel/Cloudflare, свой домен).
  // Для GitHub Pages (подпуть /user/repo/) точный base подставляет CI
  // через скрипт build:pages — см. .github/workflows/deploy-pages.yml.
  // Роутер берёт base из import.meta.env.BASE_URL, относительный './'
  // ему отдавать нельзя: он молча откатывается на '/' и ломает ссылки.
  base: '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
})
