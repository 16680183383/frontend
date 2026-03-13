<template>
  <div class="app-layout">
    <!-- Mobile overlay -->
    <div class="sidebar-overlay" v-if="mobileOpen" @click="mobileOpen = false"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: mobileOpen }">
      <div class="sidebar-brand" @click="$router.push('/user/diet')">
        <span class="brand-icon">🥗</span>
        <span class="brand-name">Diet Planner</span>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
          @click="mobileOpen = false"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
          <span class="nav-badge" v-if="item.badge">{{ item.badge }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info" @click="$router.push('/user/profile')">
          <div class="user-avatar">{{ initial }}</div>
          <div class="user-meta">
            <span class="user-name">{{ username }}</span>
            <span class="user-role">{{ role === 'ADMIN' ? '管理员' : '普通用户' }}</span>
          </div>
        </div>
        <button class="logout-btn" @click="logout" title="退出登录">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <main class="main-content">
      <div class="mobile-topbar">
        <button class="hamburger" @click="mobileOpen = !mobileOpen">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <span class="mobile-brand">🥗 Diet Planner</span>
      </div>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const mobileOpen = ref(false)

const baseNav = [
  { path: '/user/diet',     icon: '🍽️', label: '饮食分析' },
  { path: '/user/graph',    icon: '🧠', label: '图谱配伍' },
  { path: '/user/recipe',   icon: '📖', label: '菜谱推荐' },
  { path: '/user/shop',     icon: '🛒', label: '购物清单' },
  { path: '/user/feedback',  icon: '💬', label: '评价反馈' },
  { path: '/user/profile',  icon: '👤', label: '健康档案' },
]

const navItems = computed(() => {
  if (role.value === 'ADMIN') return [...baseNav, { path: '/admin', icon: '⚙️', label: '管理后台' }]
  return baseNav
})

const username = computed(() => localStorage.getItem('username') || '用户')
const role = computed(() => localStorage.getItem('role') || 'USER')
const initial = computed(() => username.value.charAt(0).toUpperCase())
const isActive = (path) => route.path === path

const logout = () => {
  localStorage.clear()
  router.push('/login')
}
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

/* ── Sidebar ── */
.sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  flex-shrink: 0;
  z-index: 100;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 20px 18px;
  cursor: pointer;
  transition: opacity .15s;
}
.sidebar-brand:hover { opacity: .8; }
.brand-icon { font-size: 28px; }
.brand-name { font-size: 18px; font-weight: 800; color: var(--text); letter-spacing: -.02em; }

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 10px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all .15s;
  position: relative;
}
.nav-item:hover { background: var(--accent-light); color: var(--accent); }
.nav-item.active {
  background: linear-gradient(135deg, var(--accent-light), #fff2eb);
  color: var(--accent);
  font-weight: 700;
}
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  transform: translateY(-50%);
  width: 3px; height: 20px;
  border-radius: 0 3px 3px 0;
  background: var(--accent);
}
.nav-icon { font-size: 19px; width: 28px; text-align: center; }
.nav-label { white-space: nowrap; }
.nav-badge {
  margin-left: auto; padding: 2px 8px; border-radius: 999px;
  background: var(--accent); color: #fff; font-size: 11px; font-weight: 700;
}

.sidebar-footer {
  padding: 14px 16px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px;
  border-radius: 10px;
  transition: background .15s;
  flex: 1;
  min-width: 0;
}
.user-info:hover { background: var(--border-light); }
.user-avatar {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: var(--accent-gradient);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}
.user-meta { display: flex; flex-direction: column; min-width: 0; }
.user-name { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 11px; color: var(--muted); }
.logout-btn {
  width: 36px; height: 36px; border-radius: 8px;
  border: 1px solid var(--border); background: #fff;
  color: var(--muted); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .15s; flex-shrink: 0;
}
.logout-btn:hover { border-color: var(--danger); color: var(--danger); background: var(--danger-light); }

/* ── Main ── */
.main-content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}

.mobile-topbar {
  display: none;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
}
.hamburger {
  background: none; border: none; cursor: pointer;
  color: var(--text); padding: 4px;
}
.mobile-brand { font-weight: 700; font-size: 16px; }
.sidebar-overlay { display: none; }

/* ── Mobile ── */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -260px;
    transition: left .25s ease;
    box-shadow: none;
  }
  .sidebar.open {
    left: 0;
    box-shadow: 4px 0 20px rgba(0,0,0,.1);
  }
  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.3);
    z-index: 99;
  }
  .mobile-topbar { display: flex; }
}
</style>
