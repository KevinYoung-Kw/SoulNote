/**
 * 图片预加载服务
 * 用于提前加载重要图片，减少用户等待时间
 */
import { loadSvg, preloadSvgs } from '../utils/svgOptimizer';
import logger from '../utils/logger';

// 需要预加载的图片列表 - 按优先级排序
const PRELOAD_IMAGES = {
  // 最高优先级 - 应用启动时立即加载
  critical: [
    // 应用 logo 和基础UI元素
    './src/assets/welcome-logo.svg',
  ],
  
  // 高优先级 - 应用启动后尽快加载
  high: [
    // 第一个引导和参数设置图片
    '/guide/welcome.svg',
    '/guide/params.svg',
  ],
  
  // 中优先级 - 在应用空闲时加载
  medium: [
    // 其他引导图片
    '/guide/generate.svg',
    '/guide/save.svg',
  ],
  
  // 低优先级 - 延迟加载
  low: [
    '/guide/customize.svg',
    '/guide/settings.svg',
    // 应用其他图片
    './src/assets/onboarding-welcome.svg',
    './src/assets/onboarding-complete.svg',
  ]
};

// 预加载状态跟踪
const preloadStatus = {
  critical: 'pending',
  high: 'pending',
  medium: 'pending',
  low: 'pending'
};

/**
 * 预加载单张图片
 * @param {string} src 图片路径
 * @param {object} options 选项
 * @returns {Promise} 返回加载promise
 */
function preloadImage(src, options = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      timeout: 5000,
      useCache: true,
      ...options
    };
    
    // 检查文件类型
    if (src.endsWith('.svg')) {
      // 对于SVG文件，使用我们优化的SVG加载器
      loadSvg(src, opts)
        .then(content => {
          if (content) {
            resolve({ src, type: 'svg', content });
          } else {
            reject(new Error(`SVG加载失败: ${src}`));
          }
        })
        .catch(error => reject(error));
    } else {
      // 对于其他图片类型，使用Image对象加载
      const img = new Image();
      
      // 设置超时
      const timeoutId = setTimeout(() => {
        img.src = ''; // 取消加载
        reject(new Error(`图片加载超时: ${src}`));
      }, opts.timeout);
      
      img.onload = () => {
        clearTimeout(timeoutId);
        resolve({ src, type: 'image', width: img.width, height: img.height });
      };
      
      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error(`图片加载失败: ${src}`));
      };
      
      // 开始加载图片
      img.src = src;
    }
  });
}

/**
 * 预加载图片并跟踪加载状态
 * @param {Array} images 图片路径数组
 * @param {string} priority 优先级名称
 * @param {object} options 加载选项
 * @returns {Promise} 所有图片加载的Promise
 */
async function preloadImagesWithTracking(images, priority, options = {}) {
  if (!images || images.length === 0) {
    return [];
  }
  
  // 更新该优先级的状态
  preloadStatus[priority] = 'loading';
  
  logger.info('PRELOAD', `开始加载${priority}优先级图片: ${images.length}张`);
  
  const start = Date.now();
  let results;
  
  try {
    // 对于SVG和其他图片使用不同的加载方式
    const svgImages = images.filter(src => src.endsWith('.svg'));
    const otherImages = images.filter(src => !src.endsWith('.svg'));
    
    // 并行加载
    const promises = [];
    
    // 对SVG使用批量加载
    if (svgImages.length > 0) {
      const svgOptions = {
        ...options,
        concurrentLimit: options.concurrentLimit || 2
      };
      
      const svgPromise = preloadSvgs(svgImages, svgOptions)
        .then(map => Array.from(map.entries())
          .map(([src, content]) => ({ src, type: 'svg', content })));
      
      promises.push(svgPromise);
    }
    
    // 单独加载其他图片
    if (otherImages.length > 0) {
      const otherPromises = otherImages.map(src => 
        preloadImage(src, options).catch(err => {
          logger.warn('PRELOAD', `图片加载失败: ${src}`, err);
          return null;
        })
      );
      
      promises.push(Promise.all(otherPromises));
    }
    
    // 合并结果
    const combinedResults = await Promise.all(promises);
    results = combinedResults.flat().filter(Boolean);
    
    const successCount = results.length;
    const duration = Date.now() - start;
    
    logger.info('PRELOAD', `${priority}优先级图片加载完成: ${successCount}/${images.length}张, 用时${duration}ms`);
    
    // 更新状态为已完成
    preloadStatus[priority] = 'completed';
  } catch (error) {
    logger.error('PRELOAD', `${priority}优先级图片加载出错:`, error);
    preloadStatus[priority] = 'error';
    
    // 返回已成功加载的图片
    results = [];
  }
  
  return results;
}

/**
 * 分阶段预加载所有图片
 * @param {boolean} immediate 是否立即开始所有优先级
 * @returns {Promise} 处理函数
 */
export function preloadAllImagesProgressively(immediate = false) {
  return new Promise(async (resolve) => {
    try {
      // 立即加载关键图片
      const criticalResults = await preloadImagesWithTracking(
        PRELOAD_IMAGES.critical, 
        'critical',
        { timeout: 3000 }
      );
      
      // 高优先级图片
      let highPromise;
      if (immediate) {
        highPromise = preloadImagesWithTracking(
          PRELOAD_IMAGES.high, 
          'high',
          { timeout: 5000 }
        );
      } else {
        // 延迟200ms再加载高优先级图片
        highPromise = new Promise(resolve => {
          setTimeout(() => {
            preloadImagesWithTracking(
              PRELOAD_IMAGES.high, 
              'high',
              { timeout: 5000 }
            ).then(resolve);
          }, 200);
        });
      }
      
      // 中优先级图片 - 延迟加载
      let mediumPromise;
      if (immediate) {
        mediumPromise = preloadImagesWithTracking(
          PRELOAD_IMAGES.medium, 
          'medium',
          { timeout: 8000 }
        );
      } else {
        mediumPromise = new Promise(resolve => {
          setTimeout(() => {
            preloadImagesWithTracking(
              PRELOAD_IMAGES.medium, 
              'medium',
              { timeout: 8000 }
            ).then(resolve);
          }, 500);
        });
      }
      
      // 低优先级图片 - 更长的延迟
      let lowPromise;
      if (immediate) {
        lowPromise = preloadImagesWithTracking(
          PRELOAD_IMAGES.low, 
          'low',
          { timeout: 10000 }
        );
      } else {
        lowPromise = new Promise(resolve => {
          setTimeout(() => {
            preloadImagesWithTracking(
              PRELOAD_IMAGES.low, 
              'low',
              { timeout: 10000 }
            ).then(resolve);
          }, 1000);
        });
      }
      
      // 等待所有图片加载完成
      const [highResults, mediumResults, lowResults] = await Promise.all([
        highPromise,
        mediumPromise,
        lowPromise
      ]);
      
      // 合并所有结果
      const allResults = [
        ...criticalResults,
        ...highResults,
        ...mediumResults,
        ...lowResults
      ];
      
      logger.info('PRELOAD', `所有图片预加载完成: 共${allResults.length}张`);
      resolve(allResults);
    } catch (error) {
      logger.error('PRELOAD', '图片预加载过程出错:', error);
      // 即使发生错误也视为完成
      resolve([]);
    }
  });
}

/**
 * 启动应用时预加载关键图片
 * 可以在应用启动时调用
 */
export function preloadCriticalImages() {
  return preloadImagesWithTracking(
    PRELOAD_IMAGES.critical.concat(PRELOAD_IMAGES.high), 
    'critical',
    { timeout: 5000 }
  );
}

/**
 * 获取预加载状态
 * @returns {object} 包含各优先级加载状态的对象
 */
export function getPreloadStatus() {
  return { ...preloadStatus };
}

// 预加载用户引导图片
export function preloadGuideImages() {
  // 合并所有引导相关图片
  const guideImages = [
    ...PRELOAD_IMAGES.high.filter(src => src.includes('/guide/')),
    ...PRELOAD_IMAGES.medium.filter(src => src.includes('/guide/')),
    ...PRELOAD_IMAGES.low.filter(src => src.includes('/guide/'))
  ];
  
  return preloadImagesWithTracking(guideImages, 'guide', { 
    timeout: 8000,
    concurrentLimit: 2
  });
}

/**
 * 预加载特定分组的图片
 * @param {string} group 图片分组名称
 * @returns {Promise} 该分组所有图片加载的Promise
 */
export function preloadImageGroup(group) {
  const groupMap = {
    'logo': PRELOAD_IMAGES.critical.filter(src => src.includes('logo')),
    'onboarding': [
      './src/assets/onboarding-welcome.svg',
      './src/assets/onboarding-complete.svg'
    ],
    'guide': [
      '/guide/welcome.svg',
      '/guide/params.svg',
      '/guide/generate.svg',
      '/guide/save.svg',
      '/guide/customize.svg',
      '/guide/settings.svg'
    ]
  };
  
  return preloadImagesWithTracking(groupMap[group] || [], group, {
    timeout: 5000,
    concurrentLimit: 2
  });
}

export default {
  preloadAllImagesProgressively,
  preloadImageGroup,
  preloadCriticalImages,
  preloadGuideImages,
  getPreloadStatus
}; 