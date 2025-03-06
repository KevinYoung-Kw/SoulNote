import axios from 'axios';

// 实际应用中应从环境变量或安全配置获取，这里仅作示例
const API_URL = import.meta.env.VITE_API_URL || 'https://api.example.com'; 
const API_KEY = import.meta.env.VITE_API_KEY || '';

export async function generateNoteContent(params) {
  try {
    // 此处使用API代理接口，避免客户端直接暴露API密钥
    const response = await axios.post(`${API_URL}/generate`, {
      params: {
        zodiac: params.zodiac,
        mbti: params.mbti,
        mood: params.mood,
        timeOfDay: getTimeOfDay(),
        language: params.language || 'zh'
      }
    });
    
    return response.data.content;
  } catch (error) {
    console.error('生成内容失败:', error);
    throw error;
  }
}

// 获取当前时段
function getTimeOfDay() {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 11) {
    return '早晨';
  } else if (hour >= 11 && hour < 13) {
    return '中午';
  } else if (hour >= 13 && hour < 18) {
    return '下午';
  } else if (hour >= 18 && hour < 22) {
    return '晚上';
  } else {
    return '深夜';
  }
}

// 备用方案：本地生成内容（API不可用时）
export function generateLocalContent(params) {
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
    .replace('%zodiac%', params.zodiac || '星座')
    .replace('%mbti%', params.mbti || 'MBTI类型')
    .replace('%mood%', params.mood || '当前')
    .replace('%timeOfDay%', getTimeOfDay());
}
