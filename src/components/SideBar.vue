<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="brand">
      <div class="icon-circle">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7Z"/>
          <circle cx="12" cy="9" r="2.6"/>
        </svg>
      </div>
      <div class="brand-text">
        <p class="title">Diet Planner</p>
        <p class="subtitle">Smart nutrition</p>
      </div>
      <button class="toggle" @click="$emit('toggle')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </div>
    <nav class="menu">
      <a v-for="item in items" :key="item.label" :class="['menu-item', { active: route.name === item.routeName }]" @click="go(item.routeName)">
        <span class="icon-circle big">
          <component :is="item.icon" />
        </span>
        <div class="text">
          <p class="label">{{ item.label }}</p>
          <p class="hint">{{ item.hint }}</p>
        </div>
      </a>
    </nav>
  </aside>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { h } from 'vue';

const props = defineProps({
  items: { type: Array, required: true },
  collapsed: { type: Boolean, default: false }
});

const router = useRouter();
const route = useRoute();

const go = (name) => router.push({ name });

const IconUser = () => h('svg', { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M20 21v-2a4 4 0 0 0-3-3.87' }),
  h('path', { d: 'M4 21v-2a4 4 0 0 1 3-3.87' }),
  h('circle', { cx: 12, cy: 7, r: 4 })
]);
const IconChart = () => h('svg', { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M3 3v18h18' }),
  h('rect', { x: 7, y: 9, width: 3, height: 8, rx: 1 }),
  h('rect', { x: 12, y: 5, width: 3, height: 12, rx: 1 }),
  h('rect', { x: 17, y: 12, width: 3, height: 5, rx: 1 })
]);
const IconShield = () => h('svg', { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M12 2 5 5v6c0 5 3.5 9 7 9s7-4 7-9V5Z' }),
  h('path', { d: 'm9 12 2 2 4-4' })
]);

const iconMap = { user: IconUser, chart: IconChart, shield: IconShield };

props.items.forEach((item) => {
  if (typeof item.icon === 'string') {
    item.icon = iconMap[item.icon] || IconChart;
  }
});
</script>

<style scoped>
.sidebar {
  background: rgba(14, 20, 27, 0.9);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 100vh;
  position: sticky;
  top: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand .title { margin: 0; font-weight: 800; letter-spacing: 0.3px; }
.brand .subtitle { margin: 2px 0 0; color: var(--muted); font-size: 12px; }
.brand-text { flex: 1; }
.toggle {
  background: rgba(255,255,255,0.06);
  border: none;
  color: var(--text);
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.menu { display: grid; gap: 12px; }
.menu-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid transparent;
  background: rgba(255,255,255,0.03);
  transition: border 0.15s ease, transform 0.15s ease;
}
.menu-item:hover { border-color: rgba(255,255,255,0.1); transform: translateX(2px); }
.menu-item.active { border-color: var(--accent); }
.menu-item .text .label { margin: 0; font-weight: 700; }
.menu-item .text .hint { margin: 4px 0 0; color: var(--muted); font-size: 12px; }

.icon-circle.big { width: 64px; height: 64px; }
</style>
