<script setup lang="ts">
import { useRoute } from 'vue-router'
import AppNavbar from './AppNavbar.vue'
import AppFooter from './AppFooter.vue'

const route = useRoute()
</script>

<template>
  <AppNavbar />
  <main class="main">
    <router-view v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </router-view>
  </main>
  <AppFooter />
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.main {
  flex: 1;
  padding-top: $nav-height;
}
</style>
