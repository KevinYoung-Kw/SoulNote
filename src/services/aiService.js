import axios from 'axios';

// 从环境变量获取API配置
const API_URL = import.meta.env.VITE_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const API_KEY = import.meta.env.VITE_API_KEY || '';
const API_MODEL = import.meta.env.VITE_API_MODEL || 'qwen-max';

// 星座名称映射（英文到中文）
const zodiacMap = {
  'aries': '白羊座',
  'taurus': '金牛座',
  'gemini': '双子座',
  'cancer': '巨蟹座',
  'leo': '狮子座',
  'virgo': '处女座',
  'libra': '天秤座',
  'scorpio': '天蝎座',
  'sagittarius': '射手座',
  'capricorn': '摩羯座',
  'aquarius': '水瓶座',
  'pisces': '双鱼座'
};

/**
 * 使用Qwen生成心灵纸条内容
 * @param {Object} params 生成参数
 * @returns {Promise<string>} 生成的内容
 */
export async function generateNoteContent(params) {
  try {
    // 准备API请求参数
    const prompt = buildPrompt(params);
    
    // 调用Qwen API
    const response = await axios.post(`${API_URL}/chat/completions`, {
      model: API_MODEL, // 从环境变量获取模型名称
      messages: [
        {
          role: "system",
          content: "你是一位专业的心理咨询师和励志作家，擅长为不同人群创作简短温暖的正能量文案。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API请求成功，响应:', response.data);
    
    // 解析并返回内容
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content.trim();
    } else {
      console.warn('API响应格式异常:', response.data);
      throw new Error('API响应中未包含生成内容');
    }
  } catch (error) {
    console.error('生成内容失败:', error.response?.data || error.message);
    // 失败时使用本地生成
    return generateLocalContent(params);
  }
}

/**
 * 构建提示词
 * @param {Object} params 生成参数
 * @returns {string} 完整的提示词
 */
function buildPrompt(params) {
  // 获取中文星座名称
  const zodiacChinese = zodiacMap[params.zodiac] || '未知星座';
  const mbtiType = params.mbti || 'MBTI类型';
  const mood = params.mood || '平静';
  const timeOfDay = getTimeOfDay();
  
  // 根据语言选择构建不同的提示词
  if (params.language === 'en-zh') {
    return `请为一位${zodiacChinese}、${mbtiType}性格特点的人，创作一段简短的中英双语心灵鼓励短文。
    当前心情/场景：${mood}
    当前时段：${timeOfDay}
    
    要求：
    1. 先输出中文，然后输出对应的英文翻译
    2. 中文20-50字左右，然后换行，输出对应翻译的英文
    3. 内容温暖积极，有治愈感，避免陈词滥调
    4. 文风简洁有力，能引起共鸣
    5. 不要带任何标题、引言或额外说明
    6. 直接输出正文内容，不要带引号`;
  } else {
    return `请为一位${zodiacChinese}、${mbtiType}性格特点的人，创作一段简短的心灵鼓励短文。
    当前心情/场景：${mood}
    当前时段：${timeOfDay}
    
    要求：
    1. 内容20-50字左右
    2. 内容温暖积极，有治愈感，避免陈词滥调
    3. 文风简洁有力，能引起共鸣
    4. 不要带任何标题、引言或额外说明
    5. 直接输出正文内容，不要带引号`;
  }
}

/**
 * 获取当前时段
 * @returns {string} 时段描述
 */
function getTimeOfDay() {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 9) {
    return '早晨';
  } else if (hour >= 9 && hour < 12) {
    return '上午';
  } else if (hour >= 12 && hour < 14) {
    return '中午';
  } else if (hour >= 14 && hour < 18) {
    return '下午';
  } else if (hour >= 18 && hour < 22) {
    return '晚上';
  } else {
    return '深夜';
  }
}

/**
 * 备用方案：本地生成内容（API不可用时）
 * @param {Object} params 生成参数
 * @returns {string} 生成的内容
 */
export function generateLocalContent(params) {
  const zodiacChinese = zodiacMap[params.zodiac] || '未知星座';
  
  const templates = [
    "没有谁的人生是一帆风顺的，%zodiac%的你总是勇敢面对挑战，%mood%的状态正是内心强大的体现。",
    "作为%mbti%性格的%zodiac%座，你独特的思考方式正是你最大的优势，保持%mood%，继续前行。",
    "%timeOfDay%好，%zodiac%的朋友！今天的%mood%状态将为你带来意想不到的惊喜，保持开放的心态。",
    "身为%mbti%的你，有着常人难以企及的%zodiac%特质，%mood%的心情是你强大内心的映射。",
    "每一个%zodiac%都有自己独特的光芒，%mbti%的思维模式让你与众不同，今天的%mood%将引领你走向成功。"
  ];
  
  // 随机选择一个模板
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // 替换模板中的变量
  return template
    .replace('%zodiac%', zodiacChinese)
    .replace('%mbti%', params.mbti || 'MBTI类型')
    .replace('%mood%', params.mood || '当前')
    .replace('%timeOfDay%', getTimeOfDay());
}
