import { createRouter, createWebHashHistory } from 'vue-router';
import { getOnboardingCompleted } from '../services/storageService';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage.vue';
import AboutUsPage from '../pages/AboutUsPage.vue';

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
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: PrivacyPolicyPage
  },
  {
    path: '/about-us',
    name: 'AboutUs',
    component: AboutUsPage
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// 路由守卫，检查是否完成引导流程
router.beforeEach(async (to, from, next) => {
  try {
    // 异步获取引导完成状态
    const hasCompletedOnboarding = await getOnboardingCompleted();
    
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
  } catch (error) {
    console.error('路由守卫错误:', error);
    // 出错时默认导航到欢迎页
    if (to.name !== 'Welcome') {
      next({ name: 'Welcome' });
    } else {
      next();
    }
  }
});

export default router;
