<template>
  <div class="landing">
    <header class="nav shell">
      <div class="brand">Diet Planner</div>
      <div class="nav-actions">
        <template v-if="authed">
          <RouterLink class="avatar" to="/user/user">{{ initial }}</RouterLink>
          <button class="ghost" @click="logout">退出</button>
        </template>
        <template v-else>
          <RouterLink class="ghost" to="/login">登录</RouterLink>
          <RouterLink class="primary" to="/login">立即体验</RouterLink>
        </template>
      </div>
    </header>

    <main class="shell">
      <section class="hero card">
        <div class="hero-content">
          <p class="badge">健康 · 简洁 · 高可用</p>
          <h1>一眼选模块，点击即用</h1>
          <p class="lead">为 20-60 岁关注健康的用户准备，界面以图标为主，少文字、快上手。</p>
          <div class="hero-actions">
            <RouterLink class="primary" :to="authed ? '/user/diet' : '/login'">开始使用</RouterLink>
            <RouterLink v-if="!authed" class="ghost" to="/login">已有账号</RouterLink>
          </div>
        </div>
        <div class="hero-panel">
          <div class="stat-card minimal">
            <div>
              <p class="stat-number">99.9%</p>
              <p class="stat-label">高可用设计</p>
            </div>
            <div>
              <p class="stat-number">5s</p>
              <p class="stat-label">完成推荐</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="icon-grid">
          <RouterLink
            v-for="item in modules"
            :key="item.key"
            class="icon-card"
            :to="item.to"
          >
            <div class="mega-icon">{{ item.icon }}</div>
            <div class="icon-title">{{ item.title }}</div>
          </RouterLink>
        </div>
      </section>
    </main>

    <footer class="shell footer">
      <div>Diet Planner · 健康饮食助手</div>
      <div class="muted">简洁界面 · 面向健康生活的你</div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const modules = [
  { key: 'diet', title: '饮食分析', icon: '🍽️', to: '/user/diet' },
  { key: 'graph', title: '图谱配伍', icon: '🧠', to: '/user/graph' },
  { key: 'recipe', title: '菜谱中心', icon: '📖', to: '/user/recipe' },
  { key: 'shop', title: '购物清单', icon: '🛒', to: '/user/shop' },
  { key: 'feedback', title: '反馈', icon: '💬', to: '/user/feedback' }
];

const authed = computed(() => Boolean(localStorage.getItem('token')));
const username = computed(() => localStorage.getItem('username') || '用户');
const initial = computed(() => username.value.charAt(0).toUpperCase());
const router = useRouter();

const logout = () => {
  localStorage.clear();
  router.push('/login');
};
</script>

<style scoped>
.landing {
  background: #ffffff;
  color: var(--text);
  min-height: 100vh;
}

.shell {
  width: min(1180px, 92vw);
  margin: 0 auto;
}


.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  padding: 18px 0;
  backdrop-filter: blur(10px);
}

.brand {
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.01em;
}

.nav-actions { display: flex; gap: 10px; justify-content: flex-end; }

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #0f172a;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
}

main { padding: 24px 0 64px; display: grid; gap: 32px; }


.hero {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 24px;
  align-items: center;
  padding: 28px;
  border-radius: 28px;
  background: linear-gradient(140deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9));
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.hero-content h1 {
  font-size: clamp(32px, 4vw, 46px);
  line-height: 1.1;
  margin: 12px 0 16px;
}

.lead { color: var(--muted); font-size: 16px; line-height: 1.7; }

.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 18px; }

.hero-meta { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }


.hero-panel { display: grid; gap: 12px; justify-items: end; }

.stat-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  background: #eef2f7;
  border: 1px solid rgba(15, 23, 42, 0.05);
}

.stat-number { font-size: 24px; font-weight: 800; margin: 0; }
.stat-label { margin: 4px 0 0; color: var(--muted); }

.section { display: grid; gap: 18px; }

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 18px;
}

.icon-card {
  display: grid;
  gap: 10px;
  align-items: center;
  justify-items: center;
  padding: 20px 16px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 18px;
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.06);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.icon-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.12);
}

.mega-icon {
  font-size: 52px;
  line-height: 1;
}

.icon-title {
  font-weight: 800;
  font-size: 16px;
  letter-spacing: -0.01em;
}

.footer { padding: 32px 0 48px; text-align: center; display: grid; gap: 6px; }
.muted { color: var(--muted); }

.badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(0, 113, 227, 0.1);
  color: #0f172a;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.pill {
  padding: 10px 14px;
  border-radius: 999px;
  background: #eef2f7;
  border: 1px solid rgba(15, 23, 42, 0.05);
  color: #0f172a;
  font-weight: 600;
}

.primary,
.ghost {
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
  border: 1px solid transparent;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.primary {
  background: linear-gradient(120deg, #0071e3, #0f8fff);
  color: #fff;
  box-shadow: 0 14px 30px rgba(0, 113, 227, 0.22);
}

.primary:hover { transform: translateY(-1px); }

.ghost {
  background: transparent;
  color: #0f172a;
  border-color: rgba(15, 23, 42, 0.12);
}

.ghost:hover { background: rgba(15, 23, 42, 0.04); }

@media (max-width: 960px) {
  .nav { grid-template-columns: 1fr; gap: 10px; }
  .nav-links { justify-content: flex-start; }
  .nav-actions { justify-content: flex-start; }
  .hero { grid-template-columns: 1fr; }
  .cta { flex-direction: column; align-items: flex-start; }
}
</style>
