import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: () => import('../pages/WelcomePage.vue'),
    meta: { requiresOnboarding: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../pages/HomePage.vue'),
    meta: { requiresOnboarding: true }
  },
  {
    path: '/saved',
    name: 'SavedNotes',
    component: () => import('../pages/SavedNotesPage.vue'),
    meta: { requiresOnboarding: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../pages/SettingsPage.vue'),
    meta: { requiresOnboarding: true }
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: () => import('../pages/OnboardingPage.vue'),
    meta: { requiresOnboarding: false }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// 路由守卫，检查是否完成引导流程
router.beforeEach((to, from, next) => {
  const hasCompletedOnboarding = localStorage.getItem('soul-note-onboarding-completed') === 'true';
  
  // 如果需要完成引导但尚未完成，重定向到引导页
  if (to.meta.requiresOnboarding && !hasCompletedOnboarding) {
    next({ name: 'Onboarding' });
  } 
  // 如果已完成引导且访问欢迎/引导页面，重定向到首页
  else if (hasCompletedOnboarding && (to.name === 'Welcome' || to.name === 'Onboarding')) {
    next({ name: 'Home' });
  }
  // 其他情况正常导航
  else {
    next();
  }
});

export default router;
