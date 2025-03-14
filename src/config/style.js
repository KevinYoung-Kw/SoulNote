// 字体大小配置
export const FONT_SIZE_CONFIG = {
  MIN: 8,
  MAX: 36,
  DEFAULT: {
    SMALL_DEVICE: 18,  // 极小设备 (< 768px)
    MEDIUM_DEVICE: 24, // 一般设备 (768px - 1024px)
    LARGE_DEVICE: 32,  // 特大设备 (> 1024px)
  }
};

// 设备尺寸断点
export const DEVICE_BREAKPOINTS = {
  SMALL: 385,   // 小于768px为小设备
  MEDIUM: 765, // 768px-1024px为中等设备
  // 大于1024px为大设备
};

// 获取基于设备尺寸的默认字体大小
export function getDefaultFontSize() {
  const width = window.innerWidth;
  
  if (width < DEVICE_BREAKPOINTS.SMALL) {
    return FONT_SIZE_CONFIG.DEFAULT.SMALL_DEVICE;
  } else if (width < DEVICE_BREAKPOINTS.MEDIUM) {
    return FONT_SIZE_CONFIG.DEFAULT.MEDIUM_DEVICE;
  } else {
    return FONT_SIZE_CONFIG.DEFAULT.LARGE_DEVICE;
  }
} 