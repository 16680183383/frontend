import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import UserLayout from '@/components/UserLayout.vue';

function isAuthed() {
  return Boolean(localStorage.getItem('token'));
}

function getRole() {
  return localStorage.getItem('role');
}

const routes = [
  {
    path: '/',
    redirect: () => {
      if (!isAuthed()) return '/login';
      return getRole() === 'ADMIN' ? '/admin' : '/user/diet';
    }
  },
  { path: '/login', name: 'login', component: LoginView },
  {
    path: '/user',
    component: UserLayout,
    meta: { requiresAuth: true },
    redirect: '/user/diet',
    children: [
      { path: 'diet', name: 'diet', component: () => import('@/views/DietPage.vue') },
      { path: 'graph', name: 'graph', component: () => import('@/views/GraphPage.vue') },
      { path: 'recipe', name: 'recipe', component: () => import('@/views/RecipePage.vue') },
      { path: 'shop', name: 'shop', component: () => import('@/views/ShopPage.vue') },
      { path: 'feedback', name: 'feedback', component: () => import('@/views/FeedbackPage.vue') },
      { path: 'profile', name: 'profile', component: () => import('@/views/UserPage.vue') },
    ]
  },
  {
    path: '/admin',
    component: UserLayout,
    meta: { requiresAuth: true, role: 'ADMIN' },
    children: [
      { path: '', name: 'admin', component: () => import('@/views/AdminDashboard.vue') }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authed = isAuthed();
  const role = getRole();

  if (to.meta.requiresAuth && !authed) {
    next({ name: 'login' });
    return;
  }

  if (to.name === 'login' && authed) {
    next(role === 'ADMIN' ? '/admin' : '/user/diet');
    return;
  }

  const requiredRole = to.meta.role || to.matched.find(r => r.meta.role)?.meta.role;
  if (requiredRole && authed && role !== requiredRole) {
    next(role === 'ADMIN' ? '/admin' : '/user/diet');
    return;
  }

  next();
});

export default router;
