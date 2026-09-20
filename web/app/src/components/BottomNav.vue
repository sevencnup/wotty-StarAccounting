<template>
  <nav class="bottom-nav">
    <div class="bottom-nav-shell">
      <div class="bottom-tabs">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          active-class="nav-item--active"
          exact-active-class="nav-item--active"
        >
          <component :is="item.icon" class="nav-icon" />
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </div>
      <span class="home-indicator" aria-hidden="true"></span>
    </div>
  </nav>
</template>

<script setup>
import { h } from 'vue'

const IconHome = {
  render: () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, [
      h('path', { d: 'M12 3.2 3.4 10.6v1.2h1.7v7.8h5.5v-5h2.8v5h5.5v-7.8h1.7v-1.2L12 3.2Z' })
    ])
}

const IconSpend = {
  render: () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('circle', { cx: '12', cy: '12', r: '7.9', stroke: 'currentColor', 'stroke-width': '1.9' }),
      h('path', {
        d: 'M12 7.8v4.1l2.7 1.9',
        stroke: 'currentColor',
        'stroke-width': '1.9',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    ])
}

const IconSave = {
  render: () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('circle', { cx: '12', cy: '12', r: '8', fill: 'currentColor', opacity: '0.22' }),
      h('path', {
        d: 'M12 8.6v6.8M8.6 12h6.8',
        stroke: 'currentColor',
        'stroke-width': '1.9',
        'stroke-linecap': 'round'
      })
    ])
}

const IconLoans = {
  render: () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('rect', { x: '4.2', y: '6.4', width: '15.6', height: '11.2', rx: '2.2', stroke: 'currentColor', 'stroke-width': '1.8' }),
      h('path', { d: 'M4.2 10.2h15.6', stroke: 'currentColor', 'stroke-width': '1.8' })
    ])
}

const IconMe = {
  render: () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, [
      h('path', { d: 'M12 12.3a4.4 4.4 0 1 0 0-8.8 4.4 4.4 0 0 0 0 8.8Zm0 2c-4.1 0-7.3 2.1-7.3 4.4v1h14.6v-1c0-2.3-3.2-4.4-7.3-4.4Z' })
    ])
}

const navItems = [
  { to: '/home', label: 'Home', icon: IconHome },
  { to: '/spend', label: 'Spend', icon: IconSpend },
  { to: '/save', label: 'Save', icon: IconSave },
  { to: '/loans', label: 'Loans', icon: IconLoans },
  { to: '/me', label: 'Me', icon: IconMe }
]
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  z-index: 20;
  padding: 0;
}

.bottom-nav-shell {
  border-radius: 28px 28px 0 0;
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid rgba(225, 232, 243, 0.95);
  box-shadow: 0 -8px 22px rgba(55, 84, 136, 0.08);
  padding: 10px 8px max(9px, env(safe-area-inset-bottom, 0px));
}

.bottom-tabs {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.nav-item {
  flex: 1 1 20%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  text-decoration: none;
  color: #bcc6d6;
}

.nav-item--active {
  color: #2583ff;
}

.nav-icon {
  width: 19px;
  height: 19px;
}

.nav-icon svg {
  display: block;
  width: 100%;
  height: 100%;
}

.nav-label {
  font-size: 10px;
  line-height: 1;
  font-weight: 800;
}

.home-indicator {
  display: block;
  width: 108px;
  height: 4px;
  margin: 10px auto 0;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.8);
}
</style>
