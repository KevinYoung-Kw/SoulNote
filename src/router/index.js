import { createRouter, createWebHashHistory } from 'vue-router';
import { getOnboardingCompleted } from '../services/storageService';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage.vue';
import AboutUsPage from '../pages/AboutUsPage.vue';
import eventService from '../services/eventService'; // 导入埋点服务

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: () => import('../pages/WelcomePage.vue'),
    meta: { requiresOnboarding: false, title: '欢迎 - 星语心笺' },
    // 添加查询参数配置，允许invitecode作为查询参数
    props: (route) => ({ inviteCode: route.query.invitecode })
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../pages/HomePage.vue'),
    meta: { requiresOnboarding: true, title: '主页 - 星语心笺' }
  },
  {
    path: '/saved',
    name: 'SavedNotes',
    component: () => import('../pages/SavedNotesPage.vue'),
    meta: { requiresOnboarding: true, title: '我的收藏 - 星语心笺' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../pages/SettingsPage.vue'),
    meta: { requiresOnboarding: true, title: '设置 - 星语心笺' }
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: () => import('../pages/OnboardingPage.vue'),
    meta: { requiresOnboarding: false, title: '新手引导 - 星语心笺' },
    // 添加查询参数配置，允许invitecode作为查询参数
    props: (route) => ({ inviteCode: route.query.invitecode })
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: PrivacyPolicyPage,
    meta: { title: '隐私政策 - 星语心笺' }
  },
  {
    path: '/about-us',
    name: 'AboutUs',
    component: AboutUsPage,
    meta: { title: '关于我们 - 星语心笺' }
  },
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
      console.log('管理面板已迁移到单独的后端系统');
      next({ name: 'Home' });
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

// 添加全局后置钩子，记录页面访问事件
router.afterEach((to) => {
  // 设置文档标题
  document.title = to.meta.title || '星语心笺';
  
  // 记录页面访问事件
  try {
    // 收集路由参数(排除敏感信息)
    const routeParams = {};
    
    // 仅记录部分查询参数，避免记录敏感信息
    if (to.query) {
      // 例如可以记录来源渠道等非敏感信息
      if (to.query.source) routeParams.source = to.query.source;
      if (to.query.channel) routeParams.channel = to.query.channel;
      // 不记录邀请码等可能包含敏感信息的参数
    }
    
    // 发送埋点数据
    eventService.trackPageView(to.name, {
      path: to.path,
      params: routeParams
    });
  } catch (error) {
    console.error('页面访问埋点失败:', error);
  }
});

export default router;
