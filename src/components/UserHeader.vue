<template>
  <header class="topbar">
    <div class="left">
      <p class="title">{{ title }}</p>
      <p class="subtitle">{{ subtitle }}</p>
    </div>
    <div class="right" v-if="user">
      <div class="badge">{{ user.role === 'ADMIN' ? '管理员' : '用户' }}</div>
      <div class="avatar" :style="avatarStyle">
        <span v-if="!user.avatarUrl">{{ initials }}</span>
      </div>
      <div class="user-text">
        <p class="name">{{ user.username }}</p>
        <p class="muted">{{ user.nickname || '欢迎回来' }}</p>
      </div>
      <button class="ghost" @click="$emit('logout')">退出</button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: String,
  subtitle: String,
  user: Object
});

const initials = computed(() => (props.user?.username || 'U').slice(0, 2).toUpperCase());
const avatarStyle = computed(() => {
  if (props.user?.avatarUrl) {
    return { backgroundImage: `url(${props.user.avatarUrl})`, backgroundSize: 'cover' };
  }
  return {};
});
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  backdrop-filter: blur(6px);
}
.title { margin: 0; font-size: 22px; font-weight: 800; }
.subtitle { margin: 6px 0 0; color: var(--muted); }
.right { display: flex; align-items: center; gap: 12px; }
.avatar {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(93,214,168,0.3), rgba(110,167,255,0.3));
  border: 1px solid rgba(255,255,255,0.08);
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #0b1016;
  overflow: hidden;
}
.user-text .name { margin: 0; font-weight: 700; }
.user-text .muted { margin: 2px 0 0; color: var(--muted); font-size: 12px; }
.badge { text-transform: uppercase; }
.ghost {
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05);
  color: var(--text);
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
}
</style>
