/**
 * 图片预加载服务
 * 用于提前加载重要图片，减少用户等待时间
 */

// 需要预加载的图片列表
const PRELOAD_IMAGES = [
  // 应用 logo
  './src/assets/welcome-logo.svg',
  
  // 引导页图片
  './src/assets/onboarding-welcome.svg',
  './src/assets/onboarding-complete.svg',
  
  // 用户引导 SVG 图片
  '/guide/welcome.svg',
  '/guide/params.svg',
  '/guide/generate.svg',
  '/guide/save.svg',
  '/guide/customize.svg',
  '/guide/settings.svg',
  
  // 其他关键图片
  // 可以根据需要添加更多图片
];

/**
 * 预加载单张图片
 * @param {string} src 图片路径
 * @returns {Promise} 返回加载promise
 */
function preloadImage(src) {
  return new Promise((resolve, reject) => {
    // 检查文件类型
    if (src.endsWith('.svg')) {
      // 对于SVG文件，使用fetch加载
      fetch(src)
        .then(response => {
          if (!response.ok) throw new Error(`Failed to load SVG: ${src}`);
          return resolve(src);
        })
        .catch(error => reject(error));
    } else {
      // 对于其他图片类型，使用Image对象加载
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    }
  });
}

/**
 * 预加载所有指定的图片
 * @param {Array} images 图片路径数组
 * @returns {Promise} 所有图片加载的Promise
 */
export function preloadImages(images = PRELOAD_IMAGES) {
  console.log('预加载图片:', images);
  const promises = images.map(src => preloadImage(src));
  return Promise.allSettled(promises);
}

/**
 * 预加载特定分组的图片
 * @param {string} group 图片分组名称
 * @returns {Promise} 该分组所有图片加载的Promise
 */
export function preloadImageGroup(group) {
  const groupMap = {
    'logo': ['./src/assets/welcome-logo.svg'],
    'onboarding': [
      './src/assets/onboarding-welcome.svg',
      './src/assets/onboarding-complete.svg'
    ],
    'qrcode': [
      './src/assets/donate-qr.png',
      './public/assets/community-qr.png'
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
  
  return preloadImages(groupMap[group] || []);
}

/**
 * 启动应用时预加载关键图片
 * 可以在应用启动时调用
 */
export function preloadCriticalImages() {
  // 预加载logo、引导页图片和用户引导SVG等关键资源
  const criticalImages = [
    './src/assets/welcome-logo.svg',
    './src/assets/onboarding-welcome.svg',
    '/guide/welcome.svg',
    '/guide/params.svg'
  ];
  
  return preloadImages(criticalImages);
}

// 预加载用户引导图片
export function preloadGuideImages() {
  return preloadImageGroup('guide');
}

export default {
  preloadImages,
  preloadImageGroup,
  preloadCriticalImages,
  preloadGuideImages
}; 