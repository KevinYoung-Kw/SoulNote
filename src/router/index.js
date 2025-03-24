import { createRouter, createWebHashHistory } from 'vue-router';
import { getOnboardingCompleted } from '../services/storageService';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage.vue';
import AboutUsPage from '../pages/AboutUsPage.vue';
import H5SettingsPage from '../components/layout/H5SettingsPage.vue';

// 导入管理面板组件
const AdminPanel = () => import('../pages/AdminPanel.vue');

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: () => import('../pages/WelcomePage.vue'),
    meta: { requiresOnboarding: false },
    // 添加查询参数配置，允许invitecode作为查询参数
    props: (route) => ({ inviteCode: route.query.invitecode })
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
    meta: { requiresOnboarding: false },
    // 添加查询参数配置，允许invitecode作为查询参数
    props: (route) => ({ inviteCode: route.query.invitecode })
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
  },
  // 添加管理面板路由
  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: {
      title: '管理面板 - 星语心笺'
    }
  },
  {
    path: '/h5-settings',
    name: 'H5Settings',
    component: H5SettingsPage,
    meta: {
      title: 'H5模板设置'
    }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// 路由守卫，检查是否完成引导流程
router.beforeEach(async (to, from, next) => {
  try {
    // 在路由切换前，检查并应用毒舌模式样式，防止在页面加载期间闪烁
    const isSavageMode = localStorage.getItem('soulnote_savage_mode') === 'true';
    if (isSavageMode) {
      document.body.classList.add('savage-mode');
    }
    
    // 异步获取引导完成状态
    const hasCompletedOnboarding = await getOnboardingCompleted();
    
    // 处理管理员页面 - 不受引导流程限制
    if (to.name === 'AdminPanel') {
      next();
      return;
    }
    
    // 处理静态信息页面 - 不受引导流程限制
    if (to.name === 'PrivacyPolicy' || to.name === 'AboutUs') {
      next();
      return;
    }
    
    // 如果包含邀请码参数并访问欢迎页，让用户正常访问欢迎页
    // 而不是直接跳转到引导页，这允许用户看到欢迎页内容
    
    // 如果尝试直接访问OnboardingPage但不是从WelcomePage来的
    if (to.name === 'Onboarding' && from.name !== 'Welcome' && from.name && !to.query.invitecode) {
      console.log('非法访问引导页，重定向到欢迎页', from.name, '->', to.name);
      next({ name: 'Welcome' });
      return;
    }
    
    // 如果需要完成引导但尚未完成，重定向到欢迎页
    if (to.meta.requiresOnboarding && !hasCompletedOnboarding) {
      console.log('需要引导但未完成，重定向到欢迎页');
      next({ name: 'Welcome' });
      return;
    } 
    
    // 如果已完成引导且访问欢迎/引导页面，重定向到首页
    if (hasCompletedOnboarding && (to.name === 'Welcome' || to.name === 'Onboarding')) {
      next({ name: 'Home' });
      return;
    }
    
    // 其他情况正常导航
    next();
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
