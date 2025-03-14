<template>
  <div class="cyberpunk-easter-egg">
    <!-- 此组件无可视UI，仅提供彩蛋功能 -->
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  },
  currentStep: {
    type: Number,
    required: true
  },
  targetStep: {
    type: Number,
    default: 9 // 默认在第9步（称呼设置步骤）激活
  }
});

const emit = defineEmits([
  'activate', 
  'update-suggestions',
  'update-note-content',
  'update-note-class',
  'deactivate'
]);

// 状态变量
const keySequence = ref('');
const keySequenceTimeout = ref(null);
const audioPlayer = ref(null);
const selectedCharacter = ref(''); // 添加选中角色的状态变量

// 在组件挂载时添加事件监听
onMounted(() => {
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyPress);
  
  // 创建音频元素但不自动播放
  audioPlayer.value = new Audio();
  audioPlayer.value.loop = true;
});

// 在组件卸载前清理事件监听和音频
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyPress);
  
  // 停止并清理音频播放
  if (audioPlayer.value) {
    audioPlayer.value.pause();
    audioPlayer.value.src = '';
  }
  
  // 清除可能存在的超时
  if (keySequenceTimeout.value) {
    clearTimeout(keySequenceTimeout.value);
  }
  
  // 清除闪烁效果间隔
  if (window.cyberpunkFlickerInterval) {
    clearInterval(window.cyberpunkFlickerInterval);
    window.cyberpunkFlickerInterval = null;
  }
  
  // 清除昵称容器故障效果间隔
  if (window.cyberpunkNicknameGlitchInterval) {
    clearInterval(window.cyberpunkNicknameGlitchInterval);
    window.cyberpunkNicknameGlitchInterval = null;
  }
});

// 添加处理按键的函数
function handleKeyPress(event) {
  // 仅在指定步骤激活彩蛋检测
  if (props.currentStep !== props.targetStep) return;
  
  // 将按键添加到序列中
  keySequence.value += event.key.toLowerCase();
  
  // 检查是否包含秘钥 - 使用"edgerunner"作为激活词
  if (keySequence.value.includes(import.meta.env.VITE_CYBERPUNK_HOTKEY)) {
    activateCyberpunkMode();
    keySequence.value = '';  // 重置序列
  }
  
  // 清除之前的超时并设置新的
  if (keySequenceTimeout.value) {
    clearTimeout(keySequenceTimeout.value);
  }
  
  // 设置30秒后重置序列
  keySequenceTimeout.value = setTimeout(() => {
    keySequence.value = '';
  }, 40000);
}

// 赛博朋克风格的示例纸条内容
const noteContent = "在夜之城，传奇不在于你如何活着，而在于你如何离开。记住，无论发生什么，我真的想留在你身边。";
const noteClass = 'cyberpunk-note';

// 获取示例纸条样式类
function getNoteClass() {
  return noteClass;
}

// 获取示例纸条内容 - 根据选中的角色返回不同内容
function getNoteContent() {
  // 如果有选中的角色，返回该角色的专属内容
  if (selectedCharacter.value) {
    const characterNotes = {
      // 边缘行者角色
      'David Martinez': "我会成为夜之城的传奇，无论付出什么代价。我的名字将被永远铭记。",
      'Lucy': "月球是我的梦想，但你是我的现实。在这座冰冷的城市里，你是唯一的温暖。",
      'Rebecca': "在夜之城，子弹比言语更有说服力。如果有人惹你，告诉我，我会让他们后悔。",
      'Maine': "力量不仅来自义体，更来自内心。记住，团队就是家人，我们一起战斗到最后。",
      'Kiwi': "信息就是力量，而我掌握着网络的脉搏。小心你的数据，它们在夜之城从不安全。",
      'Dorio': "忠诚是夜之城最稀缺的资源。找到值得信任的人，然后为他们而战。",
      'Pilar': "生活不需要太严肃，即使在夜之城。找到乐趣，享受每一刻，因为明天可能不再有机会。",
      'Falco': "有时候，最重要的不是目的地，而是旅途。我会带你安全穿越夜之城的每一条街道。",
      'Gloria': "无论发生什么，都不要忘记你是谁。在这座吞噬灵魂的城市里，保持你的人性。",
      
      // 赛博朋克2077游戏角色
      'V': "在夜之城，你要么成为大人物，要么默默无闻。我选择了前者，无论代价是什么。",
      'Johnny Silverhand': "摇滚从不死亡，它只是变成了传奇。记住，反抗到底，永不妥协。",
      'Judy Alvarez': "技术可以改变现实，但不能改变人心。在虚拟与现实之间，找到自己的平衡。",
      'Panam Palmer': "家人不仅仅是血缘，更是选择。在这片荒漠中，我们创造自己的规则和未来。",
      'Jackie Welles': "朋友，在夜之城，梦想值得追求，但别忘了享受旅程。干杯，敬生活！",
      'Rogue Amendiares': "在这座城市生存了五十年，我学到的是：永远不要停止适应变化。",
      'Takemura': "荣誉不在于你的主人，而在于你的行为。即使在夜之城，也要保持自己的道路。",
      'Kerry Eurodyne': "名声、财富、粉丝，都比不上真正的创作自由。找到你的声音，大声唱出来。",
      'Evelyn Parker': "信息是最有价值的商品，而我知道如何利用它。小心你的秘密，它们可能会背叛你。",
      'Dexter DeShawn': "在这行，声誉就是一切。做好准备，抓住机会，然后成为传奇。",
      'Meredith Stout': "在公司战争中，没有永久的盟友，只有永久的利益。记住这点，你就能生存。",
      'River Ward': "即使在最黑暗的地方，也能找到正义的火花。不要放弃寻找真相的勇气。",
      'Misty Olszewski': "命运的卡牌已经洗好，但如何出牌取决于你。聆听你内心的声音。",
      'Viktor Vector': "身体可以被改造，但灵魂是你自己的。别让技术吞噬了你的人性。",
      'T-Bug': "在网络中，我是幽灵，无形无踪。记住，最好的黑客从不留下痕迹。",
      'Adam Smasher': "肉体是弱点，钢铁是力量。在这座城市，只有最强的才能生存。",
      'Alt Cunningham': "意识可以超越肉体的限制。在数字世界中，我找到了真正的自由。",
      'Hanako Arasaka': "家族的责任重于泰山，但不要忘记你自己的心声。平衡是最难的艺术。",
      'Saburo Arasaka': "帝国不是建立在友谊上，而是建立在力量和控制上。永远记住这一点。",
      'Yorinobu Arasaka': "有时候，叛逆是唯一的选择。打破规则，创造自己的道路。"
    };
    
    return characterNotes[selectedCharacter.value] || noteContent;
  }
  
  // 默认返回通用内容
  return noteContent;
}

// 激活赛博朋克模式
function activateCyberpunkMode(playMusic = true) {
  try {
    console.log('激活赛博朋克边缘行者模式', playMusic ? '(包含音乐)' : '(无音乐)');
    
    // 发出激活事件
    emit('activate', true);
    
    // 边缘行者经典台词
    const edgerunnersQuotes = [
      "在夜之城成为传奇的唯一方式，就是死得轰轰烈烈。",
      "每个人都会死两次：一次是肉体的死亡，一次是被人遗忘。",
      "我真的想留在你身边。",
      "在这座城市，要么成为大人物，要么成为回忆。",
      "义体改造让你更强，但也会夺走你的人性。"
    ];
    
    // 随机选择一句台词
    const randomQuote = edgerunnersQuotes[Math.floor(Math.random() * edgerunnersQuotes.length)];
    
    // 刷新角色建议
    refreshCyberpunkCharacters();
    
    // 仅在初次激活时创建弹窗
    if (playMusic) {
      // 创建赛博朋克风格弹窗
      createCyberpunkModal("欢迎来到夜之城", randomQuote);
      
      // 播放边缘行者主题曲
      playCyberpunkMusic();
    }
    
    // 发送新事件 - 更新示例纸条内容
    emit('update-note-content', getNoteContent());
    // 发送新事件 - 更新示例纸条样式
    emit('update-note-class', getNoteClass());
    
    // 添加视觉效果，使用更可靠的方式
    clearTimeout(window.cyberpunkEffectTimeout);
    window.cyberpunkEffectTimeout = setTimeout(() => {
      console.log('延时后开始添加视觉效果');
      
      // 创建新的赛博朋克UI覆盖层，而不是修改现有容器
      createCyberpunkOverlay();
    }, 1500);
  } catch (error) {
    console.error('激活赛博朋克模式失败:', error);
    // 如果出错，显示简单提示
    alert('欢迎来到夜之城\n\n(彩蛋功能激活，但执行时出现错误)');
    // 确保至少昵称建议更新为赛博朋克角色
    emit('update-suggestions', ['David Martinez', 'Lucy', 'Rebecca', 'Maine']);
  }
}

// 刷新赛博朋克角色建议
function refreshCyberpunkCharacters() {
  try {
    // 扩展的赛博朋克角色池 - 包括边缘行者和赛博朋克2077游戏角色
    const allCyberpunkCharacters = [
      // 边缘行者角色
      'David Martinez', 'Lucy', 'Rebecca', 'Maine', 
      'Kiwi', 'Dorio', 'Pilar', 'Falco', 'Gloria',
      
      // 赛博朋克2077游戏角色
      'V', 'Johnny Silverhand', 'Judy Alvarez', 'Panam Palmer',
      'Jackie Welles', 'Rogue Amendiares', 'Takemura', 'Kerry Eurodyne',
      'Evelyn Parker', 'Dexter DeShawn', 'Meredith Stout', 'River Ward',
      'Misty Olszewski', 'Viktor Vector', 'T-Bug', 'Adam Smasher',
      'Alt Cunningham', 'Hanako Arasaka', 'Saburo Arasaka', 'Yorinobu Arasaka'
    ];
    
    // 随机选择4个角色
    const selectedCharacters = [];
    const charactersCopy = [...allCyberpunkCharacters]; // 创建副本以避免修改原数组
    
    // 确保至少有一个边缘行者角色
    const edgerunnerIndex = Math.floor(Math.random() * 9); // 0-8是边缘行者角色
    selectedCharacters.push(allCyberpunkCharacters[edgerunnerIndex]);
    charactersCopy.splice(edgerunnerIndex, 1);
    
    // 随机选择剩余3个角色
    for (let i = 0; i < 3; i++) {
      if (charactersCopy.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * charactersCopy.length);
      selectedCharacters.push(charactersCopy[randomIndex]);
      charactersCopy.splice(randomIndex, 1);
    }
    
    // 更新昵称建议
    emit('update-suggestions', selectedCharacters);
    
    // 扩展角色信息映射
    extendCharacterInfo();
    
    return selectedCharacters;
  } catch (error) {
    console.error('刷新赛博朋克角色失败:', error);
    // 如果出错，返回基本角色
    return ['David Martinez', 'Lucy', 'Rebecca', 'Maine'];
  }
}

// 扩展角色信息映射
function extendCharacterInfo() {
  // 在showCharacterInfo函数中的characterInfo对象添加更多角色信息
  window.cyberpunkExtendedCharacterInfo = {
    // 边缘行者角色 - 已有
    'David Martinez': '主角，年轻的边缘行者，梦想成为夜之城的传奇人物。',
    'Lucy': '神秘的网络行者，David的恋人，梦想去月球。',
    'Rebecca': '矮小但凶猛的边缘行者，使用双枪，性格暴躁但忠诚。',
    'Maine': '边缘行者小队的领袖，David的导师，强壮而可靠。',
    'Kiwi': '网络行者，技术高超但最终背叛了小队。',
    'Dorio': 'Maine的伴侣，冷静而强大的战士。',
    'Pilar': 'Rebecca的哥哥，话多但友善。',
    'Falco': '小队的司机，沉默寡言但值得信赖。',
    'Gloria': 'David的母亲，为了儿子的未来努力工作。',
    
    // 赛博朋克2077游戏角色
    'V': '赛博朋克2077的主角，一位雇佣兵，寻求在夜之城成名的方式。',
    'Johnny Silverhand': '传奇摇滚歌手和恐怖分子，由基努·里维斯饰演，以数字幽灵形式存在于V的脑中。',
    'Judy Alvarez': '顶尖的脑舞技师，专精于编辑和修改脑舞片段，是V的潜在爱情对象。',
    'Panam Palmer': '游牧民族"奥德卡多"的成员，技术精湛的载具专家，是V的潜在爱情对象。',
    'Jackie Welles': 'V的最好朋友和搭档，热情洋溢的雇佣兵，梦想成为夜之城的大人物。',
    'Rogue Amendiares': '夜之城传奇赏金猎人，曾与Johnny Silverhand共事，现在经营Afterlife酒吧。',
    'Takemura': '荒坂公司的前保镖，忠诚于荒坂三郎，在某些情况下成为V的盟友。',
    'Kerry Eurodyne': 'Johnny Silverhand乐队的前吉他手，现在是成功的摇滚明星，是V的潜在爱情对象。',
    'Evelyn Parker': '多洛尔丝俱乐部的高级伴游，策划了海伍德抢劫任务。',
    'Dexter DeShawn': '著名的赏金中间人，雇佣V执行海伍德抢劫任务。',
    'Meredith Stout': '军事科技公司的高级主管，处事冷酷无情。',
    'River Ward': '夜之城警探，寻求正义，是V的潜在爱情对象。',
    'Misty Olszewski': '神秘的塔罗牌读者，Jackie的女友，经营一家神秘商店。',
    'Viktor Vector': '值得信赖的义体医生，为V提供医疗服务和义体升级。',
    'T-Bug': '顶尖的网络行者，协助V执行海伍德抢劫任务。',
    'Adam Smasher': '全身义体化的杀手，为荒坂公司工作，是Johnny Silverhand的宿敌。',
    'Alt Cunningham': '传奇网络行者，Johnny Silverhand的前女友，现在以AI形式存在于网络中。',
    'Hanako Arasaka': '荒坂三郎的女儿，荒坂公司的高级主管。',
    'Saburo Arasaka': '荒坂公司的创始人和CEO，世界上最有权势的人之一。',
    'Yorinobu Arasaka': '荒坂三郎的儿子，反抗父亲的统治。'
  };
}

// 添加播放音乐的函数
function playCyberpunkMusic() {
  try {
    // 设置音频源 - 使用边缘行者主题曲（使用正确的路径）
    audioPlayer.value.src = '/assets/music/i-really-want-to-stay-at-your-house.mp3';
    audioPlayer.value.volume = 0.5; // 设置音量为50%
    
    // 尝试播放音频
    const playPromise = audioPlayer.value.play();
    
    // 处理自动播放策略限制
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('自动播放受限:', error);
        // 不再创建音乐控制按钮，而是在用户交互时尝试播放
        document.addEventListener('click', function playOnInteraction() {
          audioPlayer.value.play().catch(e => console.warn('交互后仍无法播放:', e));
          document.removeEventListener('click', playOnInteraction);
        }, { once: true });
      });
    }
  } catch (error) {
    console.error('播放音乐失败:', error);
    // 不再创建音乐控制按钮，而是在用户交互时尝试播放
    document.addEventListener('click', function playOnInteraction() {
      audioPlayer.value.play().catch(e => console.warn('交互后仍无法播放:', e));
      document.removeEventListener('click', playOnInteraction);
    }, { once: true });
  }
}

// 移除创建音乐控制按钮的函数，改为静默处理
function createMusicButton() {
  // 此函数保留但不再创建按钮，仅用于兼容性
  console.log('音乐播放按钮已被禁用，使用静默播放模式');
  
  // 添加一次性点击事件监听器，在用户交互时播放
  document.addEventListener('click', function playOnInteraction() {
    if (audioPlayer.value && audioPlayer.value.paused) {
      audioPlayer.value.play().catch(e => console.warn('交互后仍无法播放:', e));
    }
    document.removeEventListener('click', playOnInteraction);
  }, { once: true });
  
  return null; // 不返回按钮元素
}

// 创建赛博朋克风格弹窗
function createCyberpunkModal(title, quote) {
  // 创建模态框覆盖层
  const overlay = document.createElement('div');
  overlay.className = 'cyberpunk-modal-overlay';
  
  // 创建模态框容器
  const modal = document.createElement('div');
  modal.className = 'cyberpunk-modal';
  
  // 创建标题
  const titleElement = document.createElement('h2');
  titleElement.className = 'cyberpunk-modal-title';
  titleElement.textContent = title;
  
  // 创建引言
  const quoteElement = document.createElement('div');
  quoteElement.className = 'cyberpunk-modal-quote';
  quoteElement.textContent = quote;
  
  // 创建关闭按钮
  const closeButton = document.createElement('button');
  closeButton.className = 'cyberpunk-modal-close';
  closeButton.textContent = '进入夜之城';
  
  // 添加关闭事件
  closeButton.addEventListener('click', () => {
    overlay.classList.add('cyberpunk-overlay-closing');
    modal.classList.add('cyberpunk-modal-closing');
    
    // 动画结束后移除元素
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
      
      // 添加音乐控制按钮
      createMusicButton();
    }, 800);
  });
  
  // 组装模态框
  modal.appendChild(titleElement);
  modal.appendChild(quoteElement);
  modal.appendChild(closeButton);
  overlay.appendChild(modal);
  
  // 添加到body
  document.body.appendChild(overlay);
  
  // 延迟显示模态框（添加过渡效果）
  setTimeout(() => {
    overlay.style.opacity = '1';
    modal.style.opacity = '1';
    modal.style.transform = 'scale(1)';
  }, 100);
}


// 创建赛博朋克覆盖层 - 直接修改现有容器
function createCyberpunkOverlay() {
  console.log('创建赛博朋克风格 - 直接修改现有容器');
  
  try {
    // 清理可能已存在的所有效果元素
    const allEffects = document.querySelectorAll('.cyberpunk-global-style');
    allEffects.forEach(effect => {
      if (effect.parentNode) {
        effect.parentNode.removeChild(effect);
      }
    });
    
    // 1. 创建全局样式覆盖 - 这会直接修改现有容器
    const globalStyle = document.createElement('style');
    globalStyle.className = 'cyberpunk-global-style';
    globalStyle.textContent = `
      /* 全局背景和容器样式 */
      body {
        background-color: #0d0221 !important;
        background-image: linear-gradient(to bottom, rgba(13, 2, 33, 0.9), rgba(7, 2, 21, 0.95)) !important;
        color: #fff !important;
        font-family: 'Rajdhani', sans-serif !important;
      }
      
      /* 主容器样式 */
      .onboarding-container {
        background-color: rgba(13, 2, 33, 0.7) !important;
        border: 2px solid #ff0054 !important;
        box-shadow: 0 0 30px rgba(255, 0, 84, 0.5) !important;
        position: relative !important;
        overflow: hidden !important;
      }
      
      /* 添加顶部边框效果 */
      .onboarding-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 5px;
        background: linear-gradient(90deg, #ff0054, #00ffaa);
        z-index: 10;
      }
      
      /* 添加扫描线效果 */
      .onboarding-container::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          to bottom,
          transparent 50%,
          rgba(255, 0, 84, 0.05) 50%
        );
        background-size: 100% 4px;
        pointer-events: none;
        opacity: 0.3;
        z-index: 1;
      }
      
      /* 标题样式 */
      .onboarding-container h1, 
      .onboarding-container h2, 
      .onboarding-container h3, 
      .onboarding-container h4 {
        color: #ff0054 !important;
        font-family: 'Rajdhani', sans-serif !important;
        text-transform: uppercase !important;
        letter-spacing: 2px !important;
        text-shadow: 0 0 10px rgba(255, 0, 84, 0.5) !important;
        position: relative !important;
      }
      
      /* 文本样式 */
      .onboarding-container p, 
      .onboarding-container label, 
      .onboarding-container span {
        color: #fff !important;
        font-family: 'Rajdhani', sans-serif !important;
        text-shadow: 0 0 5px rgba(0, 255, 170, 0.3) !important;
      }
      
      /* 按钮样式 */
      .onboarding-container button,
      .onboarding-container .btn {
        background-color: rgba(13, 2, 33, 0.8) !important;
        border: 2px solid #ff0054 !important;
        color: #fff !important;
        font-family: 'Rajdhani', sans-serif !important;
        font-weight: bold !important;
        text-transform: uppercase !important;
        letter-spacing: 1px !important;
        box-shadow: 0 0 10px rgba(255, 0, 84, 0.5) !important;
        transition: all 0.3s ease !important;
        position: relative !important;
        overflow: hidden !important;
      }
      
      /* 按钮悬停效果 */
      .onboarding-container button:hover,
      .onboarding-container .btn:hover {
        background-color: rgba(255, 0, 84, 0.2) !important;
        box-shadow: 0 0 15px rgba(255, 0, 84, 0.7) !important;
        transform: translateY(-2px) !important;
      }
      
      /* 按钮光效 */
      .onboarding-container button::before,
      .onboarding-container .btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 0, 84, 0.3),
          transparent
        );
        transition: 0.5s;
      }
      
      .onboarding-container button:hover::before,
      .onboarding-container .btn:hover::before {
        left: 100%;
      }
      
      /* 输入框样式 */
      .onboarding-container input {
        background-color: rgba(13, 2, 33, 0.7) !important;
        border: 2px solid #ff0054 !important;
        color: #fff !important;
        font-family: 'Share Tech Mono', monospace !important;
        letter-spacing: 1px !important;
        box-shadow: 0 0 10px rgba(255, 0, 84, 0.5) !important;
        transition: all 0.3s ease !important;
      }
      
      /* 输入框焦点样式 */
      .onboarding-container input:focus {
        border-color: #00ffaa !important;
        box-shadow: 0 0 15px rgba(0, 255, 170, 0.7) !important;
        outline: none !important;
      }
      
      /* 昵称建议样式 */
      .nickname-suggestion {
        background-color: rgba(13, 2, 33, 0.8) !important;
        border: 2px solid #ff0054 !important;
        color: #fff !important;
        font-family: 'Rajdhani', sans-serif !important;
        font-weight: bold !important;
        text-transform: uppercase !important;
        letter-spacing: 1px !important;
        box-shadow: 0 0 10px rgba(255, 0, 84, 0.5) !important;
        transition: all 0.3s ease !important;
        position: relative !important;
        overflow: hidden !important;
      }
      
      /* 昵称建议悬停效果 */
      .nickname-suggestion:hover {
        background-color: rgba(255, 0, 84, 0.2) !important;
        transform: translateY(-5px) !important;
        box-shadow: 0 0 15px rgba(255, 0, 84, 0.7) !important;
      }
      
      /* 昵称建议光效 */
      .nickname-suggestion::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          45deg,
          transparent,
          rgba(255, 0, 84, 0.1),
          transparent
        );
        transform: translateX(-100%);
        transition: 0.5s;
      }
      
      .nickname-suggestion:hover::before {
        transform: translateX(100%);
      }
      
      /* 添加数字雨效果到整个容器 */
      .onboarding-container {
        position: relative;
      }
      
      /* 添加闪烁效果到标题 */
      @keyframes cyberpunk-text-flicker {
        0%, 100% { opacity: 1; }
        8%, 10% { opacity: 0.8; }
        20%, 25% { opacity: 1; }
        30% { opacity: 0.9; }
        40% { opacity: 1; }
        50%, 51% { opacity: 0.7; }
        60% { opacity: 1; }
      }
      
      .onboarding-container h1,
      .onboarding-container h2 {
        animation: cyberpunk-text-flicker 5s infinite;
      }
      
      /* 添加故障效果到按钮 */
      @keyframes cyberpunk-button-glitch {
        0% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        50% { transform: translateX(2px); }
        75% { transform: translateX(-1px); }
        100% { transform: translateX(0); }
      }
      
      .onboarding-container button:active {
        animation: cyberpunk-button-glitch 0.3s steps(3);
      }
      
      /* 夜之城风格的标题和描述 */
      .step-title {
        color: #ff0054 !important;
        font-size: 28px !important;
        letter-spacing: 3px !important;
        text-transform: uppercase !important;
        margin-bottom: 15px !important;
        position: relative !important;
        z-index: 2 !important;
      }
      
      .step-desc {
        color: #333333 !important;
        font-size: 16px !important;
        letter-spacing: 1px !important;
        margin-bottom: 30px !important;
        position: relative !important;
        z-index: 2 !important;
      }
      
      /* 特别为称呼设置页面添加样式 */
      .nickname-step .step-title {
        color: #ff0054 !important;
        text-shadow: 0 0 10px rgba(255, 0, 84, 0.7) !important;
      }
      
      .nickname-step .step-desc {
        color: #00ffaa !important;
        text-shadow: 0 0 8px rgba(0, 255, 170, 0.7) !important;
      }
    `;
    document.head.appendChild(globalStyle);
    
    // 2. 获取昵称容器并应用特殊效果
    const nicknameContainer = document.querySelector('.nickname-container');
    if (nicknameContainer) {
      // 添加赛博朋克类名
      nicknameContainer.classList.add('cyberpunk-nickname-container');
      
      // 添加特殊样式
      const nicknameStyle = document.createElement('style');
      nicknameStyle.className = 'cyberpunk-global-style';
      nicknameStyle.textContent = `
        .cyberpunk-nickname-container {
          position: relative;
          border: 2px solid #ff0054 !important;
          background-color: rgba(13, 2, 33, 0.9) !important;
          padding: 20px !important;
          box-shadow: 0 0 20px rgba(255, 0, 84, 0.4), inset 0 0 10px rgba(0, 255, 170, 0.1) !important;
        }
        
        .cyberpunk-nickname-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, 
            transparent 0%, 
            rgba(255, 0, 84, 0.03) 25%,
            transparent 50%,
            rgba(0, 255, 170, 0.03) 75%, 
            transparent 100%
          );
          z-index: 1;
          pointer-events: none;
        }
        
        .cyberpunk-nickname-container::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.05), transparent);
          transform: skewX(-25deg);
          animation: cyberpunk-container-shift 8s infinite alternate;
          z-index: 1;
          pointer-events: none;
        }
        
        @keyframes cyberpunk-container-shift {
          0% { transform: translateX(0) skewX(-25deg); opacity: 0; }
          20% { opacity: 0.3; }
          60% { opacity: 0; }
          100% { transform: translateX(300%) skewX(-25deg); opacity: 0.3; }
        }
      `;
      document.head.appendChild(nicknameStyle);
    
    // 添加昵称建议的特殊效果
    const suggestions = nicknameContainer.querySelectorAll('.nickname-suggestion');
    suggestions.forEach(suggestion => {
        // 添加点击事件，显示角色信息
        suggestion.addEventListener('click', (event) => {
          // 获取角色名称
          const characterName = suggestion.textContent.trim();
          
          // 显示角色信息
          setTimeout(() => {
            showCharacterInfo(characterName, event);
          }, 100);
        }, true);
      });
      
      // 为昵称容器添加更多赛博朋克风格的动画效果
      addCyberpunkAnimationsToNicknameContainer(nicknameContainer);
    }
    
    // 3. 添加随机闪烁效果
    startRandomFlickerEffects();
    
    // 4. 应用赛博朋克2077风格的故障字体动画特效到标题和描述
    applyCyberpunkTextEffects();
    
    // 5. 保存状态，防止重复应用
    window.cyberpunkModeActive = true;
    
  } catch (error) {
    console.error('创建赛博朋克风格失败:', error);
  }
}

// 应用赛博朋克2077风格的故障字体动画特效到标题和描述
function applyCyberpunkTextEffects() {
  try {
    // 获取所有标题和描述
    const titles = document.querySelectorAll('.step-title');
    const descriptions = document.querySelectorAll('.step-desc');
    
    // 特别处理"您希望如何被称呼？"页面
    titles.forEach(title => {
      // 保存原始文本
      const originalText = title.textContent;
      
      // 清除原有的类和内容
      title.className = 'step-title';
      
      // 检查是否是"您希望如何被称呼？"页面
      if (originalText.includes('如何被称呼')) {
        // 替换为夜之城风格的标语
        title.textContent = '选择您的夜之城身份';
        
        // 使用更简洁的霓虹效果，而不是过度的故障效果
        title.style.color = '#ff0054';
        title.style.textShadow = '0 0 10px rgba(255, 0, 84, 0.7), 0 0 20px rgba(255, 0, 84, 0.5)';
        title.style.fontFamily = "'Rajdhani', sans-serif";
        title.style.fontWeight = 'bold';
        title.style.letterSpacing = '3px';
        title.style.textTransform = 'uppercase';
        
        // 添加简单的霓虹脉冲动画
        const style = document.createElement('style');
        style.className = 'cyberpunk-global-style';
        style.textContent = `
          @keyframes neon-title-pulse {
            0% { text-shadow: 0 0 10px rgba(255, 0, 84, 0.7), 0 0 20px rgba(255, 0, 84, 0.5); }
            50% { text-shadow: 0 0 15px rgba(255, 0, 84, 0.9), 0 0 30px rgba(255, 0, 84, 0.7), 0 0 40px rgba(255, 0, 84, 0.5); }
            100% { text-shadow: 0 0 10px rgba(255, 0, 84, 0.7), 0 0 20px rgba(255, 0, 84, 0.5); }
          }
          
          .step-title {
            animation: neon-title-pulse 2s ease-in-out infinite;
          }
        `;
        document.head.appendChild(style);
      } else {
        // 为其他标题添加基本效果
        title.style.color = '#ff0054';
        title.style.textShadow = '0 0 8px rgba(255, 0, 84, 0.6)';
        title.style.fontFamily = "'Rajdhani', sans-serif";
        title.style.letterSpacing = '2px';
      }
    });
    
    descriptions.forEach(desc => {
      // 保存原始文本
      const originalText = desc.textContent;
      
      // 清除原有的类和内容
      desc.className = 'step-desc';
      
      // 检查是否是"您希望如何被称呼？"页面的描述
      if (originalText.includes('专属称呼') || originalText.includes('心语纸条')) {
        // 替换为夜之城风格的标语
        desc.textContent = '在这座城市，名字就是一切 — 选择您的传奇身份';
        
        // 使用更简洁的青色霓虹效果
        desc.style.color = '#00ffaa';
        desc.style.textShadow = '0 0 8px rgba(0, 255, 170, 0.7)';
        desc.style.fontFamily = "'Rajdhani', sans-serif";
        desc.style.letterSpacing = '1.5px';
        
        // 添加简单的扫描线效果
        const scanlineEffect = document.createElement('div');
        scanlineEffect.className = 'cp77-effect cp77-scanlines';
        scanlineEffect.style.position = 'absolute';
        scanlineEffect.style.top = '0';
        scanlineEffect.style.left = '0';
        scanlineEffect.style.width = '100%';
        scanlineEffect.style.height = '100%';
        scanlineEffect.style.pointerEvents = 'none';
        scanlineEffect.style.zIndex = '1';
        scanlineEffect.style.opacity = '0.15';
        
        // 将扫描线效果添加到描述的父元素
        if (desc.parentElement) {
          desc.parentElement.style.position = 'relative';
          desc.parentElement.appendChild(scanlineEffect);
        }
      } else {
        // 为其他描述添加基本效果
        desc.style.color = '#00ffaa';
        desc.style.textShadow = '0 0 5px rgba(0, 255, 170, 0.5)';
        desc.style.fontFamily = "'Rajdhani', sans-serif";
      }
    });
    
    // 为称呼设置页面的容器添加特殊效果
    const nicknameStep = document.querySelector('.step-container');
    if (nicknameStep) {
      nicknameStep.classList.add('nickname-step');
      
      // 添加边框效果，但不使用过度的故障效果
      nicknameStep.style.border = '2px solid rgb(43, 43, 43)';
      nicknameStep.style.boxShadow = '0 0 10px rgba(48, 48, 48, 0.5)';
      nicknameStep.style.position = 'relative';
      nicknameStep.style.overflow = 'hidden';
      
      // 添加简单的边框动画
      const borderStyle = document.createElement('style');
      borderStyle.className = 'cyberpunk-global-style';
      borderStyle.textContent = `
        @keyframes border-pulse {
          0% { border-color:rgb(0, 0, 0); box-shadow: 0 0 10px rgba(26, 26, 26, 0.5); }
          50% { border-color: #ff0054; box-shadow: 0 0 15px rgba(255, 0, 84, 0.5); }
          100% { border-color:rgb(0, 0, 0); box-shadow: 0 0 10px rgba(39, 39, 39, 0.5); }
        }
        
        .nickname-step {
          animation: border-pulse 4s ease-in-out infinite;
        }
      `;
      document.head.appendChild(borderStyle);
    }
    
  } catch (error) {
    console.error('应用赛博朋克文本效果失败:', error);
  }
}

// 为昵称容器添加更多赛博朋克风格的动画效果
function addCyberpunkAnimationsToNicknameContainer(container) {
  try {
    // 清除可能已存在的动画元素
    const existingEffects = container.querySelectorAll('.cp77-effect');
    existingEffects.forEach(effect => {
      if (effect.parentNode) {
        effect.parentNode.removeChild(effect);
      }
    });
    
    // 添加扫描线效果
    const scanlines = document.createElement('div');
    scanlines.className = 'cp77-scanlines cp77-effect';
    container.appendChild(scanlines);
    
    // 添加数字雨效果
    const digitalRain = document.createElement('div');
    digitalRain.className = 'cp77-digital-rain cp77-effect';
    container.appendChild(digitalRain);
    
    // 添加噪点效果
    const noise = document.createElement('div');
    noise.className = 'cp77-noise cp77-effect';
    container.appendChild(noise);
    
    // 添加故障效果容器
    const glitchContainer = document.createElement('div');
    glitchContainer.className = 'cp77-glitch-container cp77-effect';
    container.appendChild(glitchContainer);
    
    // 创建不同类型的故障效果
    const glitchTypes = ['horizontal', 'vertical', 'rgb-split', 'flicker'];
    glitchTypes.forEach(type => {
      const glitch = document.createElement('div');
      glitch.className = 'cp77-glitch-effect';
      glitch.setAttribute('data-glitch-type', type);
      glitchContainer.appendChild(glitch);
    });
    
    // 设置容器为相对定位，以便正确显示动画效果
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    
    // 定期触发随机故障效果
    const glitchInterval = setInterval(() => {
      if (!document.body.contains(container)) {
        clearInterval(glitchInterval);
        return;
      }
      
      if (Math.random() > 0.7) {
        // 随机选择一个故障效果
        const glitchEffects = glitchContainer.querySelectorAll('.cp77-glitch-effect');
        const randomGlitch = glitchEffects[Math.floor(Math.random() * glitchEffects.length)];
        
        // 激活故障效果
        randomGlitch.classList.add('active');
        
        // 短暂显示后关闭
        setTimeout(() => {
          randomGlitch.classList.remove('active');
        }, 300 + Math.random() * 500);
      }
    }, 2000 + Math.random() * 3000);
    
    // 添加边框闪烁效果
    const borderFlash = document.createElement('style');
    borderFlash.className = 'cyberpunk-global-style';
    borderFlash.textContent = `
      @keyframes cyberpunk-border-flash {
        0%, 100% { border-color: #ff0054; }
        50% { border-color: #00ffaa; }
      }
      
      .cyberpunk-nickname-container {
        animation: cyberpunk-border-flash 4s infinite alternate;
      }
    `;
    document.head.appendChild(borderFlash);
    
    // 为昵称输入框添加特殊效果
    const inputContainer = container.querySelector('.nickname-input');
    if (inputContainer) {
      const input = inputContainer.querySelector('input');
      if (input) {
        input.classList.add('cp77-input');
        
        // 添加输入时的故障效果
        input.addEventListener('input', () => {
          // 随机选择一个故障效果
          const glitchEffects = glitchContainer.querySelectorAll('.cp77-glitch-effect');
          const randomGlitch = glitchEffects[Math.floor(Math.random() * glitchEffects.length)];
          
          // 激活故障效果
          randomGlitch.classList.add('active');
          
          // 短暂显示后关闭
          setTimeout(() => {
            randomGlitch.classList.remove('active');
          }, 200);
        });
      }
    }
    
    // 为标题添加故障文本效果
    const suggestionTitle = container.querySelector('.suggestion-title');
    if (suggestionTitle) {
      suggestionTitle.classList.add('cp77-glitch-text');
      suggestionTitle.setAttribute('data-text', suggestionTitle.textContent);
    }
    
    // 为昵称建议按钮添加悬停时的特殊效果
    const suggestionButtons = container.querySelectorAll('.nickname-suggestion');
    suggestionButtons.forEach(button => {
      button.classList.add('cp77-suggestion');
      
      // 添加悬停时的故障效果
      button.addEventListener('mouseenter', () => {
        // 随机选择一个故障效果
        const glitchEffects = glitchContainer.querySelectorAll('.cp77-glitch-effect');
        const randomGlitch = glitchEffects[Math.floor(Math.random() * glitchEffects.length)];
        
        // 激活故障效果
        randomGlitch.classList.add('active');
        
        // 短暂显示后关闭
        setTimeout(() => {
          randomGlitch.classList.remove('active');
        }, 300);
      });
    });
    
    // 保存间隔ID以便清理
    window.cyberpunkNicknameGlitchInterval = glitchInterval;
    
  } catch (error) {
    console.error('添加昵称容器动画效果失败:', error);
  }
}

// 添加随机闪烁效果
function startRandomFlickerEffects() {
  // 清除可能存在的旧定时器
  if (window.cyberpunkFlickerInterval) {
    clearInterval(window.cyberpunkFlickerInterval);
  }
  
  // 定期触发闪烁效果
  window.cyberpunkFlickerInterval = setInterval(() => {
    if (Math.random() > 0.7) {
      // 随机选择一个元素进行闪烁
      const elements = document.querySelectorAll('.onboarding-container button, .nickname-suggestion, .onboarding-container h3');
      if (elements.length > 0) {
        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        
        // 应用闪烁效果
        randomElement.style.opacity = '0.5';
        setTimeout(() => {
          randomElement.style.opacity = '1';
        }, 100);
        
        // 有时添加轻微位移
        if (Math.random() > 0.5) {
          randomElement.style.transform = 'translateX(2px)';
  setTimeout(() => {
            randomElement.style.transform = '';
          }, 150);
        }
      }
    }
  }, 3000);
}

// 停用赛博朋克模式
function deactivateCyberpunkMode() {
  try {
    console.log('停用赛博朋克边缘行者模式');
    
    // 停止音乐播放
    if (audioPlayer.value) {
      audioPlayer.value.pause();
      audioPlayer.value.currentTime = 0;
    }
    
    // 清除闪烁效果间隔
    if (window.cyberpunkFlickerInterval) {
      clearInterval(window.cyberpunkFlickerInterval);
      window.cyberpunkFlickerInterval = null;
    }
    
    // 清除昵称容器故障效果间隔
    if (window.cyberpunkNicknameGlitchInterval) {
      clearInterval(window.cyberpunkNicknameGlitchInterval);
      window.cyberpunkNicknameGlitchInterval = null;
    }
    
    // 移除模态框
    const modalOverlay = document.querySelector('.cyberpunk-modal-overlay');
    if (modalOverlay && document.body.contains(modalOverlay)) {
      document.body.removeChild(modalOverlay);
    }
    
    // 移除音乐按钮
    const musicButton = document.querySelector('.cyberpunk-music-button');
    if (musicButton && document.body.contains(musicButton)) {
      document.body.removeChild(musicButton);
    }
    
    // 移除角色提示
    const characterToast = document.querySelector('.cyberpunk-character-toast');
    if (characterToast && document.body.contains(characterToast)) {
      document.body.removeChild(characterToast);
    }
    
    // 移除全局样式
    const globalStyles = document.querySelectorAll('.cyberpunk-global-style');
    globalStyles.forEach(style => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    });
    
    // 移除所有添加的效果元素
    const effectElements = document.querySelectorAll('.cp77-effect, .cp77-overlay, .cp77-scanlines, .cp77-glitch-effect');
    effectElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    
    // 清理昵称容器
    const nicknameContainer = document.querySelector('.nickname-container');
    if (nicknameContainer) {
      // 移除所有赛博朋克相关类
      nicknameContainer.classList.remove('cyberpunk-mode');
      
      // 清除可能的内联样式
      nicknameContainer.style = '';
      
      // 清理昵称建议按钮
      const suggestions = nicknameContainer.querySelectorAll('.nickname-suggestion');
      suggestions.forEach(suggestion => {
        suggestion.style = '';
        
        // 移除所有事件监听器的克隆方法
        const newSuggestion = suggestion.cloneNode(true);
        if (suggestion.parentNode) {
          suggestion.parentNode.replaceChild(newSuggestion, suggestion);
        }
      });
      
      // 清理输入框
      const input = nicknameContainer.querySelector('input');
      if (input) {
        input.style = '';
      }
    }
    
    // 恢复原始文本样式
    restoreOriginalTextStyles();
    
    // 重置状态
    window.cyberpunkModeActive = false;
    
    // 发出停用事件
    emit('deactivate', false);
  } catch (error) {
    console.error('停用赛博朋克模式失败:', error);
  }
}

// 恢复标题和描述的原始样式
function restoreOriginalTextStyles() {
  try {
    // 恢复标题样式
    const titles = document.querySelectorAll('.step-title');
    titles.forEach(title => {
      // 移除所有赛博朋克相关类
      title.classList.remove('glitch-text', 'neon-pulse', 'digital-rain', 'tv-glitch', 'edge-glitch');
      
      // 清除直接设置的样式
      title.style.color = '';
      title.style.textShadow = '';
      title.style.fontFamily = '';
      title.style.fontWeight = '';
      title.style.letterSpacing = '';
      title.style.textTransform = '';
      title.style.animation = '';
      
      // 如果是称呼页面，恢复原始文本
      if (title.textContent === '选择您的夜之城身份') {
        title.textContent = '您希望如何被称呼？';
      }
      
      // 移除data-text属性
      title.removeAttribute('data-text');
    });
    
    // 恢复描述样式
    const descriptions = document.querySelectorAll('.step-desc');
    descriptions.forEach(desc => {
      // 移除所有赛博朋克相关类
      desc.classList.remove('glitch-text', 'neon-pulse', 'digital-rain', 'tv-glitch', 'edge-glitch');
      
      // 清除直接设置的样式
      desc.style.color = '';
      desc.style.textShadow = '';
      desc.style.fontFamily = '';
      desc.style.letterSpacing = '';
      desc.style.animation = '';
      
      // 如果是称呼页面，恢复原始文本
      if (desc.textContent === '在这座城市，名字就是一切 — 选择您的传奇身份') {
        desc.textContent = '设置一个专属称呼，让心语纸条更有温度';
      }
      
      // 移除添加的扫描线效果
      if (desc.parentElement) {
        const scanlines = desc.parentElement.querySelector('.cp77-scanlines');
        if (scanlines) {
          desc.parentElement.removeChild(scanlines);
        }
        desc.parentElement.style.position = '';
      }
    });
    
    // 移除称呼页面容器的特殊效果
    const nicknameStep = document.querySelector('.step-container');
    if (nicknameStep) {
      nicknameStep.classList.remove('nickname-step', 'glitch-border');
      
      // 清除直接设置的样式
      nicknameStep.style.border = '';
      nicknameStep.style.boxShadow = '';
      nicknameStep.style.position = '';
      nicknameStep.style.overflow = '';
      nicknameStep.style.animation = '';
    }
    
    // 移除所有添加的全局样式
    const globalStyles = document.querySelectorAll('.cyberpunk-global-style');
    globalStyles.forEach(style => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    });
    
    // 移除所有添加的效果元素
    const effectElements = document.querySelectorAll('.cp77-effect');
    effectElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    
    // 清理昵称容器
    const nicknameContainer = document.querySelector('.nickname-container');
    if (nicknameContainer) {
      // 移除所有赛博朋克相关类
      nicknameContainer.classList.remove('cyberpunk-mode');
      
      // 清除可能的内联样式
      nicknameContainer.style = '';
      
      // 清理昵称建议按钮
      const suggestions = nicknameContainer.querySelectorAll('.nickname-suggestion');
      suggestions.forEach(suggestion => {
        suggestion.style = '';
        
        // 移除所有事件监听器的克隆方法
        const newSuggestion = suggestion.cloneNode(true);
        if (suggestion.parentNode) {
          suggestion.parentNode.replaceChild(newSuggestion, suggestion);
        }
      });
      
      // 清理输入框
      const input = nicknameContainer.querySelector('input');
      if (input) {
        input.style = '';
      }
    }
  } catch (error) {
    console.error('恢复原始文本样式失败:', error);
  }
}

// 显示角色信息并更新选中的角色
function showCharacterInfo(character, event) {
  try {
    console.log('显示角色信息:', character);
    
    // 更新选中的角色
    selectedCharacter.value = character;
    
    // 更新纸条内容
    emit('update-note-content', getNoteContent());
    
    // 角色信息映射 - 使用扩展的角色信息
    const characterInfo = window.cyberpunkExtendedCharacterInfo || {
      'David Martinez': '主角，年轻的边缘行者，梦想成为夜之城的传奇人物。',
      'Lucy': '神秘的网络行者，David的恋人，梦想去月球。',
      'Rebecca': '矮小但凶猛的边缘行者，使用双枪，性格暴躁但忠诚。',
      'Maine': '边缘行者小队的领袖，David的导师，强壮而可靠。',
      'Kiwi': '网络行者，技术高超但最终背叛了小队。',
      'Dorio': 'Maine的伴侣，冷静而强大的战士。',
      'Pilar': 'Rebecca的哥哥，话多但友善。',
      'Falco': '小队的司机，沉默寡言但值得信赖。',
      'Gloria': 'David的母亲，为了儿子的未来努力工作。'
    };
    
    // 获取角色描述
    const info = characterInfo[character] || '夜之城的神秘人物';
    
    // 移除可能存在的旧提示
    const oldToast = document.querySelector('.cyberpunk-character-toast');
    if (oldToast && document.body.contains(oldToast)) {
      document.body.removeChild(oldToast);
    }
    
    // 创建角色提示
    const toast = document.createElement('div');
    toast.className = 'cyberpunk-character-toast';
    
    // 添加赛博朋克风格的内容
    toast.innerHTML = `
      <div class="cyberpunk-character-header">
        <strong class="cyberpunk-character-name">${character}</strong>
      </div>
      <div class="cyberpunk-character-info">${info}</div>
      <div class="cyberpunk-character-scanline"></div>
      <div class="cyberpunk-character-noise"></div>
    `;
    
    // 添加到body
    document.body.appendChild(toast);

    // 定位到点击位置附近
    if (event && event.target) {
      const rect = event.target.getBoundingClientRect();
      
      // 设置为绝对定位，相对于视口
      toast.style.position = 'fixed';
      toast.style.bottom = 'auto';
      toast.style.left = 'auto';
      toast.style.transform = 'none';
      
      // 将提示框定位在点击元素的上方
      toast.style.top = `${rect.top - toast.offsetHeight - 10}px`;
      toast.style.left = `${rect.left + (rect.width / 2) - (toast.offsetWidth / 2)}px`;
      
      // 确保提示框不超出视口
      const toastRect = toast.getBoundingClientRect();
      if (toastRect.left < 10) {
        toast.style.left = '10px';
      } else if (toastRect.right > window.innerWidth - 10) {
        toast.style.left = `${window.innerWidth - toast.offsetWidth - 10}px`;
      }
      
      // 如果顶部空间不足，则显示在元素下方
      if (toastRect.top < 10) {
        toast.style.top = `${rect.bottom + 10}px`;
      }
    }
    
    // 添加出现动画
    setTimeout(() => {
      toast.classList.add('active');
    }, 10);
    
    // 设置自动消失
    setTimeout(() => {
      if (document.body.contains(toast)) {
        toast.classList.remove('active');
        toast.classList.add('closing');
        
        // 动画结束后移除
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 500);
      }
    }, 5000);
    
    // 添加随机故障效果
    let glitchTimeout;
    const triggerGlitch = () => {
      if (!document.body.contains(toast)) return;
      
      toast.classList.add('glitch');
      setTimeout(() => {
        toast.classList.remove('glitch');
        
        // 随机安排下一次故障
        glitchTimeout = setTimeout(triggerGlitch, 2000 + Math.random() * 3000);
      }, 150);
    };
    
    // 开始故障效果
    glitchTimeout = setTimeout(triggerGlitch, 1000 + Math.random() * 1000);
    
    // 清理故障效果
    setTimeout(() => {
      clearTimeout(glitchTimeout);
    }, 5000);
    
  } catch (error) {
    console.error('显示角色信息失败:', error);
  }
}

// 导出需要暴露给父组件的方法
defineExpose({
  showCharacterInfo,
  activateCyberpunkMode,
  deactivateCyberpunkMode,
  refreshCyberpunkCharacters,
  restoreOriginalTextStyles,
  createCyberpunkOverlay
});

// ... existing code ...
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');


/* 赛博朋克模式相关样式 */
.cyberpunk-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  opacity: 0;
  transition: opacity 0.5s ease;
}

/* 移除音乐按钮相关样式 */
.cyberpunk-music-button {
  display: none !important; /* 完全隐藏按钮 */
}

.cyberpunk-volume-control {
  display: none !important; /* 完全隐藏音量控制 */
}

.cyberpunk-overlay-visible {
  opacity: 1;
}

/* ... 保留其他原有样式 ... */

/* 赛博朋克覆盖层 */
.cp77-overlay {
  pointer-events: none;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 0 20px rgba(255, 0, 84, 0.7);
  background-color: rgba(13, 2, 33, 0.2);
}

/* 扫描线效果 */
.cp77-scanlines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(255, 0, 84, 0.1) 50%
  );
  background-size: 100% 4px;
  z-index: 2;
  pointer-events: none;
  opacity: 0.5;
}

/* 故障效果 */
.cp77-glitch-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
  opacity: 0;
  mix-blend-mode: screen;
}

.cp77-glitch-effect.active {
  opacity: 1;
}

/* 水平故障 */
.cp77-glitch-effect[data-glitch-type="horizontal"] {
  background: linear-gradient(
    transparent 20%, 
    rgba(255, 0, 84, 0.3) 20%, 
    rgba(255, 0, 84, 0.3) 21%, 
    transparent 21%,
    transparent 40%,
    rgba(0, 255, 255, 0.3) 40%,
    rgba(0, 255, 255, 0.3) 41%,
    transparent 41%,
    transparent 60%,
    rgba(255, 255, 0, 0.3) 60%,
    rgba(255, 255, 0, 0.3) 61%,
    transparent 61%
  );
  animation: horizontal-glitch 0.3s steps(1) infinite;
}

@keyframes horizontal-glitch {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  50% {
    transform: translateX(5px);
  }
  75% {
    transform: translateX(-2px);
  }
  100% {
    transform: translateX(0);
  }
}

/* 垂直故障 */
.cp77-glitch-effect[data-glitch-type="vertical"] {
  background: linear-gradient(
    90deg,
    transparent 20%, 
    rgba(255, 0, 84, 0.3) 20%, 
    rgba(255, 0, 84, 0.3) 21%, 
    transparent 21%,
    transparent 40%,
    rgba(0, 255, 255, 0.3) 40%,
    rgba(0, 255, 255, 0.3) 41%,
    transparent 41%,
    transparent 60%,
    rgba(255, 255, 0, 0.3) 60%,
    rgba(255, 255, 0, 0.3) 61%,
    transparent 61%
  );
  animation: vertical-glitch 0.3s steps(1) infinite;
}

@keyframes vertical-glitch {
  0% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-5px);
  }
  50% {
    transform: translateY(5px);
  }
  75% {
    transform: translateY(-2px);
  }
  100% {
    transform: translateY(0);
  }
}

/* RGB分离故障 */
.cp77-glitch-effect[data-glitch-type="rgb-split"] {
  background: transparent;
  box-shadow: 
    -5px 0 0 rgba(255, 0, 0, 0.3),
    5px 0 0 rgba(0, 255, 255, 0.3),
    0 0 0 rgba(255, 255, 0, 0.3);
  animation: rgb-split 0.3s steps(1) infinite;
}

@keyframes rgb-split {
  0% {
    box-shadow: 
      -5px 0 0 rgba(255, 0, 0, 0.3),
      5px 0 0 rgba(0, 255, 255, 0.3),
      0 0 0 rgba(255, 255, 0, 0.3);
  }
  25% {
    box-shadow: 
      5px 0 0 rgba(255, 0, 0, 0.3),
      -5px 0 0 rgba(0, 255, 255, 0.3),
      0 0 0 rgba(255, 255, 0, 0.3);
  }
  50% {
    box-shadow: 
      0 -5px 0 rgba(255, 0, 0, 0.3),
      0 5px 0 rgba(0, 255, 255, 0.3),
      0 0 0 rgba(255, 255, 0, 0.3);
  }
  75% {
    box-shadow: 
      0 5px 0 rgba(255, 0, 0, 0.3),
      0 -5px 0 rgba(0, 255, 255, 0.3),
      0 0 0 rgba(255, 255, 0, 0.3);
  }
  100% {
    box-shadow: 
      -5px 0 0 rgba(255, 0, 0, 0.3),
      5px 0 0 rgba(0, 255, 255, 0.3),
      0 0 0 rgba(255, 255, 0, 0.3);
  }
}

/* 闪烁故障 */
.cp77-glitch-effect[data-glitch-type="flicker"] {
  background: transparent;
  opacity: 1;
  animation: flicker-glitch 0.3s steps(1) infinite;
}

@keyframes flicker-glitch {
  0%, 100% {
    opacity: 1;
  }
  25%, 75% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.7;
  }
}

/* 数字雨效果 */
.cp77-digital-rain {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(0, 255, 170, 0.05)
  );
  z-index: 1;
  pointer-events: none;
  opacity: 0.5;
}

/* 噪点效果 */
.cp77-noise {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AcGEgAPOKt0EQAAAGlJREFUaN7t18EJwCAURNFnYP9Nxw42kAyIyPXOyv+7MCRVJEmSJEmS9Fgj4jxz3zxzIkQIESKECBFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECHkRdLLBzVdFr7KAAAAAElFTkSuQmCC');
  background-repeat: repeat;
  opacity: 0.05;
  z-index: 4;
  pointer-events: none;
  animation: noise-animation 0.5s steps(10) infinite;
}

@keyframes noise-animation {
  0% { transform: translate(0, 0); }
  10% { transform: translate(-1%, -1%); }
  20% { transform: translate(1%, 1%); }
  30% { transform: translate(-2%, -2%); }
  40% { transform: translate(2%, 2%); }
  50% { transform: translate(-1%, 1%); }
  60% { transform: translate(1%, -1%); }
  70% { transform: translate(3%, -3%); }
  80% { transform: translate(-3%, 3%); }
  90% { transform: translate(2%, -2%); }
  100% { transform: translate(0, 0); }
}

/* 故障文本效果 */
.cp77-glitch-text {
  position: relative;
  display: inline-block;
  font-family: 'Rajdhani', sans-serif;
  font-weight: bold;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 5px rgba(255, 0, 84, 0.7);
}

.cp77-glitch-text::before,
.cp77-glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.8;
}

.cp77-glitch-text::before {
  color: #0ff;
  z-index: -1;
  animation: cp77-glitch-before 2s infinite;
}

.cp77-glitch-text::after {
  color: #f0f;
  z-index: -2;
  animation: cp77-glitch-after 3s infinite;
}

@keyframes cp77-glitch-before {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-3px, 0);
  }
  40% {
    transform: translate(3px, 0);
  }
  60% {
    transform: translate(-3px, 0);
  }
  80% {
    transform: translate(3px, 0);
  }
  100% {
    transform: translate(0);
  }
}

@keyframes cp77-glitch-after {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(3px, 0);
  }
  40% {
    transform: translate(-3px, 0);
  }
  60% {
    transform: translate(3px, 0);
  }
  80% {
    transform: translate(-3px, 0);
  }
  100% {
    transform: translate(0);
  }
}

/* 输入框样式 */
.cp77-input {
  background-color: rgba(13, 2, 33, 0.7) !important;
  border: 2px solid #ff0054 !important;
  color: #fff !important;
  font-family: 'Share Tech Mono', monospace !important;
  letter-spacing: 1px !important;
  box-shadow: 0 0 10px rgba(255, 0, 84, 0.5) !important;
  transition: all 0.3s ease !important;
}

.cp77-input:focus {
  border-color: #00ffaa !important;
  box-shadow: 0 0 15px rgba(0, 255, 170, 0.7) !important;
}

/* 按钮样式 */
.cp77-button {
  background-color: rgba(13, 2, 33, 0.8) !important;
  border: 2px solid #ff0054 !important;
  color: #fff !important;
  font-family: 'Rajdhani', sans-serif !important;
  font-weight: bold !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
  box-shadow: 0 0 10px rgba(255, 0, 84, 0.5) !important;
  transition: all 0.3s ease !important;
  position: relative !important;
  overflow: hidden !important;
}

.cp77-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: 0.5s;
}

.cp77-button:hover {
  background-color: rgba(255, 0, 84, 0.2) !important;
  box-shadow: 0 0 15px rgba(0, 255, 170, 0.7) !important;
  transform: translateY(-3px) !important;
}

.cp77-button:hover::before {
  left: 100%;
}

/* 昵称建议样式 */
.cp77-suggestion {
  background-color: rgba(13, 2, 33, 0.8) !important;
  border: 2px solid #ff0054 !important;
  color: #fff !important;
  font-family: 'Rajdhani', sans-serif !important;
  font-weight: bold !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
  box-shadow: 0 0 10px rgba(255, 0, 84, 0.5) !important;
  transition: all 0.3s ease !important;
  position: relative !important;
  overflow: hidden !important;
}

.cp77-suggestion::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 0, 84, 0.1),
    transparent
  );
  transform: translateX(-100%);
  transition: 0.5s;
}

.cp77-suggestion:hover {
  background-color: rgba(255, 0, 84, 0.2) !important;
  transform: translateY(-5px) !important;
  box-shadow: 0 0 15px rgba(0, 255, 170, 0.7) !important;
}

.cp77-suggestion:hover::before {
  transform: translateX(100%);
}

/* 赛博朋克纸条样式 */
.cyberpunk-note {
  background: linear-gradient(to bottom, rgba(13, 2, 33, 0.9), rgba(7, 2, 21, 0.95)) !important;
  color: #fff !important;
  border: 2px solid #ff0054 !important;
  border-left: 5px solid #ff0054 !important;
  font-family: 'Rajdhani', 'Microsoft YaHei', sans-serif !important;
  box-shadow: 0 0 20px rgba(255, 0, 84, 0.4), inset 0 0 10px rgba(0, 255, 170, 0.1) !important;
  position: relative !important;
  overflow: hidden !important;
  padding: 15px !important;
}

.cyberpunk-note::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, 
    transparent 0%, 
    rgba(255, 0, 84, 0.03) 25%,
    transparent 50%,
    rgba(0, 255, 170, 0.03) 75%, 
    transparent 100%
  );
  z-index: 1;
  pointer-events: none;
}

.cyberpunk-note::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.05), transparent);
  transform: skewX(-25deg);
  animation: cyberpunk-note-shift 8s infinite alternate;
  z-index: 1;
  pointer-events: none;
}

@keyframes cyberpunk-note-shift {
  0% { transform: translateX(0) skewX(-25deg); opacity: 0; }
  20% { opacity: 0.5; }
  60% { opacity: 0; }
  100% { transform: translateX(300%) skewX(-25deg); opacity: 0.5; }
}

/* 赛博朋克欢迎信息样式 */
.cyberpunk-welcome {
  font-family: 'Rajdhani', sans-serif;
  color: #ff0054;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(255, 0, 84, 0.7);
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.cyberpunk-welcome::before {
  content: attr(data-text);
  position: absolute;
  left: -2px;
  text-shadow: 3px 0 #00ffaa;
  top: 0;
  color: #ff0054;
  overflow: hidden;
  clip: rect(0, 900px, 0, 0);
  animation: cp77-welcome-noise-anim-1 3s infinite linear alternate-reverse;
}

.cyberpunk-welcome::after {
  content: attr(data-text);
  position: absolute;
  left: 2px;
  text-shadow: -3px 0 #ff00ff;
  top: 0;
  color: #ff0054;
  overflow: hidden;
  clip: rect(0, 900px, 0, 0);
  animation: cp77-welcome-noise-anim-2 2s infinite linear alternate-reverse;
}

@keyframes cp77-welcome-noise-anim-1 {
  0% {
    clip: rect(86px, 9999px, 14px, 0);
  }
  5% {
    clip: rect(72px, 9999px, 42px, 0);
  }
  10% {
    clip: rect(18px, 9999px, 5px, 0);
  }
  15% {
    clip: rect(13px, 9999px, 23px, 0);
  }
  20% {
    clip: rect(93px, 9999px, 42px, 0);
  }
  25% {
    clip: rect(6px, 9999px, 67px, 0);
  }
  30% {
    clip: rect(70px, 9999px, 16px, 0);
  }
  35% {
    clip: rect(75px, 9999px, 69px, 0);
  }
  40% {
    clip: rect(57px, 9999px, 73px, 0);
  }
  45% {
    clip: rect(28px, 9999px, 25px, 0);
  }
  50% {
    clip: rect(39px, 9999px, 21px, 0);
  }
  55% {
    clip: rect(4px, 9999px, 73px, 0);
  }
  60% {
    clip: rect(48px, 9999px, 28px, 0);
  }
  65% {
    clip: rect(64px, 9999px, 58px, 0);
  }
  70% {
    clip: rect(98px, 9999px, 67px, 0);
  }
  75% {
    clip: rect(76px, 9999px, 2px, 0);
  }
  80% {
    clip: rect(23px, 9999px, 60px, 0);
  }
  85% {
    clip: rect(47px, 9999px, 59px, 0);
  }
  90% {
    clip: rect(10px, 9999px, 15px, 0);
  }
  95% {
    clip: rect(31px, 9999px, 37px, 0);
  }
  100% {
    clip: rect(87px, 9999px, 86px, 0);
  }
}

@keyframes cp77-welcome-noise-anim-2 {
  0% {
    clip: rect(35px, 9999px, 36px, 0);
  }
  5% {
    clip: rect(89px, 9999px, 100px, 0);
  }
  10% {
    clip: rect(64px, 9999px, 74px, 0);
  }
  15% {
    clip: rect(25px, 9999px, 5px, 0);
  }
  20% {
    clip: rect(7px, 9999px, 39px, 0);
  }
  25% {
    clip: rect(30px, 9999px, 8px, 0);
  }
  30% {
    clip: rect(46px, 9999px, 65px, 0);
  }
  35% {
    clip: rect(93px, 9999px, 6px, 0);
  }
  40% {
    clip: rect(48px, 9999px, 68px, 0);
  }
  45% {
    clip: rect(94px, 9999px, 10px, 0);
  }
  50% {
    clip: rect(59px, 9999px, 3px, 0);
  }
  55% {
    clip: rect(10px, 9999px, 82px, 0);
  }
  60% {
    clip: rect(83px, 9999px, 98px, 0);
  }
  65% {
    clip: rect(13px, 9999px, 13px, 0);
  }
  70% {
    clip: rect(81px, 9999px, 69px, 0);
  }
  75% {
    clip: rect(24px, 9999px, 56px, 0);
  }
  80% {
    clip: rect(35px, 9999px, 56px, 0);
  }
  85% {
    clip: rect(10px, 9999px, 94px, 0);
  }
  90% {
    clip: rect(56px, 9999px, 59px, 0);
  }
  95% {
    clip: rect(98px, 9999px, 34px, 0);
  }
  100% {
    clip: rect(36px, 9999px, 26px, 0);
  }
}

/* 角色提示样式 */
.cyberpunk-character-toast {
  position: fixed;
  background-color: rgba(13, 2, 33, 0.95);
  color: white;
  padding: 15px 20px;
  border-radius: 2px;
  font-size: 15px;
  max-width: 350px;
  text-align: center;
  z-index: 9998;
  box-shadow: 0 0 15px rgba(255, 0, 84, 0.7);
  border-left: 3px solid #ff0054;
  font-family: 'Rajdhani', sans-serif;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* 角色提示激活状态 */
.cyberpunk-character-toast.active {
  opacity: 1;
  transform: translateY(0);
}

/* 角色提示关闭状态 */
.cyberpunk-character-toast.closing {
  opacity: 0;
  transform: translateY(-20px);
}

/* 角色提示头部 */
.cyberpunk-character-header {
  margin-bottom: 8px;
  position: relative;
}

/* 角色名称 */
.cyberpunk-character-name {
  color: #00ffaa;
  font-size: 18px;
  letter-spacing: 1px;
  text-transform: uppercase;
  position: relative;
  display: inline-block;
}

/* 角色名称下划线 */
.cyberpunk-character-name::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #00ffaa, transparent);
}

/* 角色信息 */
.cyberpunk-character-info {
  font-size: 15px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.9);
  text-align: left;
}

/* 扫描线效果 */
.cyberpunk-character-scanline {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(255, 0, 84, 0.1) 50%
  );
  background-size: 100% 4px;
  z-index: -1;
  pointer-events: none;
  opacity: 0.3;
}

/* 噪点效果 */
.cyberpunk-character-noise {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AcGEgAPOKt0EQAAAGlJREFUaN7t18EJwCAURNFnYP9Nxw42kAyIyPXOyv+7MCRVJEmSJEmS9Fgj4jxz3zxzIkQIESKECBFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECFChAgRIkSIECHkRdLLBzVdFr7KAAAAAElFTkSuQmCC');
  background-repeat: repeat;
  z-index: -2;
  pointer-events: none;
  opacity: 0.05;
}

/* 故障效果 */
.cyberpunk-character-toast.glitch {
  animation: cp77-toast-glitch 0.2s steps(2) forwards;
}

@keyframes cp77-toast-glitch {
  0% {
    transform: translate(0);
    opacity: 1;
  }
  20% {
    transform: translate(-5px, 5px);
    opacity: 0.9;
  }
  40% {
    transform: translate(5px, -5px);
    opacity: 0.8;
  }
  60% {
    transform: translate(-2px, -2px);
    opacity: 0.9;
  }
  80% {
    transform: translate(2px, 2px);
    opacity: 0.8;
  }
  100% {
    transform: translate(0);
    opacity: 1;
  }
}

.cyberpunk-character-toast::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(
    to right,
    #ff0054,
    #00ffaa,
    #ff0054
  );
  animation: cp77-toast-border 2s linear infinite;
  background-size: 200% 100%;
}

@keyframes cp77-toast-border {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 200% 0%;
  }
}

.cyberpunk-character-toast::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transform: translateX(-100%);
  animation: cp77-toast-scan 2s ease-in-out infinite;
}

@keyframes cp77-toast-scan {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 模态框样式更新 */
.cyberpunk-modal {
  background-color: rgba(13, 2, 33, 0.95);
  border: 2px solid #ff0054;
  border-radius: 2px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  color: #fff;
  text-align: center;
  box-shadow: 0 0 30px rgba(255, 0, 84, 0.5);
  transform: scale(0.9);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  overflow: hidden;
}

.cyberpunk-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #ff0054, #00ffaa);
}

.cyberpunk-modal::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30%;
  height: 2px;
  background: #00ffaa;
}

.cyberpunk-modal-title {
  font-family: 'Rajdhani', sans-serif;
  font-size: 28px;
  margin-top: 0;
  margin-bottom: 20px;
  color: #ff0054;
  letter-spacing: 1px;
  text-transform: uppercase;
  position: relative;
  display: inline-block;
}

.cyberpunk-modal-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #ff0054, transparent);
}

.cyberpunk-modal-quote {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 30px;
  position: relative;
  padding: 15px;
  border-left: 3px solid #00ffaa;
  color: rgba(255, 255, 255, 0.9);
  background-color: rgba(0, 0, 0, 0.3);
  text-align: left;
  font-family: 'Rajdhani', sans-serif;
}

.cyberpunk-modal-close {
  background-color: transparent;
  color: #fff;
  border: 2px solid #00ffaa;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  text-transform: uppercase;
  font-family: 'Rajdhani', sans-serif;
  position: relative;
  overflow: hidden;
}

.cyberpunk-modal-close:hover {
  background-color: #00ffaa;
  color: #000;
  box-shadow: 0 0 15px rgba(0, 255, 170, 0.7);
}

.cyberpunk-modal-close::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 170, 0.4), transparent);
  transition: 0.5s;
}

.cyberpunk-modal-close:hover::before {
  left: 100%;
}

/* 播放音乐按钮样式 */
.cyberpunk-music-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  background: linear-gradient(90deg, #ff0054, #0d0221);
  color: white;
  border: none;
  border-radius: 2px;
  padding: 10px 15px;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(255, 0, 84, 0.7);
  font-family: 'Rajdhani', sans-serif;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 2px solid #ff0054;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cyberpunk-music-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: 0.5s;
}

.cyberpunk-music-button:hover {
  box-shadow: 0 0 15px rgba(0, 255, 170, 0.7);
  transform: translateY(-3px);
  border-color: #00ffaa;
}

.cyberpunk-music-button:hover::before {
  left: 100%;
}

.cyberpunk-music-button:active {
  transform: translateY(-1px);
  box-shadow: 0 0 8px rgba(255, 0, 84, 0.5);
}

/* 音量控制滑块样式 */
.cyberpunk-volume-control {
  margin-top: 8px;
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(90deg, #ff0054, #00ffaa);
  outline: none;
  border-radius: 2px;
  cursor: pointer;
}

.cyberpunk-volume-control::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #00ffaa;
  cursor: pointer;
  box-shadow: 0 0 5px rgba(0, 255, 170, 0.7);
  transition: all 0.2s ease;
}

.cyberpunk-volume-control::-webkit-slider-thumb:hover {
  background: #fff;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
}

.cyberpunk-volume-control::-moz-range-thumb {
  width: 15px;
  height: 15px;
  border: none;
  border-radius: 50%;
  background: #00ffaa;
  cursor: pointer;
  box-shadow: 0 0 5px rgba(0, 255, 170, 0.7);
  transition: all 0.2s ease;
}

.cyberpunk-volume-control::-moz-range-thumb:hover {
  background: #fff;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
}

/* 响应式调整 */
@media (max-width: 480px) {
  .cyberpunk-music-button {
    padding: 8px 12px;
    font-size: 14px;
    bottom: 15px;
    right: 15px;
  }
}

/* 赛博朋克2077：边缘行者 - 故障效果样式 */

/* 故障文本效果 */
.glitch-text {
    position: relative;
    color: var(--text-primary, #fff) !important;
    letter-spacing: 3px !important;
    text-transform: uppercase !important;
    font-family: 'Rajdhani', sans-serif !important;
    font-weight: bold !important;
}

.glitch-text::before,
.glitch-text::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--dark-bg, rgba(13, 2, 33, 0.9)) !important;
}

.glitch-text::before {
    left: 2px;
    text-shadow: -2px 0 var(--neon-pink, #ff0054) !important;
    clip: rect(24px, 550px, 90px, 0);
    animation: glitch-anim-1 3s infinite linear alternate-reverse;
}

.glitch-text::after {
    left: -2px;
    text-shadow: -2px 0 var(--neon-blue, #00ffaa) !important;
    clip: rect(85px, 550px, 140px, 0);
    animation: glitch-anim-2 2.5s infinite linear alternate-reverse;
}

/* 故障动画 */
@keyframes glitch-anim-1 {
    0% {
        clip: rect(52px, 9999px, 41px, 0);
    }
    5% {
        clip: rect(21px, 9999px, 76px, 0);
    }
    10% {
        clip: rect(92px, 9999px, 61px, 0);
    }
    15% {
        clip: rect(68px, 9999px, 12px, 0);
    }
    20% {
        clip: rect(23px, 9999px, 72px, 0);
    }
    25% {
        clip: rect(38px, 9999px, 87px, 0);
    }
    30% {
        clip: rect(57px, 9999px, 19px, 0);
    }
    35% {
        clip: rect(95px, 9999px, 32px, 0);
    }
    40% {
        clip: rect(12px, 9999px, 91px, 0);
    }
    45% {
        clip: rect(67px, 9999px, 45px, 0);
    }
    50% {
        clip: rect(31px, 9999px, 81px, 0);
    }
    55% {
        clip: rect(89px, 9999px, 26px, 0);
    }
    60% {
        clip: rect(42px, 9999px, 63px, 0);
    }
    65% {
        clip: rect(15px, 9999px, 79px, 0);
    }
    70% {
        clip: rect(74px, 9999px, 37px, 0);
    }
    75% {
        clip: rect(53px, 9999px, 86px, 0);
    }
    80% {
        clip: rect(29px, 9999px, 49px, 0);
    }
    85% {
        clip: rect(84px, 9999px, 13px, 0);
    }
    90% {
        clip: rect(47px, 9999px, 93px, 0);
    }
    95% {
        clip: rect(18px, 9999px, 58px, 0);
    }
    100% {
        clip: rect(71px, 9999px, 24px, 0);
    }
}

@keyframes glitch-anim-2 {
    0% {
        clip: rect(18px, 9999px, 93px, 0);
    }
    5% {
        clip: rect(74px, 9999px, 37px, 0);
    }
    10% {
        clip: rect(53px, 9999px, 86px, 0);
    }
    15% {
        clip: rect(29px, 9999px, 49px, 0);
    }
    20% {
        clip: rect(84px, 9999px, 13px, 0);
    }
    25% {
        clip: rect(47px, 9999px, 93px, 0);
    }
    30% {
        clip: rect(18px, 9999px, 58px, 0);
    }
    35% {
        clip: rect(71px, 9999px, 24px, 0);
    }
    40% {
        clip: rect(52px, 9999px, 41px, 0);
    }
    45% {
        clip: rect(21px, 9999px, 76px, 0);
    }
    50% {
        clip: rect(92px, 9999px, 61px, 0);
    }
    55% {
        clip: rect(68px, 9999px, 12px, 0);
    }
    60% {
        clip: rect(23px, 9999px, 72px, 0);
    }
    65% {
        clip: rect(38px, 9999px, 87px, 0);
    }
    70% {
        clip: rect(57px, 9999px, 19px, 0);
    }
    75% {
        clip: rect(95px, 9999px, 32px, 0);
    }
    80% {
        clip: rect(12px, 9999px, 91px, 0);
    }
    85% {
        clip: rect(67px, 9999px, 45px, 0);
    }
    90% {
        clip: rect(31px, 9999px, 81px, 0);
    }
    95% {
        clip: rect(89px, 9999px, 26px, 0);
    }
    100% {
        clip: rect(42px, 9999px, 63px, 0);
    }
}

/* 霓虹文本脉冲效果 */
.neon-pulse {
    animation: neon-pulse 1.5s ease-in-out infinite alternate !important;
}

@keyframes neon-pulse {
    from {
        text-shadow: 0 0 5px var(--neon-pink, #ff0054), 0 0 10px var(--neon-pink, #ff0054), 0 0 15px var(--neon-pink, #ff0054) !important;
    }
    to {
        text-shadow: 0 0 10px var(--neon-pink, #ff0054), 0 0 20px var(--neon-pink, #ff0054), 0 0 30px var(--neon-pink, #ff0054) !important;
    }
}

/* 数字雨效果 */
.digital-rain {
    position: relative !important;
    overflow: hidden !important;
}

.digital-rain::before {
    content: "" !important;
    position: absolute !important;
    top: -100% !important;
    left: 0 !important;
    width: 100% !important;
    height: 200% !important;
    background: linear-gradient(0deg, 
        rgba(0, 255, 159, 0) 0%, 
        rgba(0, 255, 159, 0.2) 50%, 
        rgba(0, 255, 159, 0) 100%) !important;
    animation: digital-rain-fall 2s linear infinite !important;
    pointer-events: none !important;
    z-index: 1 !important;
}

@keyframes digital-rain-fall {
    0% {
        transform: translateY(0) !important;
    }
    100% {
        transform: translateY(50%) !important;
    }
}

/* 电视故障效果 */
.tv-glitch {
    position: relative !important;
    overflow: hidden !important;
}

.tv-glitch::before {
    content: "" !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background: rgba(255, 42, 109, 0.1) !important;
    opacity: 0 !important;
    animation: tv-glitch 4s steps(1) infinite !important;
    pointer-events: none !important;
    z-index: 1 !important;
}

@keyframes tv-glitch {
    0%, 100% {
        opacity: 0 !important;
        transform: translateX(0) !important;
    }
    10%, 15% {
        opacity: 0.1 !important;
        transform: translateX(-5px) !important;
    }
    20%, 25% {
        opacity: 0.2 !important;
        transform: translateX(5px) !important;
    }
    30%, 35% {
        opacity: 0 !important;
        transform: translateX(0) !important;
    }
    40%, 45% {
        opacity: 0.1 !important;
        transform: translateX(5px) !important;
    }
    50%, 55% {
        opacity: 0.2 !important;
        transform: translateX(-5px) !important;
    }
    60%, 65% {
        opacity: 0 !important;
        transform: translateX(0) !important;
    }
}

/* 边缘故障效果 */
.edge-glitch {
    position: relative !important;
    overflow: hidden !important;
}

.edge-glitch::after {
    content: "" !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background: linear-gradient(90deg, 
        rgba(255, 42, 109, 0) 0%, 
        rgba(255, 42, 109, 0.2) 50%, 
        rgba(255, 42, 109, 0) 100%) !important;
    animation: edge-glitch 3s ease infinite !important;
    pointer-events: none !important;
    z-index: 1 !important;
}

@keyframes edge-glitch {
    0%, 100% {
        transform: translateX(-100%) !important;
    }
    50% {
        transform: translateX(100%) !important;
    }
}

/* 故障边框效果 */
.glitch-border {
    position: relative !important;
    border: 2px solid var(--neon-blue, #00ffaa) !important;
    box-shadow: 0 0 5px var(--neon-blue, #00ffaa) !important;
    overflow: hidden !important;
}

.glitch-border::before {
    content: "" !important;
    position: absolute !important;
    top: -2px !important;
    left: -2px !important;
    width: calc(100% + 4px) !important;
    height: calc(100% + 4px) !important;
    border: 2px solid var(--neon-pink, #ff0054) !important;
    box-shadow: 0 0 5px var(--neon-pink, #ff0054) !important;
    animation: border-glitch 2s linear infinite !important;
    opacity: 0 !important;
    pointer-events: none !important;
    z-index: 1 !important;
}

@keyframes border-glitch {
    0%, 100% {
        opacity: 0 !important;
    }
    10%, 90% {
        opacity: 0 !important;
    }
    20%, 80% {
        opacity: 0.3 !important;
    }
    30%, 70% {
        opacity: 0 !important;
    }
    40%, 60% {
        opacity: 0.3 !important;
    }
    50% {
        opacity: 0 !important;
    }
}
</style>