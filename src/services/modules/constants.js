// 星座名称映射（英文到中文）
export const zodiacMap = {
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

// 模型响应时间记录
export const modelResponseTimes = {
  'qwen-max': 2000,  // 预估值，单位ms
  'qwen-plus': 1500,
  'qwen-turbo': 1000,
  'deepseek-r1': 20000,
  'default': 3000
};

// 主题常量定义
export const THEMES = {
  CHAT: 'chat',         // 聊天风格（默认）
  APHORISM: 'aphorism', // 箴言/格言风格
  POETRY: 'poetry',     // 诗歌风格
  HAIKU: 'haiku'        // 俳句风格
};

// 主题相关配置
export const themeConfigs = {
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
    description: '简短有哲理的格言',
    wordLimitZh: '15-30字',
    wordLimitEn: '20-40 words',
    style: '深刻凝练，蕴含哲理，启迪思考',
    keywords: ['智慧', '洞察', '哲理', '思考'],
  },
  [THEMES.POETRY]: {
    title: '诗歌',
    description: '有韵律和意境的诗句',
    wordLimitZh: '30-60字',
    wordLimitEn: '40-80 words',
    style: '富有诗意，使用意象和隐喻，有韵律感',
    keywords: ['诗意', '韵律', '意境', '比喻'],
  },
  [THEMES.HAIKU]: {
    title: '俳句',
    description: '简短精练的现代生活俳句',
    wordLimitZh: '严格遵循5-7-5音节结构，共17字',
    wordLimitEn: 'Follows the 5-7-5 syllable structure, total 17 syllables',
    style: '简约直白，反映日常生活，捕捉人的情感和互动',
    keywords: ['现代', '生活', '情感', '互动', '简练'],
  }
};
