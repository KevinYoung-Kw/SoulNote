const { zodiacMap } = require('./constants.js');
const { getThemePrompt, getThemeWordLimit } = require('./themeUtils.js');
const { getTimeContext } = require('./timeUtils.js');
const { 
  getZodiacTraits, 
  getMbtiTraits, 
  getGenderLabel, 
  getAgeLabel, 
  getRelationshipLabel,
  getGenderTraits, 
  getAgeTraits, 
  getRelationshipTraits,
  getPersonalityInsights
} = require('./personalityUtils.js');
const { getZodiacFortune } = require('./fortuneUtils.js');

/**
 * 构建提示词
 * @param {Object} params 生成参数
 * @param {function} debugLog 调试日志函数
 * @returns {Promise<string>} 完整的提示词
 */
async function buildPrompt(params, debugLog = () => {}) {
  // 获取中文星座名称
  const zodiacChinese = zodiacMap[params.zodiac] || '未知星座';
  const mbtiType = params.mbti || 'MBTI类型';
  
  // 处理表情输入 - 支持多个表情
  let moodInput = '';
  if (params.moods && params.moods.length > 0) {
    moodInput = params.moods.join('');
  } else if (params.mood) {
    // 兼容旧版单个表情
    moodInput = params.mood;
  } else {
    moodInput = '平静';
  }
  
  // 获取性别、年龄和感情状况标签
  const genderLabel = getGenderLabel(params.gender);
  const ageLabel = getAgeLabel(params.age);
  const relationshipLabel = getRelationshipLabel(params.relationship);
  
  // 获取性别、年龄和感情状况特质
  const genderTraits = getGenderTraits(params.gender);
  const ageTraits = getAgeTraits(params.age);
  const relationshipTraits = getRelationshipTraits(params.relationship);
  
  // 获取时间上下文
  const { formattedTime, timeContext } = getTimeContext(params.savageMode);
  
  // 星座和MBTI性格特点详细信息
  const zodiacTraits = getZodiacTraits(params.zodiac);
  const mbtiTraits = getMbtiTraits(mbtiType);
  
  // 添加性格特质的具体表现方式
  const personalityInsights = getPersonalityInsights(params.zodiac, mbtiType);
  
  // 获取主题相关提示词配置
  const themePrompt = getThemePrompt(params.theme, params.savageMode);
  const themeWordLimit = getThemeWordLimit(params.theme, params.language);
  
  // 构建基础提示词，引导AI进行深度思考过程
  let basePrompt = `我需要你为一个${params.savageMode ? '关系亲密的死党' : '真实的朋友'}写一条简短的${params.language === 'en-zh' ? '中英双语' : ''}${themePrompt.title}。
  
  # 核心指导
  你需要深入理解用户发送的表情组合"${moodInput}"表达的是什么心情或场景，这是你回应的核心基础。通过创造性连接和发散思考，推测这个人当下可能经历的具体情境，然后结合星座特质和MBTI特点来构建个性化回应。目标是让对方感觉"这个人真的懂我"，仿佛你能看透对方当前的处境和感受。`;
  
  // 添加多表情解读指南
  if ((params.moods && params.moods.length > 1) || (moodInput.length > 2)) {
    basePrompt += `
    
  ## 多表情组合解读指南
  用户输入了多个表情："${moodInput}"，这可能表达了一个复杂场景或情绪状态。例如：
  - "🌧️😭" 可能表示"雨天心情低落"或"遭遇失败挫折"
  - "🎉🍻🎂" 可能表示"生日聚会"或"庆祝活动"
  - "💼💻😫" 可能表示"工作压力大"或"职场疲惫"
  - "✈️🏝️😎" 可能表示"度假心情"或"旅行放松"
  
  请先分析这组表情可能共同表达的场景或心情，再结合用户的性格特点给予回应。`;
  }

  basePrompt += `
  ## 关于这个朋友的详细信息：
  - 性别：${genderLabel}，特点：${genderTraits}
  - 年龄：${ageLabel}，特点：${ageTraits}
  - 感情状况：${relationshipLabel}，特点：${relationshipTraits}
  - 星座：${zodiacChinese}，核心特质：${zodiacTraits}
  - MBTI：${mbtiType}，关键特点：${mbtiTraits}
  - 当前心情/场景表达：${moodInput} 
  
  ## 这个人的性格行为表现:
  ${personalityInsights}
  
  ## 当前环境与时间情境（用于情境推测与建议）:
  - 当前时间：${formattedTime}，${timeContext.period}时分
  - 当前日期：星期${timeContext.dateInfo.weekDay}，${timeContext.dateInfo.dayType}
  - 农历日期：${timeContext.dateInfo.lunarDate}，${timeContext.dateInfo.animal}年
  - 今日节日/节气：${timeContext.dateInfo.festivals.join('、')}
  - 这个时段人们通常在做：${timeContext.activities.join('、')}
  - 这个时段人们通常关心：${timeContext.concerns.join('、')}`;
  
  // 定义一个变量来保存运势数据，使其在整个函数作用域内可访问
  let fortune = null;
  
  // 如果启用了运势功能，获取并添加运势信息
  if (params.enableFortune && params.fortuneAspect) {
    try {
      fortune = await getZodiacFortune(params.zodiac, params.fortuneAspect, debugLog);
      const fortuneType = params.fortuneAspect === 'overall' ? '整体' : 
                          params.fortuneAspect === 'love' ? '爱情' :
                          params.fortuneAspect === 'career' ? '事业' : '财运';
      
      basePrompt += `
  
  ## 今日${zodiacChinese}${fortuneType}运势：
  - 评分：${fortune.selected.rating}
  - 详情：${fortune.selected.content}`;
    } catch (error) {
      console.error('获取运势失败，继续执行不含运势的提示词:', error);
      // 运势获取失败时设置默认值
      fortune = {
        selected: {
          rating: '★★★☆☆',
          content: '今日运势一般，宜保持平常心。'
        }
      };
    }
  }
  
  basePrompt += `
  
  # 思考起点
  首先，我需要通过创造性思考，深入解读用户输入的"${moodInput}"可能代表的实际情境：`;
  
  // 添加主题特定的写作要求
  basePrompt += `
  
  ## 写作要求(${params.savageMode ? '毒舌' : '温暖'}${themePrompt.title}模式):
  1. 字数：${themeWordLimit}
  2. 语气：${params.savageMode ? '犀利讽刺' : '温暖亲切'}
  3. 核心目标：${params.savageMode ? '让对方"破防"，既感到尴尬又忍不住认同' : '表现出对当前心情/场景的理解，让对方感到被看见和被理解'}
  4. 限制：不直接提及星座或MBTI类型
  5. 形式：直接输出内容，不带引号或标题
  6. 特定要求：
     ${themePrompt.requirements.map(req => `- ${req}`).join('\n     ')}
  7. 风格示例：
     ${themePrompt.examples.map(ex => `- "${ex}"`).join('\n     ')}
  8. 注意事项：
     ${themePrompt.limits.map(lim => `- ${lim}`).join('\n     ')}`;
  
  // 如果启用了运势功能，添加运势相关的指导
  if (params.enableFortune && params.fortuneAspect) {
    const fortuneType = params.fortuneAspect === 'overall' ? '整体' : 
                        params.fortuneAspect === 'love' ? '爱情' :
                        params.fortuneAspect === 'career' ? '事业' : '财运';
    
    basePrompt += `
  9. 运势利用：
     - ${params.savageMode ? 
       '先简要概括今天运势，然后巧妙利用运势挖苦、讽刺、嘲笑对方' : 
       '根据今天的运势评分，给出符合对方性格的建议或提醒'}`;
  }
  
  basePrompt += `
  
  ## 思维链（请按照以下步骤进行发散思考）：`;
  
  // 根据是否启用毒舌模式，添加不同的思维链过程
  if (params.savageMode) {
    basePrompt += `
  1. 场景解读：分析表情"${moodInput}"可能表示的场景或情绪，结合${timeContext.period}时分可能在做什么
  2. 性格特点与场景交互：${zodiacChinese}和${mbtiType}类型在这种场景下的典型反应和弱点
  3. 个性化调侃构思：巧妙点明他们在这种场景中可能犯的错或有的弱点
  4. 创造犀利有共鸣的内容：让对方感到既难堪又无法反驳`;
  } else {
    basePrompt += `
  1. 场景解读：分析表情"${moodInput}"可能表示的场景或情绪，结合${timeContext.period}时分可能在做什么
  2. 性格特点与场景交互：${zodiacChinese}和${mbtiType}类型在这种场景下可能的需求和关注点
  3. 个性化关怀构思：如何自然表达理解并提供符合他们性格的支持
  4. 创造温暖而洞察的内容：让对方感觉被理解和被看见`;
  }
  
  // 如果启用了运势功能，添加运势相关的思考步骤
  if (params.enableFortune && params.fortuneAspect) {
    basePrompt += `
  5. 运势整合：${params.savageMode ? 
     '如何将今日运势中的信息转化为犀利的调侃' : 
     '如何将今日运势的建议融入到关怀中，以符合对方性格特点的方式表达'}`;
  }
  // 为haiku主题添加额外的检查步骤
  if (params.theme === 'haiku') {
    basePrompt += `
  6. 最后，需要检查生成的俳句是否符合5-7-5，即17音的结构，如果不是，则需要调整。`;
  }
  
  basePrompt += `
  
  思考完成后，请输出符合上述要求的${themePrompt.title}内容。`;
  
  return basePrompt;
}

module.exports = {
  buildPrompt
};
