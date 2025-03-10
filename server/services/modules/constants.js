/**
 * 服务端常量定义
 */

// AI模型响应时间评估 (毫秒)
const ESTIMATED_RESPONSE_TIMES = {
  'qwen-max': 5000,
  'qwen-plus': 3000,
  'qwen-turbo': 1000,
  'deepseek-r1': 20000,
  'default': 3000
};

// 主题常量定义
const THEMES = {
  CHAT: 'chat',         // 聊天风格（默认）
  APHORISM: 'aphorism', // 箴言/格言风格
  POETRY: 'poetry',     // 诗歌风格
  HAIKU: 'haiku'        // 俳句风格
};

// 主题相关配置
const themeConfigs = {
  [THEMES.CHAT]: {
    title: '聊天',
    description: '如朋友间自然对话',
    wordLimitZh: '20-50字',
    wordLimitEn: '30-70 words',
    style: '亲切自然，日常口语表达',
    keywords: ['聊天', '对话', '交流'],
  },
  [THEMES.APHORISM]: {
    title: '箴言',
    description: '简短而有哲理的句子',
    wordLimitZh: '15-30字',
    wordLimitEn: '20-50 words',
    style: '简洁有力，富含哲理',
    keywords: ['箴言', '格言', '哲理'],
  },
  [THEMES.POETRY]: {
    title: '诗歌',
    description: '优美的诗歌形式',
    wordLimitZh: '30-60字',
    wordLimitEn: '40-80 words',
    style: '意象丰富，有韵律感',
    keywords: ['诗歌', '诗句', '意境'],
  },
  [THEMES.HAIKU]: {
    title: '俳句',
    description: '简短的日式诗歌',
    wordLimitZh: '17字左右',
    wordLimitEn: '17 syllables',
    style: '简短精炼，意境深远',
    keywords: ['俳句', '短诗', '禅意'],
  }
};

// 星座映射表
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

module.exports = {
  ESTIMATED_RESPONSE_TIMES,
  THEMES,
  themeConfigs,
  zodiacMap
};
