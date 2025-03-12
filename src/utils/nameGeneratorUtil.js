/**
 * 名字生成工具
 * 用于生成随机化的称呼和名字建议
 */

// 诗意称呼词库 - 扩展更丰富的词汇
const poeticPrefixes = [
    '夜行', '星月', '暮光', '晨曦', '云水', '幽林', '残月', '流云',
    '风铃', '雨夜', '山雨', '碧水', '落花', '风', '雨', '雪', '雾',
    '梦', '星', '月', '尘', '空', '墨', '萤', '玉', '水', '烟',
    '叶', '花', '露', '光', '竹', '松', '翠', '青', '紫', '素',
    // 新增更有诗意的前缀
    '星河', '碎梦', '寒霜', '流光', '花语', '山岚', '沧海', '天际', 
    '琉璃', '浮生', '归尘', '千帆', '丹青', '古韵', '远山', '醉月',
    '锦绣', '凌霄', '清辉', '潇湘', '烟雨', '飞雪', '沉香', '空谷',
  ];
  
  const poeticSuffixes = [
    '客', '者', '人', '影', '隐', '子', '行', '心', '梦', '魂',
    '音', '思', '意', '光', '语', '笔', '歌', '吟', '听', '鸣',
    '生', '瑶', '桐', '城', '溪', '山', '居', '隐', '士', '客',
    // 新增更有诗意的后缀
    '客', '侠', '翁', '仙', '痕', '尘', '鹤', '斋', '阁', '楼',
    '阙', '赋', '颂', '弦', '箫', '赠', '篇', '赞', '韵', '赏',
  ];
  
  // 现代称呼词库 - 添加更多元化、有趣的选项
  const modernPrefixes = [
    '小', '大', '老', '阳光', '微笑', '开心', '快乐', '幸福',
    '温暖', '温柔', '勇敢', '智慧', '聪明', '善良', '可爱',
    '活泼', '帅气', '美丽', '优雅', '阳刚', '自信', '从容',
    // 新增更有趣的前缀
    '超级', '无敌', '元气', '酷酷', '萌萌', '呆萌', '霸气', '酷炫',
    '潮流', '时尚', '甜甜', '酸酸', '咸咸', '辣辣', '闪亮', '炫彩',
    '活力', '暖暖', '奇妙', '神秘', '隐藏', '秘密', '幻想', '童话',
  ];
  
  const modernSuffixes = [
    '猫', '狗', '兔', '鼠', '龙', '虎', '鹿', '熊', '豆豆', '泡泡',
    '果儿', '饼干', '奶茶', '可乐', '布丁', '冰淇淋', '棉花糖',
    '小天使', '小太阳', '小精灵', '小仙女', '小王子', '小宝贝',
    // 新增更有趣的后缀
    '飞侠', '超人', '达人', '高手', '宝宝', '大师', '博士', '教授',
    '精灵', '天使', '魔法师', '守护者', '探险家', '收藏家', '解密者',
    '薯条', '汉堡', '披萨', '寿司', '抹茶', '巧克力', '棒棒糖', '果冻',
    '仙子', '勇士', '骑士', '公主', '王子', '侦探', '特工', '航海家',
  ];
  
  // 中性/通用称呼 - 更加丰富和创意
  const neutralNames = [
    '旅人', '行者', '探索者', '思考者', '追梦人', '观察者', '创造者',
    '收藏家', '阅读者', '音乐爱好者', '艺术家', '梦想家',
    '故事收集者', '星空守望者', '未来设计师', '时光旅行者',
    // 新增更富想象力的中性称呼
    '宇宙漫步者', '平行世界探索者', '时空穿越客', '记忆收藏家',
    '灵感捕手', '奇思妙想制造者', '童话守护者', '字里行间的旅行家',
    '跨次元旅行者', '星际冒险家', '古今穿越客', '幻想世界建筑师',
    '次元行者', '光影诗人', '遗失记忆搜寻者', '梦境建筑师',
    '云端漫步者', '思绪编织者', '想象力驯服者', '奇迹见证者',
  ];
  
  // 奇幻/魔法词库 - 全新增加的词库类型
  const fantasyPrefixes = [
    '魔法', '幻境', '秘境', '星辰', '银河', '光年', '虹彩', '晶石',
    '符文', '神圣', '远古', '霓虹', '神话', '传说', '迷雾', '魔域',
  ];
  
  const fantasySuffixes = [
    '巫师', '法师', '术士', '贤者', '预言家', '炼金师', '守护者',
    '驯龙师', '召唤师', '操控者', '织梦师', '塑形师', '咒术师',
  ];
  
  // 二次元/动漫风格词库 - 全新增加的词库类型
  const animePrefixes = [
    '元气', '废柴', '傲娇', '中二', '萌系', '热血', '知性', '冷酷',
    '天然', '腹黑', '元气', '软萌', '青春', '热血', '王道', '暗黑',
  ];
  
  const animeSuffixes = [
    '少年', '少女', '大佬', '前辈', '学长', '学姐', '御宅', '社长',
    '魔王', '勇者', '偶像', '笨蛋', '天才', '达人', 'MAX', '酱',
  ];

// 新增 - 流行IP彩蛋名字集合
const ipEasterEggs = [
    // 游戏角色
    '超威蓝猫', '利维坦', '贝利亚', '奶龙', '麦克雷', '半藏', '艾希', '盖伦',
    '星穹铁道', '提瓦特', '伊泽瑞尔', '艾黎', '云堇', '荧', '空', '派蒙',
    '希儿', '银狼', '景元', '瓦尔特', '姬子', '布洛妮娅', '八重神子',
    '可莉', '甘雨', '钟离', '胡桃', '雷电将军', '温迪', '魈', '夜兰', '刻晴',
    '凯尔希', '塔露拉', '能天使', '温蒂', '德克萨斯', '阿米娅', '早露', '史尔特尔',
    '曜', '韩信', '李白', '安琪拉', '貂蝉', '庄周', '妲己', '铠', '墨子',
    '76号', '破坏球', '源氏', '莱因哈特', '黑百合', '安娜', '士兵76', '死神',
    '毁灭战士', '马力欧', '林克', '皮卡丘', '索尼克', '马库斯', '克劳德', '蒂法',
    '洛克人', '巫师3', '大蛇丸', '电玩少女', '雪人骑士', '赛博朋克', '黑魂主角',
    
    // 动漫角色
    '炭治郎', '祢豆子', '无惨', '五条悟', '宿傩', '葫芦娃', '黑猫警长',
    '哆啦A梦', '柯南', '路飞', '索隆', '娜美', '罗宾', '乔巴', '香吉士',
    '鸣人', '佐助', '小樱', '卡卡西', '我爱罗', '日向雏田', '宇智波鼬',
    '虎杖悠仁', '伏黑惠', '钉崎野蔷薇', '东堂葵', '七海建人', '真人', '鲁路修',
    '野原新之助', '蜡笔小新', '美少女战士', '阿姆罗', '夏亚', '高达', '涅茧利',
    '爱德华', '阿尔冯斯', '绯村剑心', '桐人', '亚丝娜', '飞鼠', '阿斯娜',
    '三笠', '利威尔', '艾伦', '阿尼', '史莱姆', '白银御行', '四宫辉夜',
    '碇真嗣', '明日香', '绫波丽', '渚薰', '赤井秀一', '灰原哀', '毛利兰',
    'EVA初号机', '初音未来', '洛天依', '镜音铃', '镜音连', '旗木卡卡西',
    
    // 经典影视剧IP
    '钢铁侠', '美国队长', '雷神', '绿巨人', '黑寡妇', '鹰眼', '洛基',
    '蜘蛛侠', '奇异博士', '黑豹', '猩红女巫', '幻视', '惊奇队长',
    '灭霸', '星爵', '卡魔拉', '格鲁特', '火箭浣熊', '希尔薇', '旺达幻视',
    '巴基巴恩斯', '山姆威尔森', '塔诺斯', '闪电侠', '超人', '蝙蝠侠',
    '神奇女侠', '海王', '钢骨', '绿灯侠', '沙赞', '黑亚当', '小丑',
    '哈利波特', '赫敏', '罗恩', '邓布利多', '伏地魔', '斯内普', '马尔福',
    '比尔博', '甘道夫', '佛罗多', '咕噜', '莱戈拉斯', '阿拉贡', '索伦',
    '欧比旺', '安纳金', '卢克', '莱娅公主', '汉索罗', '达斯维达', '尤达',
    '曼达洛人', '格洛古', '阿索卡', '梦华录', '叶问',
    
    // 诺兰电影角色
    '蝙蝠侠', '小丑', '双面人', '稻草人', '猫女', '科波特', '戈登局长',
    '盗梦人', '阿瑟', '阿里阿德涅', '库布', '萨伊托', '莫尔', '尤瑟夫',
    '墨菲', '库珀', '艾米莉亚', '布兰德博士', '曼恩博士', '塔斯',
    '约翰·华盛顿', '尼尔', '凯特', '安德烈', '普莱亚', '麦克斯',
    '特斯拉', '安吉尔', '波顿', '罗伯特', '英格玛', '邓肯',
    '罗宾·威廉姆斯', '阿尔·帕西诺', '希斯·莱杰', '莱昂纳多', '马修·麦康纳',
    
    // 流行文化
    '肯定是', '答案是肯定的', '嘎嘎怪', '锐评', '鼠鼠', '呜呜呜', '摸鱼王',
    '摆烂大师', '007', '打工人', '社恐', '废话文学家', '达咩', '高启强',
    '张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十',
    '鲁迅说过', '孔乙己', '阿Q', '药', '狂人日记', '呐喊', '彷徨', '朝花夕拾',
    '小丑竟是我自己', '我试图', '但是', '啊对对对', '绝绝子', '欧金金',
    '无语子', '笑死', '麻了', '太真实了', '好家伙', '芬兰人', '小丑竟是我',
    '人类高质量男性', '我不允许', '三体人', '宇宙尽头', '永不陷落',
    
    // 网络流行语
    '内卷王', '躺平师', '摸鱼冠军', '摆烂大师', '暴风哭泣',
    '人类高质量', '别墅靠海', '上班一族',
    '柠檬精', '摸鱼', 'YYDS', '绝绝子', '顶流', '破防',
    '头号高启强', '丁真', '鉴定为', '懂王', '神界原住民', 
    '热知识', '爷青回', '阴阳大师', '雨女无瓜', '狗头军师', 
    '流量密码', 
    '鸡你太美', '666', '996', '007', '251', '马保国', '闪电五连鞭', '我才是奶龙',
    '奥利给', '有内味了', '奶龙'
  ];
  
  // 新增 - 组合型IP彩蛋生成器素材
  const ipPrefixes = [
    '暗影', '圣光', '霜冻', '火焰', '雷霆', '暴风', '血色', '剧毒', '虚空', '神圣',
    '冰霜', '烈焰', '奥术', '自然', '邪能', '混沌', '远古', '星辰', '幽冥', '深渊',
    '迷失', '荒野', '守望', '孤独', '狂野', '沉默', '幻影', '黎明', '黄昏', '永恒',
  ];
  
  const ipSuffixes = [
    '行者', '猎手', '守卫', '战士', '法师', '刺客', '游侠', '术士', '牧师', '武僧',
    '死骑', '德鲁伊', '猎人', '萨满', '圣骑士', '潜行者', '术士', '法师', '战士', '骑士',
    '之刃', '之盾', '之矛', '之箭', '之杖', '之锤', '之书', '之影', '之光', '之翼',
  ];
  
  export function generateRandomNames(gender, age) {
    const names = [];
    
    // 根据年龄和性别定制名称风格
    const isYoung = age === 'under18' || age === '18-24';
    const isMiddleAge = age === '25-34' || age === '35-44';
    
    // 20%的概率触发IP彩蛋
    if (Math.random() < 0.2) {
      names.push(getRandomIpEasterEgg());
    }
    
    // 添加一个诗意的名字
    names.push(generatePoeticName(gender));
    
    // 添加一个现代风格的名字
    names.push(generateModernName(gender, isYoung));
    
    // 添加一个中性名字
    names.push(neutralNames[Math.floor(Math.random() * neutralNames.length)]);
    
    // 年轻人群更喜欢二次元风格
    if (isYoung) {
      names.push(generateAnimeName(gender));
      names.push(generateFantasyName());
      
      // 年轻人有更高概率触发IP相关名字
      if (Math.random() < 0.3) {
        names.push(generateGameCharName());
      }
    } 
    // 中年人群可能喜欢奇幻元素
    else if (isMiddleAge) {
      names.push(generateFantasyName());
      
      // 随机添加一种特色名字
      if (Math.random() > 0.5) {
        names.push(generateCreativeName(gender, age));
      }
    } 
    // 年长者可能更喜欢传统诗意名字
    else {
      names.push(generatePoeticName(gender));
      names.push(generateCreativeName(gender, age));
    }
    
    // 如果性别是Other，多生成一些中性名字
    if (gender === 'other') {
      const extraName = neutralNames[Math.floor(Math.random() * neutralNames.length)];
      if (!names.includes(extraName)) {
        names.push(extraName);
      }
      names.push(generateFantasyName());
    }
    
    // 确保一定几率生成混合风格的名字
    if (Math.random() > 0.7) {
      names.push(generateMixedStyleName());
    }
    
    // 返回去重后的4-6个名字
    return [...new Set(names)].slice(0, Math.min(6, names.length));
  }
  
/**
 * 生成诗意风格的名字
 * @param {String} gender 性别
 * @returns {String} 诗意风格名字
 */
function generatePoeticName(gender) {
    const prefix = poeticPrefixes[Math.floor(Math.random() * poeticPrefixes.length)];
    const suffix = poeticSuffixes[Math.floor(Math.random() * poeticSuffixes.length)];
    return `${prefix}${suffix}`;
  }
  
  /**
   * 生成现代风格的名字
   * @param {String} gender 性别
   * @param {Boolean} isYoung 是否年轻人群
   * @returns {String} 现代风格名字
   */
  function generateModernName(gender, isYoung) {
    const prefix = modernPrefixes[Math.floor(Math.random() * modernPrefixes.length)];
    // 年轻人更喜欢有趣的、潮流的称呼
    const suffixPool = isYoung ? 
      modernSuffixes.filter(s => s.length < 4 || s.includes('小') || s.includes('糖') || s.includes('天使')) : 
      modernSuffixes;
    const suffix = suffixPool[Math.floor(Math.random() * suffixPool.length)];
    return `${prefix}${suffix}`;
  }
  
  /**
   * 生成奇幻风格的名字
   * @returns {String} 奇幻风格名字
   */
  function generateFantasyName() {
    const prefix = fantasyPrefixes[Math.floor(Math.random() * fantasyPrefixes.length)];
    const suffix = fantasySuffixes[Math.floor(Math.random() * fantasySuffixes.length)];
    return `${prefix}${suffix}`;
  }
  
  /**
   * 生成二次元风格的名字
   * @param {String} gender 性别
   * @returns {String} 二次元风格名字
   */
  function generateAnimeName(gender) {
    const prefix = animePrefixes[Math.floor(Math.random() * animePrefixes.length)];
    const suffix = animeSuffixes[Math.floor(Math.random() * animeSuffixes.length)];
    return `${prefix}${suffix}`;
  }
  
  /**
   * 生成混合风格的名字（结合多种风格元素）
   * @returns {String} 混合风格的创意名字
   */
  function generateMixedStyleName() {
    // 随机选择两种不同风格的元素组合
    const styles = [
      {prefixes: poeticPrefixes, suffixes: modernSuffixes},
      {prefixes: modernPrefixes, suffixes: poeticSuffixes},
      {prefixes: fantasyPrefixes, suffixes: animeSuffixes},
      {prefixes: animePrefixes, suffixes: fantasySuffixes},
    ];
    
    const style = styles[Math.floor(Math.random() * styles.length)];
    const prefix = style.prefixes[Math.floor(Math.random() * style.prefixes.length)];
    const suffix = style.suffixes[Math.floor(Math.random() * style.suffixes.length)];
    
    return `${prefix}${suffix}`;
  }
  
  /**
   * 根据特定条件生成创意名字
   * @param {String} gender 性别
   * @param {String} age 年龄段
   * @returns {String} 创意风格的名字
   */
  function generateCreativeName(gender, age) {
    // 创意组合，如"时光收藏家"，"记忆魔法师"等
    const creativeElements = [
      '时光', '记忆', '思绪', '梦境', '灵感', '星辰', '传说', '故事', 
      '心跳', '旋律', '色彩', '空间', '回忆', '幻想', '未来', '瞬间'
    ];
    
    const creativeRoles = [
      '收藏家', '守护者', '探险家', '旅行者', '编织师', '导航员',
      '解读者', '见证者', '记录者', '引路人', '领航员', '搜集者'
    ];
    
    const element = creativeElements[Math.floor(Math.random() * creativeElements.length)];
    const role = creativeRoles[Math.floor(Math.random() * creativeRoles.length)];
    
    return `${element}${role}`;
  }
  
  /**
   * 随机获取一个IP彩蛋名字
   * @returns {String} IP彩蛋名字
   */
  function getRandomIpEasterEgg() {
    return ipEasterEggs[Math.floor(Math.random() * ipEasterEggs.length)];
  }
  
  /**
   * 生成游戏角色风格的名字
   * @returns {String} 游戏角色风格名字
   */
  function generateGameCharName() {
    // 判断是否直接返回完整IP彩蛋名字或生成组合型名字
    if (Math.random() < 0.4) {
      return getRandomIpEasterEgg();
    } else {
      const prefix = ipPrefixes[Math.floor(Math.random() * ipPrefixes.length)];
      const suffix = ipSuffixes[Math.floor(Math.random() * ipSuffixes.length)];
      return `${prefix}${suffix}`;
    }
  }
  
  /**
   * 根据星座和MBTI生成相关的名字
   * @param {String} zodiac 星座值
   * @param {String} mbti MBTI类型
   * @returns {String} 根据星座和MBTI特点生成的名字
   */
  export function generatePersonalizedName(zodiac, mbti) {
    // 有10%的概率直接返回IP彩蛋名字
    if (Math.random() < 0.1) {
      return getRandomIpEasterEgg();
    }
    
    // 星座对应的特质元素 - 保持现有内容
    const zodiacTraits = {
      'aries': ['热情', '勇敢', '火焰', '先锋', '冒险', '开拓'],
      'taurus': ['坚定', '沉稳', '大地', '安稳', '享受', '富足'],
      'gemini': ['灵动', '双子', '风语', '好奇', '百变', '机智'],
      'cancer': ['柔情', '月光', '守护', '敏感', '温柔', '记忆'],
      'leo': ['王者', '阳光', '狮心', '闪耀', '热情', '骄傲'],
      'virgo': ['细致', '纯净', '麦田', '完美', '分析', '实用'],
      'libra': ['平衡', '优雅', '天秤', '和谐', '艺术', '公正'],
      'scorpio': ['深邃', '神秘', '蝎魂', '洞察', '变革', '执着'],
      'sagittarius': ['自由', '探索', '射手', '真理', '远方', '博学'],
      'capricorn': ['坚毅', '山岳', '攀登', '野心', '节制', '现实'],
      'aquarius': ['创新', '水瓶', '未来', '独特', '反叛', '博爱'],
      'pisces': ['梦幻', '双鱼', '海洋', '感知', '艺术', '直觉']
    };
  
    // MBTI对应的特质元素 - 保持现有内容
    const mbtiTraits = {
      'INTJ': ['策划', '思想', '建筑', '愿景', '系统', '智慧'],
      'INTP': ['思考', '逻辑', '探究', '创意', '理论', '解析'],
      'ENTJ': ['指挥', '决策', '领航', '效率', '战略', '权威'],
      'ENTP': ['创意', '辩论', '挑战', '创新', '灵感', '多变'],
      'INFJ': ['洞见', '理想', '启迪', '远见', '和谐', '神秘'],
      'INFP': ['理想', '和谐', '诗心', '真诚', '治愈', '温柔'],
      'ENFJ': ['引导', '感召', '激励', '成长', '关怀', '共鸣'],
      'ENFP': ['热情', '灵感', '自由', '活力', '创意', '可能性'],
      'ISTJ': ['务实', '可靠', '传承', '责任', '细节', '传统'],
      'ISFJ': ['守护', '细腻', '奉献', '记忆', '传承', '温暖'],
      'ESTJ': ['执行', '效率', '管理', '组织', '现实', '秩序'],
      'ESFJ': ['和睦', '关怀', '传统', '服务', '责任', '团结'],
      'ISTP': ['技艺', '灵巧', '机智', '分析', '冒险', '实用'],
      'ISFP': ['艺术', '感性', '自在', '和谐', '审美', '当下'],
      'ESTP': ['行动', '冒险', '现实', '影响', '机会', '适应'],
      'ESFP': ['表演', '活力', '乐观', '热情', '现在', '享受']
    };
    
    // 获取对应特质
    const zodiacTrait = zodiacTraits[zodiac] || ['神秘', '星空', '漫步', '探索', '传说', '奇迹'];
    const mbtiTrait = mbtiTraits[mbti] || ['思考', '探索', '旅行', '发现', '记录', '感知'];
    
    // 随机组合生成更丰富的名字形式
    // 1. 标准形式：星座特质 + MBTI特质 + 后缀
    // 2. 创意形式：星座特质 + "之" + MBTI特质 + 者
    // 3. 诗意形式：星座特质 + "与" + MBTI特质 + "的" + 诗意后缀
    // 4. 游戏角色风格：星座特质 + IP风格后缀 (新增)
    
    const nameFormats = [
      // 标准形式
      () => {
        const z = zodiacTrait[Math.floor(Math.random() * zodiacTrait.length)];
        const m = mbtiTrait[Math.floor(Math.random() * mbtiTrait.length)];
        const suffixes = ['者', '人', '客', '师', '家', '侠', '心', '者'];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        return `${z}${m}${suffix}`;
      },
      // 创意形式
      () => {
        const z = zodiacTrait[Math.floor(Math.random() * zodiacTrait.length)];
        const m = mbtiTrait[Math.floor(Math.random() * mbtiTrait.length)];
        return `${z}之${m}者`;
      },
      // 诗意形式
      () => {
        const z = zodiacTrait[Math.floor(Math.random() * zodiacTrait.length)];
        const m = mbtiTrait[Math.floor(Math.random() * mbtiTrait.length)];
        const poetics = ['旅', '梦', '光', '语', '影', '魂', '歌', '心', '途'];
        const poetic = poetics[Math.floor(Math.random() * poetics.length)];
        return `${z}与${m}的${poetic}`;
      },
      // 简洁形式
      () => {
        const z = zodiacTrait[Math.floor(Math.random() * zodiacTrait.length)];
        const m = mbtiTrait[Math.floor(Math.random() * mbtiTrait.length)];
        // 如果两个词加起来超过4个字，则使用简洁形式避免名字过长
        if ((z + m).length > 4) {
          return `${z}${m.substring(0, 1)}`;
        }
        return `${z}${m}`;
      },
      // 新增 - 游戏角色风格形式
      () => {
        const z = zodiacTrait[Math.floor(Math.random() * zodiacTrait.length)];
        const suffix = ipSuffixes[Math.floor(Math.random() * ipSuffixes.length)];
        return `${z}${suffix}`;
      }
    ];
    
    // 根据星座和MBTI组合选择合适的名字形式
    // 例如：直觉类型更可能选择诗意形式，思考类型更可能选择标准形式
    let formatIndex = Math.floor(Math.random() * nameFormats.length);
    
    // 如果是直觉型，增加选择诗意形式的概率
    if (mbti && mbti.includes('N')) {
      formatIndex = Math.random() > 0.4 ? 2 : formatIndex;
    }
    
    // 如果是思考型，增加选择标准形式的概率
    if (mbti && mbti.includes('T')) {
      formatIndex = Math.random() > 0.4 ? 0 : formatIndex;
    }
    
    // 根据星座增加特定风格的概率
    // 例如：火相星座(白羊、狮子、射手)更可能选择游戏角色风格
    if (zodiac && ['aries', 'leo', 'sagittarius'].includes(zodiac)) {
      formatIndex = Math.random() > 0.6 ? 4 : formatIndex;
    }
    
    return nameFormats[formatIndex]();
  }