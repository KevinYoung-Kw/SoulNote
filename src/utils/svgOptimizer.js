/**
 * SVG 优化和内联加载工具
 * 
 * 此工具提供功能来优化 SVG 以提高加载速度：
 * 1. 内联 SVG：避免额外的网络请求
 * 2. 缓存 SVG：避免重复加载
 * 3. 优化尺寸：减少不必要的属性
 * 4. 渐进式加载：提供更好的用户体验
 */

// 用于缓存已加载的 SVG
const svgCache = new Map();

// 扩展缓存系统，也使用localStorage作为持久化存储
const CACHE_PREFIX = 'svg_cache_';
const CACHE_VERSION = 'v1';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1小时过期

/**
 * 从持久化存储加载SVG缓存
 */
function loadCacheFromStorage() {
  try {
    // 尝试找出所有缓存的SVG键
    const cacheKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        cacheKeys.push(key);
      }
    }
    
    // 遍历并加载到内存缓存
    cacheKeys.forEach(key => {
      try {
        const rawData = localStorage.getItem(key);
        if (!rawData) return;
        
        const data = JSON.parse(rawData);
        
        // 检查缓存版本和过期时间
        if (
          data.version === CACHE_VERSION && 
          data.timestamp && 
          (Date.now() - data.timestamp < CACHE_EXPIRY)
        ) {
          // 提取实际URL并设置内存缓存
          const url = key.substring(CACHE_PREFIX.length);
          svgCache.set(url, data.content);
        } else {
          // 清除过期的缓存
          localStorage.removeItem(key);
        }
      } catch (e) {
        console.warn('SVG缓存解析错误，清除该缓存项', e);
        localStorage.removeItem(key);
      }
    });
    
    console.log(`已从localStorage加载 ${svgCache.size} 个SVG缓存`);
  } catch (error) {
    console.error('从localStorage加载SVG缓存失败', error);
  }
}

/**
 * 保存SVG到持久化存储
 * @param {string} url SVG文件的URL
 * @param {string} content 优化后的SVG内容
 */
function saveCacheToStorage(url, content) {
  try {
    // 创建缓存对象
    const cacheObj = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      content
    };
    
    // 保存到localStorage
    localStorage.setItem(`${CACHE_PREFIX}${url}`, JSON.stringify(cacheObj));
  } catch (error) {
    console.warn('保存SVG到localStorage失败', error);
  }
}

/**
 * 从 URL 加载 SVG 并返回优化后的内容
 * 
 * @param {string} url SVG 文件的 URL
 * @param {object} options 加载选项
 * @returns {Promise<string>} 优化后的 SVG 内容
 */
export async function loadSvg(url, options = {}) {
  // 设置默认选项
  const opts = {
    useCache: true,
    saveToPersistentCache: true,
    timeout: 5000,
    retries: 2,
    ...options
  };
  
  // 首先检查内存缓存
  if (opts.useCache && svgCache.has(url)) {
    return svgCache.get(url);
  }
  
  let retryCount = 0;
  
  const fetchWithTimeout = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), opts.timeout);
    
    try {
      const response = await fetch(url, { 
        signal: controller.signal,
        cache: 'force-cache' // 使用浏览器缓存
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`SVG 加载失败: ${response.statusText}`);
      }
      
      const svgText = await response.text();
      const optimizedSvg = optimizeSvg(svgText);
      
      // 存入内存缓存
      if (opts.useCache) {
        svgCache.set(url, optimizedSvg);
      }
      
      // 保存到持久化缓存
      if (opts.saveToPersistentCache) {
        saveCacheToStorage(url, optimizedSvg);
      }
      
      return optimizedSvg;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // 重试逻辑
      if (error.name === 'AbortError') {
        if (retryCount < opts.retries) {
          retryCount++;
          console.warn(`SVG 加载超时，进行第 ${retryCount} 次重试: ${url}`);
          return fetchWithTimeout(); // 递归重试
        } else {
          throw new Error(`SVG 加载超时（已重试${opts.retries}次）: ${url}`);
        }
      }
      
      throw error;
    }
  };
  
  try {
    return await fetchWithTimeout();
  } catch (error) {
    console.error('SVG 加载错误:', error, url);
    return null;
  }
}

/**
 * 优化 SVG 内容
 * 
 * @param {string} svgText 原始 SVG 文本
 * @returns {string} 优化后的 SVG
 */
function optimizeSvg(svgText) {
  if (!svgText) return null;
  
  try {
    // 更强的优化
    let optimized = svgText
      .replace(/<!--[\s\S]*?-->/g, '') // 移除注释
      .replace(/>\s+</g, '><')         // 移除标签间的空白
      .replace(/\s{2,}/g, ' ')         // 多个空格替换为单个
      .replace(/\n/g, '')              // 移除换行符
      .replace(/\t/g, '')              // 移除制表符
      .replace(/ {2,}/g, ' ')          // 多个空格替换为单个
      .replace(/\s*fill="(none|#[0-9a-fA-F]{3,6})"\s*/g, ' fill="$1" ') // 标准化填充属性
      .replace(/\s*stroke="(none|#[0-9a-fA-F]{3,6})"\s*/g, ' stroke="$1" ') // 标准化描边属性
      .trim();
    
    // 确保SVG具有viewport属性
    if (!optimized.includes('viewBox') && 
        (optimized.includes('width=') || optimized.includes('height='))) {
      // 提取宽度和高度
      const widthMatch = optimized.match(/width="([^"]+)"/);
      const heightMatch = optimized.match(/height="([^"]+)"/);
      
      if (widthMatch && heightMatch) {
        const width = parseFloat(widthMatch[1]);
        const height = parseFloat(heightMatch[1]);
        
        if (!isNaN(width) && !isNaN(height)) {
          // 插入viewBox
          optimized = optimized.replace(/<svg/, `<svg viewBox="0 0 ${width} ${height}"`);
        }
      }
    }
    
    return optimized;
  } catch (error) {
    console.error('SVG优化失败:', error);
    return svgText; // 如果优化失败，返回原始内容
  }
}

/**
 * 创建可在 Vue 组件中使用的内联 SVG
 * 
 * @param {string} svgContent SVG 内容
 * @returns {object} 包含 __html 属性的对象，可用于 v-html
 */
export function createInlineSvg(svgContent) {
  return { __html: svgContent };
}

/**
 * 预加载和优化 SVG 图像
 * 
 * @param {string[]} urls SVG URL 数组
 * @param {object} options 加载选项
 * @returns {Promise<Map<string, string>>} 优化后的 SVG 内容映射
 */
export async function preloadSvgs(urls, options = {}) {
  // 并发控制，避免一次性请求过多
  const concurrentLimit = options.concurrentLimit || 3;
  const optimizedMap = new Map();
  const chunks = [];
  
  // 分块处理URL
  for (let i = 0; i < urls.length; i += concurrentLimit) {
    chunks.push(urls.slice(i, i + concurrentLimit));
  }
  
  // 逐块处理
  for (const chunk of chunks) {
    const promises = chunk.map(url => loadSvg(url, options));
    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        optimizedMap.set(chunk[index], result.value);
      }
    });
    
    // 给浏览器一些喘息空间
    if (chunks.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  return optimizedMap;
}

/**
 * 将SVG转换为PNG图像数据URL
 * 
 * @param {string} svgContent SVG内容或路径
 * @param {object} options 转换选项
 * @returns {Promise<string>} 返回PNG格式的dataURL
 */
export async function convertSvgToImageUrl(svgContent, options = {}) {
  try {
    const opts = {
      width: 800,  // 默认宽度
      height: 800, // 默认高度
      scale: 2,    // 默认缩放比例，提高清晰度
      quality: 1,  // 默认最高质量
      background: null, // 背景色，null为透明
      ...options
    };
    
    // 判断输入是SVG内容还是URL
    let svg = svgContent;
    if (typeof svgContent === 'string' && (svgContent.includes('http://') || svgContent.includes('https://') || svgContent.startsWith('/'))) {
      svg = await loadSvg(svgContent);
      if (!svg) {
        throw new Error('无法加载SVG');
      }
    }
    
    // 创建SVG BLOB
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const svgUrl = URL.createObjectURL(svgBlob);
    
    // 创建Image对象
    const img = new Image();
    img.width = opts.width;
    img.height = opts.height;
    
    // 等待图像加载
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('SVG转换为图像失败'));
      img.src = svgUrl;
    });
    
    // 创建Canvas
    const canvas = document.createElement('canvas');
    canvas.width = opts.width * opts.scale;
    canvas.height = opts.height * opts.scale;
    const ctx = canvas.getContext('2d');
    
    // 设置背景色（如果有）
    if (opts.background) {
      ctx.fillStyle = opts.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // 绘制SVG
    ctx.scale(opts.scale, opts.scale);
    ctx.drawImage(img, 0, 0, opts.width, opts.height);
    
    // 释放对象URL
    URL.revokeObjectURL(svgUrl);
    
    // 转换为dataURL
    return canvas.toDataURL('image/png', opts.quality);
  } catch (error) {
    console.error('SVG转换为图像失败:', error);
    return null;
  }
}

// 初始化时从localStorage加载缓存
loadCacheFromStorage();

export default {
  loadSvg,
  createInlineSvg,
  preloadSvgs,
  convertSvgToImageUrl
}; 