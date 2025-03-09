/**
 * 获取星座特质描述
 * @param {string} zodiac 星座名称
 * @returns {string} 星座特质描述
 */
export function getZodiacTraits(zodiac) {
  const traits = {
    'aries': '正向特质：充沛活力、勇敢无畏、领导能力强、直率坦诚、乐于挑战、创新精神；负向特质：急躁冲动、自我中心、缺乏耐心、好斗好胜、粗心大意、容易放弃',
    
    'taurus': '正向特质：可靠稳重、耐心专注、务实高效、审美细腻、忠诚坚定、享受生活；负向特质：固执己见、抗拒变化、占有欲强、行动迟缓、物质主义、记仇不忘',
    
    'gemini': '正向特质：思维敏捷、好奇心强、沟通能力佳、适应力强、学习迅速、创意丰富；负向特质：情绪多变、注意力分散、优柔寡断、表里不一、肤浅片面、缺乏定性',
    
    'cancer': '正向特质：富有同情心、保护欲强、记忆力好、情感丰富、直觉敏锐、珍视传统；负向特质：情绪化强、过度敏感、依赖性高、控制欲强、记仇耿耿、情绪多变',
    
    'leo': '正向特质：阳光自信、慷慨大方、领导魅力、创造力强、忠诚勇敢、温暖热情；负向特质：自我中心、好面子爱虚荣、权威独断、不接受批评、骄傲自大、铺张浪费',
    
    'virgo': '正向特质：分析能力强、注重细节、实际可靠、追求完美、勤劳踏实、理性逻辑；负向特质：过度挑剔、焦虑忧心、完美主义、过于自我批评、吹毛求疵、难以满足',
    
    'libra': '正向特质：追求和谐、公平正义、外交手腕佳、审美优雅、善解人意、平易近人；负向特质：犹豫不决、过度依赖他人、避免冲突、表面和平、难以坚持立场、过度理想化',
    
    'scorpio': '正向特质：洞察力强、意志坚定、忠诚专一、执着追求、直觉敏锐、深度思考；负向特质：多疑猜忌、极端固执、报复心强、情绪偏执、控制欲强、难以释怀',
    
    'sagittarius': '正向特质：乐观开朗、思想自由、诚实直言、热爱冒险、幽默风趣、博学多才；负向特质：缺乏耐心、言语无状、缺乏责任感、善变轻浮、过度理想化、承诺难守',
    
    'capricorn': '正向特质：自律严谨、责任心强、耐心坚韧、条理分明、稳重可靠、目标明确；负向特质：悲观保守、过于严肃、工作狂倾向、情感压抑、过度自我苛责、功利现实',
    
    'aquarius': '正向特质：创新前卫、思想独立、人道主义、理性客观、才智过人、团队合作；负向特质：叛逆特立独行、情感疏离、过度理想化、难以捉摸、固执己见、不切实际',
    
    'pisces': '正向特质：富有同理心、艺术感性、直觉敏锐、无私奉献、想象力丰富、心地善良；负向特质：沉溺幻想、缺乏自律、优柔寡断、易受影响、逃避现实、边界感模糊'
  };
  
  return traits[zodiac] || '独特而复杂的性格特点，既有显著优势，也有需要平衡的方面';
}

/**
 * 获取MBTI性格特质描述
 * @param {string} mbtiType MBTI类型
 * @returns {string} MBTI特质描述
 */
export function getMbtiTraits(mbtiType) {
  const traits = {
    'INTJ': '正向特质：战略性思维、独立自主、高效精准、系统规划、追求卓越、创新洞见；负向特质：过分完美主义、情感表达困难、缺乏灵活性、不善交际、过度批判、难以妥协',
    
    'INTP': '正向特质：逻辑分析、概念思维、创新能力强、独立思考、求知欲强、理论洞察；负向特质：社交疏离、过度理论化、拖延决策、忽视情感、不切实际、过于沉浸思考',
    
    'ENTJ': '正向特质：领导才能、决断力强、战略眼光、组织规划、目标驱动、坦率直接；负向特质：强势专断、情感冷漠、过于苛责、缺乏耐心、控制欲强、工作狂倾向',
    
    'ENTP': '正向特质：创意思维、辩论技巧、适应力强、思想开放、解决问题能力佳、充满活力；负向特质：注意力分散、难以坚持、好辩争论、忽视细节、挑战权威、情绪波动',
    
    'INFJ': '正向特质：洞察人性、理想主义、深思熟虑、创意表达、同理心强、追求意义；负向特质：过度理想化、自我批判、完美主义、难以面对冲突、情感负荷重、逃避现实',
    
    'INFP': '正向特质：深刻的同理心、丰富想象力、价值观坚定、创意思考、真诚热情、善于适应；负向特质：过度敏感、现实感弱、优柔寡断、过度自我批评、不切实际、情绪化',
    
    'ENFJ': '正向特质：人际影响力、鼓舞他人、组织能力强、善解人意、追求和谐、富有远见；负向特质：过度迎合他人、忽视自身需求、情绪化决策、控制欲强、难以接受批评、过度负责',
    
    'ENFP': '正向特质：热情活力、创新思维、适应力强、人际魅力、乐观积极、表达能力佳；负向特质：注意力分散、难以坚持、情绪波动大、实践能力弱、难以做决定、过度理想化',
    
    'ISTJ': '正向特质：可靠负责、注重细节、逻辑思考、组织能力强、务实高效、坚守承诺；负向特质：僵化教条、抗拒变化、情感表达困难、过分保守、批判倾向、缺乏创新',
    
    'ISFJ': '正向特质：忠诚可靠、关怀他人、注重细节、善于观察、实际可靠、保护他人；负向特质：过度牺牲自我、难以拒绝、过于传统、回避冲突、压抑情感、过度担忧',
    
    'ESTJ': '正向特质：高效执行、组织能力佳、实用务实、直接诚实、责任感强、坚定决断；负向特质：固执己见、情感表达少、过度教条、缺乏灵活性、对抗性强、急躁苛刻',
    
    'ESFJ': '正向特质：热心助人、责任感强、关注他人需求、组织能力佳、交际能力强、注重和谐；负向特质：过度在意他人看法、情绪敏感、需要认可、忽视自身需求、保守传统、难以应对批评',
    
    'ISTP': '正向特质：实际果断、技术精通、灵活应变、冷静沉着、独立自主、解决问题能力强；负向特质：冷漠疏离、规则感弱、难以承诺、情感表达少、冒险倾向、缺乏长期规划',
    
    'ISFP': '正向特质：艺术敏感度、真诚温和、适应力强、欣赏美感、专注当下、和平主义；负向特质：消极被动、情绪化、缺乏自信、难以长期规划、边界感弱、逃避冲突',
    
    'ESTP': '正向特质：行动力强、实用主义、适应力佳、风险管理能力、谈判技巧好、丰富活力；负向特质：缺乏耐心、追求刺激、规则意识弱、漫不经心、注意力短暂、缺乏长远规划',
    
    'ESFP': '正向特质：活力四射、社交能力强、乐观积极、实用性强、享受当下、适应力佳；负向特质：冲动行事、难以专注、逃避责任、抗拒计划、缺乏自律、情绪化决策'
  };
  
  return traits[mbtiType] || '独特的思维和行为模式';
}

/**
 * 获取性别中文标签
 * @param {string} gender 性别值
 * @returns {string} 性别中文标签
 */
export function getGenderLabel(gender) {
  const genderMap = {
    'male': '男性',
    'female': '女性',
    'other': '其他'
  };
  return genderMap[gender] || '未知';
}

/**
 * 获取年龄段标签
 * @param {string} age 年龄段值
 * @returns {string} 年龄段标签
 */
export function getAgeLabel(age) {
  const ageMap = {
    'under18': '18岁以下',
    '18-24': '18-24岁',
    '25-34': '25-34岁',
    '35-44': '35-44岁',
    '45-54': '45-54岁',
    'above55': '55岁以上'
  };
  return ageMap[age] || '未知年龄';
}

/**
 * 获取感情状况标签
 * @param {string} relationship 感情状况值
 * @returns {string} 感情状况标签
 */
export function getRelationshipLabel(relationship) {
  const relationshipMap = {
    'single': '单身',
    'crushing': '有心仪对象',
    'relationship': '恋爱中',
    'married': '已婚'
  };
  return relationshipMap[relationship] || '未知状态';
}

/**
 * 获取性别特质描述
 * @param {string} gender 性别
 * @returns {string} 性别特质描述
 */
export function getGenderTraits(gender) {
  const traits = {
    'male': '更倾向于直接表达和解决问题，社交中可能更关注信息和观点交流而非情感连接，面对困难时可能更独立，倾向于通过行动和成就获取自我认同',
    'female': '更倾向于共情和情感表达，社交中注重情感连接和关系维护，面对困难时可能更愿意寻求和提供支持，倾向于通过关系和连接获取自我认同',
    'other': '拥有更加多元和独特的视角，可能更能理解并跨越传统性别框架的限制，在处理问题时融合多种思考方式，往往拥有更高的自我意识和表达自由度'
  };
  return traits[gender] || '独特的个人特质，不受传统性别刻板印象限制';
}

/**
 * 获取年龄段特质描述
 * @param {string} age 年龄段
 * @returns {string} 年龄段特质描述
 */
export function getAgeTraits(age) {
  const traits = {
    'under18': '处于自我认知和价值观形成期，充满好奇心和创造力，倾向于寻求认同，较为理想化，追求新奇体验，对未来充满可能性',
    '18-24': '处于探索期，正在形成独立的世界观，面临学业和职业起步的挑战，社交圈广泛，较为开放但可能存在身份认同困惑，开始承担更多责任',
    '25-34': '处于稳定发展期，职业和关系方向逐渐清晰，面临事业发展和感情稳定的双重压力，开始注重长期规划，考虑工作与生活平衡',
    '35-44': '处于成熟期，职业和家庭责任加重，经历高峰期的机遇与挑战，开始审视人生方向，注重实际成就和生活品质，可能面临中年转型思考',
    '45-54': '处于巩固期，职业上趋于稳定，视角更加长远，更重视内在价值和身心健康，开始思考留下的影响和传承，有更丰富的人生体验和智慧',
    'above55': '处于智慧期，拥有丰富的人生阅历，看待问题更加全面从容，更注重生活质量和心灵满足，重新评估人生优先级，关注健康和意义感'
  };
  return traits[age] || '处于人生的特定阶段，拥有相应的经验与视角';
}

/**
 * 获取感情状况特质描述
 * @param {string} relationship 感情状况
 * @returns {string} 感情状况特质描述
 */
export function getRelationshipTraits(relationship) {
  const traits = {
    'single': '保持较高的个人空间和自由度，决策更独立，时间安排更灵活，可能更专注于个人发展和社交圈扩展，对未来关系持开放态度',
    'crushing': '处于情感期待和不确定性阶段，情绪波动较大，倾向于理想化对象，投入较多心理能量在感情思考上，对暗示和互动特别敏感',
    'relationship': '正经历情感连接与磨合，需要平衡个人空间和亲密关系，面临沟通和理解的挑战，学习与伴侣共同成长，建立稳定的情感纽带',
    'married': '进入更稳定的承诺阶段，需要长期经营关系，决策更需考虑伴侣和家庭因素，面临更多责任分担，在亲密与独立间寻找平衡点'
  };
  return traits[relationship] || '拥有自己独特的情感状态和关系处理方式';
}

/**
 * 获取性格特质的具体表现
 * @param {string} zodiac 星座
 * @param {string} mbtiType MBTI类型
 * @returns {string} 性格特质的具体表现描述
 */
export function getPersonalityInsights(zodiac, mbtiType) {
    let insights = [];
    
    // 基于星座添加具体洞察
    switch(zodiac) {
      case 'aries':
        insights.push(
          '喜欢直接切入主题', 
          '欣赏新点子和可能性', 
          '不喜欢拖沓和过多细节',
          '做决定时果断且迅速',
          '偏好挑战和竞争环境',
          '热爱开创性的项目',
          '沟通方式直接且坦率',
          '遇到困难时表现出坚韧和勇气',
          '容易对新事物产生兴趣',
          '善于带领他人朝目标前进'
        );
        break;
      case 'taurus':
        insights.push(
          '重视稳定和舒适', 
          '欣赏实际的建议而非理论', 
          '需要时间接受新事物',
          '在决策前会充分考虑价值和回报',
          '注重感官体验和美感',
          '坚持自己认为正确的道路',
          '偏好有条理、可预测的环境',
          '非常忠诚但需要时间建立信任',
          '重视高质量的物质享受',
          '处理问题时脚踏实地且有耐心'
        );
        break;
      case 'gemini':
        insights.push(
          '喜欢多样化的话题', 
          '欣赏灵活多变的想法', 
          '不喜欢重复和单调',
          '善于同时处理多个任务或想法',
          '沟通风格机智且多元',
          '思维敏捷，善于文字和语言表达',
          '容易对单一活动感到无聊',
          '渴望不断学习新知识和技能',
          '情绪和兴趣变化较快',
          '能从多角度看待问题'
        );
        break;
      case 'cancer':
        insights.push(
          '关注情感和关系', 
          '欣赏体贴和理解', 
          '需要安全感和认同',
          '拥有极强的情感记忆',
          '直觉敏锐，能感知他人情绪',
          '珍视家庭和亲密关系',
          '在熟悉环境中才能完全展现自我',
          '面对压力时可能需要情感支持',
          '保护欲强，愿为亲近的人付出',
          '对环境和氛围特别敏感'
        );
        break;
      case 'leo':
        insights.push(
          '喜欢被认可和欣赏', 
          '重视自我表达', 
          '乐于分享成就和创意',
          '渴望成为关注的焦点',
          '天生具有领导气质',
          '对赞美和肯定非常敏感',
          '慷慨大方，愿意帮助他人',
          '热爱戏剧性和创造性的表达',
          '在团队中自然承担责任',
          '对忠诚和尊重非常看重'
        );
        break;
      case 'virgo':
        insights.push(
          '注重细节和实用性', 
          '欣赏清晰和条理', 
          '倾向于分析和改进',
          '善于发现问题和解决方案',
          '对自己和他人有高标准',
          '做事有条理且有计划性',
          '善于观察微小的变化和细节',
          '追求精确和完美',
          '重视健康和日常习惯',
          '沟通方式注重事实和准确性'
        );
        break;
      case 'libra':
        insights.push(
          '寻求平衡和协调', 
          '欣赏不同观点', 
          '在做决定前会权衡利弊',
          '天生的外交家，善于调解冲突',
          '对美和和谐有敏锐的感知',
          '重视公平和正义',
          '善于看到事物的多个方面',
          '追求理想中的关系和环境',
          '倾向于避免极端和冲突',
          '决策时可能过于考虑他人感受'
        );
        break;
      case 'scorpio':
        insights.push(
          '重视真诚和深度', 
          '不喜欢表面交流', 
          '关注背后的动机和含义',
          '有极强的洞察力和直觉',
          '感情深沉且持久',
          '重视隐私和内在世界',
          '面对挑战表现出顽强的韧性',
          '对背叛和不诚实特别敏感',
          '愿意探索taboo和深层次话题',
          '对投入的事物有极强的专注力'
        );
        break;
      case 'sagittarius':
        insights.push(
          '追求自由和探索', 
          '喜欢开阔视野', 
          '不喜欢被约束和重复',
          '思维开放，热爱哲学和宏大主题',
          '向往adventure和新体验',
          '乐观积极，幽默感强',
          '讨厌被束缚或限制',
          '直率表达想法和观点',
          '热衷于学习不同文化和思想',
          '重视诚实和真理'
        );
        break;
      case 'capricorn':
        insights.push(
          '关注目标和成就', 
          '欣赏踏实和负责', 
          '重视时间和资源管理',
          '制定长期计划且坚定执行',
          '做事严谨且有规划',
          '重视传统和经验',
          '对个人成就和社会地位有追求',
          '工作态度认真负责',
          '善于克服困难和障碍',
          '面对挑战表现出坚韧和耐力'
        );
        break;
      case 'aquarius':
        insights.push(
          '独立思考和创新', 
          '关注更大的想法和社会', 
          '不喜欢遵循常规',
          '思维前卫且具有未来导向',
          '重视个人自由和独立性',
          '对社会议题和人道主义有热情',
          '愿意尝试非传统的方法和想法',
          '看问题角度独特且有洞见',
          '对知识和理论有强烈兴趣',
          '重视思想上的交流和共鸣'
        );
        break;
      case 'pisces':
        insights.push(
          '丰富的想象力和同理心', 
          '感受细腻', 
          '有时会沉浸在自己的世界',
          '天生艺术气质和创造力',
          '能感知他人情感和需求',
          '追求精神和灵性的深度',
          '拥有强大的直觉和预感',
          '容易被艺术和美所触动',
          '有时会逃避现实的挑战',
          '心灵开放，包容不同的可能性'
        );
        break;
    }
    
    // 基于MBTI类型添加具体洞察
    if (mbtiType.includes('I')) {
      insights.push(
        '需要独处时间恢复能量', 
        '喜欢深度而非广度的交流',
        '倾向于先思考后表达',
        '更喜欢一对一或小团体交流',
        '在做决定前需要时间内省',
        '通常在熟悉场合表现更自然'
      );
    } else if (mbtiType.includes('E')) {
      insights.push(
        '通过交流和分享获得能量', 
        '喜欢讨论想法和体验',
        '思考时偏好边说边想',
        '在团体中感到活力和兴奋',
        '倾向于更开放地表达情绪和想法',
        '喜欢参与社交活动拓展人际圈'
      );
    }
    
    if (mbtiType.includes('S')) {
      insights.push(
        '关注具体和实际', 
        '重视经验和事实',
        '注重当下和实际可行的方案',
        '喜欢有序且清晰的信息',
        '解决问题时依赖已知方法',
        '对细节有敏锐的观察力'
      );
    } else if (mbtiType.includes('N')) {
      insights.push(
        '关注意义和联系', 
        '喜欢探索可能性和概念',
        '容易发现模式和隐含意义',
        '享受抽象和理论性的讨论',
        '倾向于关注未来和创新',
        '重视直觉和灵感'
      );
    }
    
    if (mbtiType.includes('T')) {
      insights.push(
        '重视逻辑和客观', 
        '在决策时考虑利弊',
        '追求公平和一致性',
        '倾向于分析问题寻求解决方案',
        '表达时注重清晰和准确',
        '面对批评时关注内容而非表达方式'
      );
    } else if (mbtiType.includes('F')) {
      insights.push(
        '重视和谐和个人价值观', 
        '在决策时考虑他人感受',
        '善于理解他人情感需求',
        '注重真实性和个人认同',
        '在表达批评时考虑影响',
        '看重赞赏和积极反馈'
      );
    }
    
    if (mbtiType.includes('J')) {
      insights.push(
        '喜欢确定性和规划', 
        '注重完成和结果',
        '倾向于建立结构和系统',
        '享受按计划行事的满足感',
        '提前做决定以减少不确定性',
        '重视截止日期和承诺'
      );
    } else if (mbtiType.includes('P')) {
      insights.push(
        '喜欢灵活性和开放选项', 
        '享受过程和探索',
        '适应能力强，容易接受变化',
        '倾向于保留选择和可能性',
        '决策过程较为灵活开放',
        '享受自发性和随机惊喜'
      );
    }
    
    // 特定MBTI组合的独特洞察
    if (mbtiType === 'INFJ' || mbtiType === 'INTJ') {
      insights.push(
        '拥有强大的远见和洞察力',
        '重视个人成长和持续学习',
        '对内在矛盾有深刻理解'
      );
    }
    
    if (mbtiType === 'ENFP' || mbtiType === 'ENTP') {
      insights.push(
        '思维跳跃且富有创造力',
        '能激发他人的热情和想法',
        '常常寻求新的可能性和冒险'
      );
    }
    
    if (mbtiType === 'ISTJ' || mbtiType === 'ISFJ') {
      insights.push(
        '可靠且负责任',
        '重视传统和既定流程',
        '关注细节且记忆力强'
      );
    }
    
    if (mbtiType === 'ESTP' || mbtiType === 'ESFP') {
      insights.push(
        '活在当下，享受即时体验',
        '解决问题能力强且实用',
        '喜欢刺激和多变的环境'
      );
    }
    
    // 星座和MBTI的组合洞察
    if ((zodiac === 'aries' || zodiac === 'leo' || zodiac === 'sagittarius') && 
        (mbtiType.includes('E') && mbtiType.includes('N'))) {
      insights.push(
        '充满活力且具有感染力',
        '在团队中自然成为思想领袖',
        '善于激发他人的热情和创造力'
      );
    }
    
    if ((zodiac === 'taurus' || zodiac === 'virgo' || zodiac === 'capricorn') && 
        (mbtiType.includes('S') && mbtiType.includes('J'))) {
      insights.push(
        '做事高效且有条理',
        '善于管理资源和时间',
        '注重实际结果和可靠性'
      );
    }
    
    if ((zodiac === 'gemini' || zodiac === 'libra' || zodiac === 'aquarius') && 
        (mbtiType.includes('N') && mbtiType.includes('T'))) {
      insights.push(
        '思维开放且善于概念性思考',
        '喜欢理性分析和探索新想法',
        '在交流中展现智慧和见解'
      );
    }
    
    if ((zodiac === 'cancer' || zodiac === 'scorpio' || zodiac === 'pisces') && 
        (mbtiType.includes('I') && mbtiType.includes('F'))) {
      insights.push(
        '情感丰富且富有同理心',
        '有深刻的内在世界和直觉',
        '在亲密关系中展现真诚和深度'
      );
    }
    
    // 随机选择5条洞察（如果有那么多）
    if (insights.length > 5) {
      const shuffled = [...insights].sort(() => 0.5 - Math.random());
      insights = shuffled.slice(0, 5);
    }
    
    return insights.map(insight => `- ${insight}`).join('\n');
  }