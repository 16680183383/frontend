<template>
  <div class="login-shell">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <span class="logo-icon"></span>
          <span class="logo-text">Diet Planner</span>
        </div>
        <p class="login-desc">智能饮食管理  健康生活助手</p>
      </div>

      <div class="tab-bar">
        <button :class="['tab-btn', mode === 'login' && 'active']" @click="mode = 'login'">登录</button>
        <button :class="['tab-btn', mode === 'register' && 'active']" @click="mode = 'register'">注册</button>
      </div>

      <form class="form" @submit.prevent="onSubmit">
        <div class="form-row">
          <label>用户名</label>
          <input class="ipt" v-model="username" placeholder="请输入用户名" required autocomplete="username" />
        </div>
        <div class="form-row">
          <label>密码</label>
          <div class="pw-wrap">
            <input class="ipt" v-model="password" :type="showPw ? 'text' : 'password'" placeholder="请输入密码" required autocomplete="current-password" />
            <button type="button" class="pw-toggle" @click="showPw = !showPw" tabindex="-1">
              {{ showPw ? '' : '' }}
            </button>
          </div>
        </div>

        <transition name="slide">
          <div v-if="mode === 'register'" class="form-row">
            <label>确认密码</label>
            <input class="ipt" v-model="confirmPw" type="password" placeholder="请再次输入密码" required autocomplete="new-password" />
          </div>
        </transition>

        <button class="btn-primary lg full" type="submit" :disabled="loading">
          {{ loading ? '处理中' : (mode === 'login' ? '登 录' : '注册并登录') }}
        </button>
        <p class="error-text" v-if="error" style="text-align:center">{{ error }}</p>
      </form>

      <div class="login-footer">
        <span v-if="mode === 'login'">还没有账号？</span>
        <span v-else>已有账号？</span>
        <button class="link-btn" @click="mode = mode === 'login' ? 'register' : 'login'">
          {{ mode === 'login' ? '立即注册' : '去登录' }}
        </button>
      </div>
    </div>

    <div class="login-bg">
      <div class="bg-circle c1"></div>
      <div class="bg-circle c2"></div>
      <div class="bg-circle c3"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, register } from '@/api/client'

const username = ref('')
const password = ref('')
const confirmPw = ref('')
const loading = ref(false)
const error = ref('')
const mode = ref('login')
const showPw = ref(false)
const router = useRouter()

async function onSubmit() {
  error.value = ''
  if (mode.value === 'register' && password.value !== confirmPw.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  loading.value = true
  try {
    if (mode.value === 'register') {
      await register({ username: username.value, password: password.value })
    }
    const data = await login(username.value, password.value)
    if (!data?.token) throw new Error('登录失败，请检查用户名或密码')
    localStorage.setItem('token', data.token)
    localStorage.setItem('username', data.username || username.value)
    localStorage.setItem('role', data.role || 'USER')
    localStorage.setItem('avatarUrl', data.avatarUrl || '')
    if (data.userId) localStorage.setItem('userId', data.userId)
    router.push(data.role === 'ADMIN' ? '/admin' : '/user/diet')
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '操作失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff7ed 0%, #fff 40%, #f0fdf4 100%);
  padding: 24px;
  position: relative;
  overflow: hidden;
}
.login-card {
  width: min(440px, 94vw);
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.04);
  padding: 44px 40px 36px;
  position: relative;
  z-index: 1;
}
.login-header { text-align: center; margin-bottom: 28px; }
.logo { display: flex; align-items: center; justify-content: center; gap: 10px; }
.logo-icon { font-size: 36px; }
.logo-text { font-size: 26px; font-weight: 800; color: var(--text); letter-spacing: -.02em; }
.login-desc { margin: 8px 0 0; color: var(--muted); font-size: 14px; }
.form { display: flex; flex-direction: column; gap: 18px; margin-top: 24px; }
.pw-wrap { position: relative; }
.pw-wrap .ipt { padding-right: 42px; }
.pw-toggle {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; font-size: 16px; line-height: 1; padding: 4px;
}
.btn-primary.full { width: 100%; }
.btn-primary.lg { padding: 14px 24px; font-size: 16px; border-radius: 12px; margin-top: 4px; }
.login-footer {
  text-align: center; margin-top: 20px; font-size: 14px; color: var(--muted);
}
.link-btn {
  background: none; border: none; color: var(--accent);
  font-weight: 700; cursor: pointer; font-size: 14px; padding: 0; margin-left: 4px;
}
.link-btn:hover { text-decoration: underline; }
.login-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.bg-circle { position: absolute; border-radius: 50%; opacity: .12; }
.c1 { width: 400px; height: 400px; background: var(--accent); top: -100px; right: -80px; }
.c2 { width: 300px; height: 300px; background: #16a34a; bottom: -60px; left: -60px; }
.c3 { width: 200px; height: 200px; background: #3b82f6; bottom: 200px; right: 200px; }
.slide-enter-active { animation: slideDown .25s ease; }
.slide-leave-active { animation: slideDown .2s ease reverse; }
@keyframes slideDown {
  from { opacity: 0; max-height: 0; transform: translateY(-8px); }
  to   { opacity: 1; max-height: 80px; transform: translateY(0); }
}
@media (max-width: 480px) { .login-card { padding: 32px 24px 28px; } }
</style>
