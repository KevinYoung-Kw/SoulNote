/**
 * AI服务 - 使用模块化重构
 * 
 * 1.2.0版本开始弃用直接在此文件实现的方式，改为使用模块化组织代码
 * 请使用 import { generateNoteContent } from './modules' 方式引入
 */

// 导出所有模块化功能
export * from './modules/index.js';

// 保持向后兼容
import { 
  generateNoteContent as moduleGenerateNoteContent,
  getEstimatedResponseTime as moduleGetEstimatedResponseTime
} from './modules/index.js';

// 导出主要功能
export const generateNoteContent = moduleGenerateNoteContent;
export const getEstimatedResponseTime = moduleGetEstimatedResponseTime;

console.info('aiService.js: 模块化重构完成，请使用 import from "./modules" 方式引入最新功能');
