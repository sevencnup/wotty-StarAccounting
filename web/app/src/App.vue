<template>
  <div id="app-root">
    <router-view />
    <BottomNav />
  </div>
</template>

<script setup>
import BottomNav from './components/BottomNav.vue'
</script>

<style scoped>
#app-root {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}
</style>
