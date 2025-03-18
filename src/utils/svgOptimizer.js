/**
 * SVG 优化和内联加载工具
 * 
 * 此工具提供功能来优化 SVG 以提高加载速度：
 * 1. 内联 SVG：避免额外的网络请求
 * 2. 缓存 SVG：避免重复加载
 * 3. 优化尺寸：减少不必要的属性
 */

// 用于缓存已加载的 SVG
const svgCache = new Map();

/**
 * 从 URL 加载 SVG 并返回优化后的内容
 * 
 * @param {string} url SVG 文件的 URL
 * @returns {Promise<string>} 优化后的 SVG 内容
 */
export async function loadSvg(url) {
  // 检查缓存
  if (svgCache.has(url)) {
    return svgCache.get(url);
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SVG 加载失败: ${response.statusText}`);
    }
    
    const svgText = await response.text();
    const optimizedSvg = optimizeSvg(svgText);
    
    // 存入缓存
    svgCache.set(url, optimizedSvg);
    
    return optimizedSvg;
  } catch (error) {
    console.error('SVG 加载错误:', error);
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
  // 简单的优化：移除注释、多余空格、换行符等
  let optimized = svgText
    .replace(/<!--[\s\S]*?-->/g, '') // 移除注释
    .replace(/>\s+</g, '><')         // 移除标签间的空白
    .replace(/\s{2,}/g, ' ')         // 多个空格替换为单个
    .replace(/\n/g, '')              // 移除换行符
    .replace(/\t/g, '')              // 移除制表符
    .replace(/ {2,}/g, ' ')          // 多个空格替换为单个
    .trim();
  
  return optimized;
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
 * @returns {Promise<Map<string, string>>} 优化后的 SVG 内容映射
 */
export async function preloadSvgs(urls) {
  const promises = urls.map(url => loadSvg(url));
  const results = await Promise.allSettled(promises);
  
  const optimizedMap = new Map();
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      optimizedMap.set(urls[index], result.value);
    }
  });
  
  return optimizedMap;
}

export default {
  loadSvg,
  createInlineSvg,
  preloadSvgs
}; 