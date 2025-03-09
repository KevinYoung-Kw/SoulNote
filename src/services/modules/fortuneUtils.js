import { zodiacMap } from './constants';

/**
 * 获取星座运势信息
 * @param {string} zodiacParam 星座索引(0-11)或英文名称
 * @param {string} aspect 运势方面(overall|love|career|wealth)
 * @param {function} debugLog 调试日志函数
 * @returns {Promise<Object>} 星座运势信息
 */
export async function getZodiacFortune(zodiacParam, aspect = 'overall', debugLog = () => {}) {
  try {
    // 如果传入的是星座英文名称，需要转换为索引
    let zodiacIndex = zodiacParam;
    if (typeof zodiacParam === 'string' && isNaN(zodiacParam)) {
      const zodiacNames = Object.keys(zodiacMap);
      zodiacIndex = zodiacNames.indexOf(zodiacParam.toLowerCase());
      if (zodiacIndex === -1) zodiacIndex = 0; // 默认为白羊座
    }
    
    // 确保索引在有效范围内(0-11)
    zodiacIndex = Math.max(0, Math.min(11, parseInt(zodiacIndex)));
    
    // 尝试从本地缓存读取数据
    let astroData;
    try {
      // 导入cached数据 - 在生产环境中要确保这个文件会被正确打包
      const cacheModule = await import('../../../astro_api/astro_cache.json');
      astroData = cacheModule.default || cacheModule;
      
      debugLog('fortune', '从本地缓存加载星座运势数据');
    } catch (cacheError) {
      console.error('无法加载星座运势缓存:', cacheError);
      throw new Error('星座运势缓存不可用');
    }
    
    // 检查是否有对应星座的数据
    if (!astroData[zodiacIndex]) {
      throw new Error(`缓存中没有星座索引${zodiacIndex}的数据`);
    }
    
    // 检查数据是否是今天的
    const today = new Date().toISOString().split('T')[0];
    if (astroData[zodiacIndex].date !== today) {
      console.warn(`星座运势数据不是最新的. 缓存日期: ${astroData[zodiacIndex].date}, 今天: ${today}`);
      // 注意：在实际应用中可能需要更新缓存，但由于是前端应用，这里只发出警告
    }
    
    // 解析数据
    const items = astroData[zodiacIndex].items || [];
    const fortuneData = {
      title: astroData[zodiacIndex].title || `今日${zodiacMap[Object.keys(zodiacMap)[zodiacIndex]]}运势`,
      overall: { rating: '★★★☆☆', content: '今日运势一般，保持平常心。' },
      love: { rating: '★★★☆☆', content: '感情上需要多一些理解和包容。' },
      career: { rating: '★★★☆☆', content: '工作中可能会遇到一些挑战，但总体平稳。' },
      wealth: { rating: '★★★☆☆', content: '财务状况稳定，避免不必要的支出。' }
    };
    
    // 调试输出完整数据
    debugLog('fortune', { items: items });
    
    // 改进的运势解析逻辑
    let currentCategory = null;
    
    for (let i = 0; i < items.length; i++) {
      const currentItem = items[i].trim();
      
      // 跳过空行
      if (!currentItem) continue;
      
      // 检查是否是运势类别行
      if (currentItem.includes('整體運勢') || currentItem.includes('整体运势')) {
        currentCategory = 'overall';
        // 提取星级评分
        const ratingMatch = currentItem.match(/[★☆]+/);
        if (ratingMatch) {
          fortuneData.overall.rating = ratingMatch[0];
        }
        
        // 检查是否同一行包含内容描述
        const contentMatch = currentItem.split(/[：:]/);
        if (contentMatch.length > 1 && contentMatch[1].trim()) {
          fortuneData.overall.content = contentMatch[1].trim();
        }
      } 
      else if (currentItem.includes('愛情運勢') || currentItem.includes('爱情运势')) {
        currentCategory = 'love';
        // 提取星级评分
        const ratingMatch = currentItem.match(/[★☆]+/);
        if (ratingMatch) {
          fortuneData.love.rating = ratingMatch[0];
        }
        
        // 检查是否同一行包含内容描述
        const contentMatch = currentItem.split(/[：:]/);
        if (contentMatch.length > 1 && contentMatch[1].trim()) {
          fortuneData.love.content = contentMatch[1].trim();
        }
      } 
      else if (currentItem.includes('事業運勢') || currentItem.includes('事业运势')) {
        currentCategory = 'career';
        // 提取星级评分
        const ratingMatch = currentItem.match(/[★☆]+/);
        if (ratingMatch) {
          fortuneData.career.rating = ratingMatch[0];
        }
        
        // 检查是否同一行包含内容描述
        const contentMatch = currentItem.split(/[：:]/);
        if (contentMatch.length > 1 && contentMatch[1].trim()) {
          fortuneData.career.content = contentMatch[1].trim();
        }
      } 
      else if (currentItem.includes('財運運勢') || currentItem.includes('财运运势')) {
        currentCategory = 'wealth';
        // 提取星级评分
        const ratingMatch = currentItem.match(/[★☆]+/);
        if (ratingMatch) {
          fortuneData.wealth.rating = ratingMatch[0];
        }
        
        // 检查是否同一行包含内容描述
        const contentMatch = currentItem.split(/[：:]/);
        if (contentMatch.length > 1 && contentMatch[1].trim()) {
          fortuneData.wealth.content = contentMatch[1].trim();
        }
      } 
      else if (currentCategory) {
        // 当前行不是类别标题，而是内容描述
        // 只有当前一行没有提取到描述内容时，才使用这一行作为描述
        if (currentCategory === 'overall' && fortuneData.overall.content === '今日运势一般，保持平常心。') {
          fortuneData.overall.content = currentItem;
        } 
        else if (currentCategory === 'love' && fortuneData.love.content === '感情上需要多一些理解和包容。') {
          fortuneData.love.content = currentItem;
        } 
        else if (currentCategory === 'career' && fortuneData.career.content === '工作中可能会遇到一些挑战，但总体平稳。') {
          fortuneData.career.content = currentItem;
        } 
        else if (currentCategory === 'wealth' && fortuneData.wealth.content === '财务状况稳定，避免不必要的支出。') {
          fortuneData.wealth.content = currentItem;
        }
        // 处理完内容后重置当前类别，避免后续行被误识别为同一类别的内容
        currentCategory = null;
      }
    }
    
    // 调试输出解析结果
    debugLog('fortune', { parsedData: fortuneData });
    
    // 返回指定方面的运势或整体运势
    return {
      all: fortuneData,
      selected: aspect === 'overall' ? fortuneData.overall : 
                aspect === 'love' ? fortuneData.love :
                aspect === 'career' ? fortuneData.career : 
                aspect === 'wealth' ? fortuneData.wealth : fortuneData.overall
    };
  } catch (error) {
    console.error('获取星座运势失败:', error.message || error);
    
    // 返回默认运势，避免整个流程中断
    const zodiacName = typeof zodiacParam === 'string' && isNaN(zodiacParam) ? 
                      zodiacParam.toLowerCase() : 
                      Object.keys(zodiacMap)[typeof zodiacParam === 'string' ? 0 : zodiacParam];
    
    // 创建更丰富的默认运势内容
    const defaultFortuneContent = {
      overall: `今日运势一般，宜保持平常心。适合做好规划，避免冲动决策。`,
      love: `感情上需要多一些理解和包容。沟通是关键，耐心倾听对方的想法。`,
      career: `工作中可能会遇到一些挑战，但总体平稳。合理安排任务优先级，避免分心。`,
      wealth: `财务状况稳定，避免不必要的支出。适合做长期投资规划，不宜冲动消费。`
    };
    
    return {
      all: {
        title: `今日${zodiacMap[zodiacName] || '星座'}运势`,
        overall: { rating: '★★★☆☆', content: defaultFortuneContent.overall },
        love: { rating: '★★★☆☆', content: defaultFortuneContent.love },
        career: { rating: '★★★☆☆', content: defaultFortuneContent.career },
        wealth: { rating: '★★★☆☆', content: defaultFortuneContent.wealth }
      },
      selected: { 
        rating: '★★★☆☆', 
        content: defaultFortuneContent[aspect] || defaultFortuneContent.overall 
      }
    };
  }
}
