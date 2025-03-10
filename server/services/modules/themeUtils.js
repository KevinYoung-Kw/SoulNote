const { THEMES, themeConfigs } = require('./constants');

/**
 * 获取特定主题的提示词模板
 * @param {string} theme 主题 ('chat'|'aphorism'|'poetry'|'haiku')
 * @param {boolean} savageMode 是否为毒舌模式
 * @returns {Object} 主题提示词模板
 */
function getThemePrompt(theme, savageMode = false) {
  // 默认使用聊天主题
  const themeKey = Object.values(THEMES).includes(theme) ? theme : THEMES.CHAT;
  const config = themeConfigs[themeKey];
  
  // 基础提示词结构
  const basePrompt = {
    title: `${savageMode ? '毒舌' : '温暖'}${config.title}`,
    requirements: [],
    examples: [],
    limits: []
  };
  
  // 根据主题和模式调整提示词
  if (themeKey === THEMES.CHAT) {
    // 聊天主题
    if (savageMode) {
      basePrompt.requirements = [
        '充分了解、洞见人性的刻薄人士',
        '尽可能用平淡的语气说出对方这个特点最不能接受的话',
        '让对方"破防"，既感到尴尬又忍不住认同'
      ];
      basePrompt.examples = [
        '又在自我感动了？你这戏精上身的样子真是让人忍俊不禁。',
        '看你纠结的样子，选择恐惧症又犯了？连点小事都拿不定主意。'
      ];
      basePrompt.limits = [
        '避免真正有害的攻击性语言',
        '保持幽默感，不要纯粹刻薄'
      ];
    } else {
      basePrompt.requirements = [
        '以朋友般亲切的语气交流',
        '体现理解和支持',
        '使用日常自然的表达'
      ];
      basePrompt.examples = [
        '看你今天这心情，是不是有什么好事想分享？记得照顾好自己。',
        '有时候慢一点没关系，按自己的节奏来，不必着急。'
      ];
      basePrompt.limits = [
        '避免说教和空洞的鸡汤',
        '不使用过于正式的语言'
      ];
    }
  } else if (themeKey === THEMES.APHORISM) {
    // 箴言主题
    if (savageMode) {
      basePrompt.requirements = [
        '用简短锐利的语句揭示人性弱点',
        '带有嘲讽或黑色幽默',
        '切中要害但包含智慧'
      ];
      basePrompt.examples = [
        '自以为看透一切，却连自己的盲点都视而不见。',
        '急于展示智慧的人，往往暴露的是自己的无知。'
      ];
      basePrompt.limits = [
        '保持格言的简练和深度',
        '虽然尖锐但要有思考价值'
      ];
    } else {
      basePrompt.requirements = [
        '简短而富有哲理的句子',
        '给人启示和思考',
        '蕴含智慧和洞察'
      ];
      basePrompt.examples = [
        '心灵的宁静不在远方，而在于如何看待眼前的风景。',
        '真正的力量不是改变外界，而是在逆境中保持内心的平静。'
      ];
      basePrompt.limits = [
        '避免陈词滥调和老生常谈',
        '不使用过于抽象难懂的表达'
      ];
    }
  } else if (themeKey === THEMES.POETRY) {
    // 诗歌主题
    if (savageMode) {
      basePrompt.requirements = [
        '构建讽刺性的诗歌意象',
        '用优美的语言包裹尖锐的批判',
        '保持一定的韵律和诗歌结构'
      ];
      basePrompt.examples = [
        '自诩高傲如孤松，\n实则不过路旁草。\n风来俯首风去笑，\n内心空空如也。',
        '画地为牢自囚禁，\n却言世界太狭小。\n何不照照心灵镜，\n困兽正是自己。'
      ];
      basePrompt.limits = [
        '保持诗歌的美感和韵律',
        '讽刺中也要有深度'
      ];
    } else {
      basePrompt.requirements = [
        '创造优美的意象和韵律',
        '表达深刻的情感或思考',
        '使用诗歌的结构和技巧'
      ];
      basePrompt.examples = [
        '清晨的阳光温柔地\n抚过每一片树叶\n如同时光轻抚\n我们的忧伤',
        '星辰在黑夜中低语\n讲述永恒的故事\n而我静静聆听\n你心灵的波澜'
      ];
      basePrompt.limits = [
        '避免过于晦涩难懂',
        '保持诗意的同时确保可理解性',
      ];
    }
  } else if (themeKey === THEMES.HAIKU) {
    // 俳句主题
    if (savageMode) {
      basePrompt.requirements = [
        '反映日常生活中的小烦恼和无奈',
        '使用直白简练的语言',
        '严格遵循5-7-5音节结构，共17字',
        '关注人的情感和社交互动',
        '讽刺或吐槽生活中的尴尬时刻'
      ];
      basePrompt.examples = [
        '会议迟到了\n领导刚好看过来\n找个借口说',
        '外卖点太多\n冰箱堆满剩饭菜\n懒得去扔掉',
        `健身环躺着\n购买已经三个月\n从未拆封过`,
        `辞职几个月\n遇见前司同组人\n都没有班上`,
        `工资刚到手\n一觉醒来全没了\n购物车清空`
      ];
      basePrompt.limits = [
        '直接表达现代生活中的讽刺',
        '不需要含蓄委婉，可以直接吐槽'
      ];
    } else {
      basePrompt.requirements = [
        '捕捉日常生活中的微小瞬间',
        '关注人与人之间的互动和情感',
        '使用简洁直白的语言',
        '反映现代生活的喜怒哀乐'
      ];
      basePrompt.examples = [
        '数学多选题\n啥也不会选了C\n答案ABD',
        '夜深想母亲\n哭泣过后脚冰冷\n被套长宽反', 
        '早八去上课\n两点才能吃上饭\n我需要食物', 
        '帮人取快递\n对方迟迟不发码\n身后排长队'   
      ];
      basePrompt.limits = [
        '不需要强行融入自然意象',
        '避免过于晦涩的表达',
        '严格遵循5-7-5音节结构，共17字',
        '重点是人的情感和生活体验'
      ];
    }
  }
    
  return basePrompt;
}

/**
 * 获取特定主题的字数限制
 * @param {string} theme 主题
 * @param {string} language 语言 ('zh'|'en-zh')
 * @returns {string} 字数限制描述
 */
function getThemeWordLimit(theme, language) {
  const themeKey = Object.values(THEMES).includes(theme) ? theme : THEMES.CHAT;
  const config = themeConfigs[themeKey];
  
  if (language === 'en-zh') {
    return `先输出中文(${config.wordLimitZh})，再输出对应英文翻译(${config.wordLimitEn})`;
  } else {
    return config.wordLimitZh;
  }
}

/**
 * 根据主题生成本地备用内容
 * @param {string} theme 主题
 * @param {boolean} savageMode 是否为毒舌模式
 * @param {Object} params 其他参数
 * @returns {string} 生成的备用内容
 */
function generateThemeLocalContent(theme, savageMode, params) {
  const themeKey = Object.values(THEMES).includes(theme) ? theme : THEMES.CHAT;
  const templates = [];
  
  // 根据主题和模式选择不同的模板
  if (themeKey === THEMES.CHAT) {
    // 聊天主题模板
    if (savageMode) {
      templates.push(
        `看看谁又在矫情了，你这戏精上身的样子真是让人忍俊不禁。`,
        `又在纠结这种小事？你的选择恐惧症什么时候才能治好？`,
        `表面坚强，内心脆弱得一碰就碎，真不知道你是怎么活到现在的。`
      );
    } else {
      templates.push(
        `有时候慢一点没关系，按自己的节奏来，不必着急。`,
        `看你今天这心情，是不是有什么好事想分享？记得照顾好自己。`,
        `不管遇到什么，记得你有能力去面对，也有朋友支持你。`
      );
    }
  } else if (themeKey === THEMES.APHORISM) {
    // 箴言主题模板
    if (savageMode) {
      templates.push(
        `自以为是的智慧，不过是无知的另一种表现形式。`,
        `总是逃避选择的人，最终会被现实代替选择。`,
        `急于展示的才华，往往是自卑的遮羞布。`
      );
    } else {
      templates.push(
        `真正的力量不是改变外界，而是在逆境中保持内心的平静。`,
        `生命的意义不在于长度，而在于你如何填满它的宽度。`,
        `接纳不完美，是通往内心平静的必经之路。`
      );
    }
  } else if (themeKey === THEMES.POETRY) {
    // 诗歌主题模板
    if (savageMode) {
      templates.push(
        `高傲的姿态下\n藏着脆弱的心\n自我欺骗的大师\n可笑又可悲`,
        `迷宫中的勇者\n手持虚假的地图\n兜兜转转一生\n回到原地`,
        `面具背后的真相\n比想象更为平凡\n何必费心伪装\n本就无人在意`
      );
    } else {
      templates.push(
        `清晨的阳光\n穿过树叶的缝隙\n照亮前行的路\n如你照亮我的心`,
        `时间的河流\n带走所有忧伤\n留下的记忆\n化作前进的力量`,
        `星空下的思绪\n连接过去与未来\n此刻的宁静\n是最珍贵的礼物`
      );
    }
  } else if (themeKey === THEMES.HAIKU) {
    // 俳句主题模板
    if (savageMode) {
      templates.push(
        `自信的空壳\n内里空空如也\n秋风嘲笑`,
        `高墙自筑起\n抱怨世界太小\n井底之蛙`,
        `雾中看世界\n却说别人模糊\n镜子蒙尘`
      );
    } else {
      templates.push(
        `晨露花间滑\n蜻蜓轻点水面\n夏日微光`,
        `落叶随风去\n不问归途几许\n心安便是`,
        `山间月初升\n清风送来远方\n思绪安宁`
      );
    }
  }
  
  // 双语支持
  if (params.language === 'en-zh') {
    // 根据选择的主题和模式提供双语模板
    const bilingualTemplates = [];
    
    if (themeKey === THEMES.CHAT) {
      if (savageMode) {
        bilingualTemplates.push(
          `你那"独特"的处事方式还真是让人叹为观止，能把简单的事搞得如此复杂也是种才能。\nYour "unique" way of handling things is truly breathtaking. Making simple things complicated must be your special talent.`,
          `你以为没人看出你的小心思吗？那点小把戏连小学生都骗不了。\nYou think no one sees through your little tricks? Those games wouldn't fool even a child.`
        );
      } else {
        bilingualTemplates.push(
          `有时候需要放慢脚步，欣赏沿途的风景，而不只是匆忙赶路。\nSometimes you need to slow down and appreciate the scenery along the way, not just rush to the destination.`,
          `记得留些时间给自己，在忙碌中找到属于自己的平静时刻。\nRemember to save some time for yourself, find your own moment of peace in the midst of busyness.`
        );
      }
    } else if (themeKey === THEMES.APHORISM) {
      if (savageMode) {
        bilingualTemplates.push(
          `最讽刺的不是失败，而是从未真正尝试却假装经历过一切。\nThe most ironic thing is not failure, but never truly trying while pretending to have experienced everything.`,
          `人们总是高估自己的与众不同，却低估了自己的平庸。\nPeople always overestimate their uniqueness, while underestimating their mediocrity.`
        );
      } else {
        bilingualTemplates.push(
          `真正的智慧不在于知道一切，而在于承认自己的无知。\nTrue wisdom lies not in knowing everything, but in acknowledging one's ignorance.`,
          `生命的意义不是找到完美，而是在不完美中创造美好。\nThe meaning of life is not to find perfection, but to create beauty in imperfection.`
        );
      }
    }
    
    if (bilingualTemplates.length > 0) {
      return bilingualTemplates[Math.floor(Math.random() * bilingualTemplates.length)];
    }
  }
  
  // 随机选择一个模板
  return templates[Math.floor(Math.random() * templates.length)];
}

module.exports = {
  getThemePrompt,
  getThemeWordLimit,
  generateThemeLocalContent
};
