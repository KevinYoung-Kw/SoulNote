<template>
  <base-easter-egg
    :is-active="isActive"
    :current-step="currentStep"
    :target-step="targetStep"
    ref="baseEgg"
  >
    <!-- 此组件无可视UI，仅提供彩蛋功能 -->
  </base-easter-egg>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import BaseEasterEgg from './BaseEasterEgg.vue';

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
  'update-movie',
  'update-note-content',
  'update-note-class',
  'deactivate'
]);

// 状态变量
const baseEgg = ref(null);
const keySequence = ref('');
const keySequenceTimeout = ref(null);
const audioPlayer = ref(null);
const currentNolanMovie = ref('');

// 不同电影风格下的欢迎信息样式和示例纸条内容
const movieSpecificContent = {
  interstellar: {
    welcomeClass: 'interstellar-welcome',
    noteContent: "在浩瀚宇宙中，时间既是相对的，也是永恒的。当你凝视星空，星空也在凝视着你。今天，让光年外的梦想照亮你前进的道路。",
    noteClass: 'interstellar-note'
  },
  inception: {
    welcomeClass: 'inception-welcome',
    noteContent: "现实与梦境的边界，往往只在一念之间。记住，最简单的想法才能在思想中生根。今天，创造你自己的现实。",
    noteClass: 'inception-note'
  },
  batman: {
    welcomeClass: 'batman-welcome',
    noteContent: "并非所有英雄都披着斗篷，有时英雄就是每天坚持前行的你。记住，我们跌倒，是为了学会如何站起来。",
    noteClass: 'batman-note'
  },
  tenet: {
    welcomeClass: 'tenet-welcome',
    noteContent: "我们生活在一个正在崩溃的世界，没有朋友，没有未来，没有协商的余地。",
    noteClass: 'tenet-note'
  }
};

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
});

// 添加处理按键的函数
function handleKeyPress(event) {
  // 仅在指定步骤激活彩蛋检测
  if (props.currentStep !== props.targetStep) return;
  
  // 将按键添加到序列中
  keySequence.value += event.key.toLowerCase();
  
  // 检查是否包含秘钥
  if (keySequence.value.includes(import.meta.env.VITE_NOLAN_HOTKEY)) {
    activateNolanFanMode();
    keySequence.value = '';  // 重置序列
  }
  
  // 清除之前的超时并设置新的
  if (keySequenceTimeout.value) {
    clearTimeout(keySequenceTimeout.value);
  }
  
  // 设置30秒后重置序列
  keySequenceTimeout.value = setTimeout(() => {
    keySequence.value = '';
  }, 30000);
}

// 获取当前电影风格的欢迎信息样式类
function getWelcomeClass() {
  return movieSpecificContent[currentNolanMovie.value]?.welcomeClass || 'interstellar-welcome';
}

// 获取当前电影风格的示例纸条样式类
function getNoteClass() {
  return movieSpecificContent[currentNolanMovie.value]?.noteClass || 'interstellar-note';
}

// 获取当前电影风格的示例纸条内容
function getNoteContent() {
  return movieSpecificContent[currentNolanMovie.value]?.noteContent || movieSpecificContent.interstellar.noteContent;
}

// 修改活化诺兰粉丝模式函数，添加参数控制是否播放音乐
function activateNolanFanMode(playMusic = true) {
  try {
    console.log('激活诺兰粉丝模式', playMusic ? '(包含音乐)' : '(无音乐)');
    
    // 使用基础彩蛋组件的激活方法
    if (baseEgg.value) {
      baseEgg.value.activateMode(playMusic);
    }
    
    // 发出激活事件
    emit('activate', true);
    
    // 星际穿越经典台词
    const interstellarQuotes = [
      "不要温和地走入那个良夜，怒斥，怒斥，光明的消逝。",
      "爱是唯一能超越时空的力量。",
      "或许我们不该寻找星辰之中的答案，而是尝试理解提出问题的人。",
      "我们曾经仰望星空，思考我们在宇宙中的位置，而现在我们只俯视脚下，担忧我们在尘土中的位置。"
    ];
  
    // 盗梦空间经典台词
    const inceptionQuotes = [
      "你在等一列永远不会来的火车吗？",
      "最简单的概念，最容易在头脑中扎根的寄生虫，就是想法。",
      "梦与现实的区别在于什么？", 
      "我们在下落中创造出了世界。"
    ];
    
    // 蝙蝠侠经典台词
    const batmanQuotes = [
      "有些人只想看到世界燃烧。",
      "为什么我们跌倒？为了学会如何站起来。",
      "不是我们需要的英雄，而是我们应得的英雄。",
      "我就是黑暗骑士。"
    ];
    
    // 信条经典台词
    const tenetQuotes = [
      "我们生活在一个正在崩溃的世界，没有朋友，没有未来，没有协商的余地。",
      "别尝试理解它，要感受它。", 
      "发生的事已经发生过。",
      "无知即是我们的优势。"
    ];
    
    // 按电影分组
    const quotes = {
      interstellar: interstellarQuotes,
      inception: inceptionQuotes,
      batman: batmanQuotes,
      tenet: tenetQuotes
    };
    
    // 诺兰IP角色/概念池
    const nolanCharacterPools = [
      // 星际穿越
      {
        movie: "interstellar",
        characters: ['库珀', '墨菲', 'Amelia Brand', 'Dr. Mann']
      },
      // 盗梦空间
      {
        movie: "inception",
        characters: ['Cobb', 'Ariadne', 'Arthur', 'Eames']
      },
      // 蝙蝠侠
      {
        movie: "batman",
        characters: ['Bruce Wayne', 'Joker', 'Bane', 'Alfred']
      },
      // 信条 - 添加信条角色池
      {
        movie: "tenet",
        characters: ['Protagonist', 'Neil', 'Kat', 'Sator']
      },
      // 星际概念
      {
        movie: "interstellar",
        characters: ['Gargantua', 'Endurance', 'TARS', 'CASE']
      }
    ];
      
    // 随机选择一个IP群组
    const randomPoolIndex = Math.floor(Math.random() * nolanCharacterPools.length);
    const selectedPool = nolanCharacterPools[randomPoolIndex];
    
    // 保存当前选中的电影类型
    currentNolanMovie.value = selectedPool.movie;
    console.log('选择电影类型:', currentNolanMovie.value);
    
    // 获取对应电影的台词
    const movieQuotes = quotes[selectedPool.movie] || interstellarQuotes;
    
    // 随机选择一句台词
    const randomQuote = movieQuotes[Math.floor(Math.random() * movieQuotes.length)];
    
    // 仅在初次激活时创建弹窗
    if (playMusic) {
      // 创建诺兰风格弹窗
      createNolanModal("好的，我的影迷", randomQuote);
      
      // 播放星际穿越音乐
      playNolanMusic();
    }
    
    // 使用基础彩蛋组件的方法更新昵称建议
    if (baseEgg.value) {
      baseEgg.value.updateSuggestions(selectedPool.characters);
    }
    
    // 更新昵称建议为选中的诺兰IP组
    emit('update-suggestions', selectedPool.characters);
    // 更新当前电影类型
    emit('update-movie', selectedPool.movie);
    // 发送新事件 - 更新示例纸条内容
    emit('update-note-content', getNoteContent());
    // 发送新事件 - 更新示例纸条样式
    emit('update-note-class', getNoteClass());
    
    // 添加视觉效果，使用更可靠的方式
    clearTimeout(window.nolanEffectTimeout);
    window.nolanEffectTimeout = setTimeout(() => {
      console.log('延时后开始添加视觉效果');
      
      // 强制重新设置所有相关状态
      const nicknameContainer = document.querySelector('.nickname-container');
      if (nicknameContainer) {
        nicknameContainer.classList.add('nolan-fan-mode');
        nicknameContainer.classList.remove('nolan-interstellar', 'nolan-inception', 'nolan-batman', 'nolan-tenet');
        nicknameContainer.classList.add(`nolan-${currentNolanMovie.value}`);
      }
      
      addNolanVisualEffect();
    }, 1500);
  } catch (error) {
    console.error('激活诺兰粉丝模式失败:', error);
    // 如果出错，显示简单提示
    alert('好的，我的影迷\n\n(彩蛋功能激活，但执行时出现错误)');
    // 确保至少昵称建议更新为诺兰角色
    emit('update-suggestions', ['库珀', '墨菲', 'Cobb', 'Amelia Brand']);
  }
}

// 改进音乐播放功能
function playNolanMusic() {
  // 尝试多个音乐源
  const musicSources = [
    '/assets/music/cornfield-chase.mp3',
  ];
  
  // 创建新的音频元素
  if (!audioPlayer.value) {
    audioPlayer.value = new Audio();
  }
  
  // 设置音频元素
  audioPlayer.value.loop = true;
  audioPlayer.value.volume = 0.5;
  
  // 递归尝试播放不同源
  let currentSourceIndex = 0;
  
  function tryPlaySource() {
    if (currentSourceIndex >= musicSources.length) {
      console.error('所有音频源都无法播放');
      // 不再显示播放按钮
      return;
    }
    
    const source = musicSources[currentSourceIndex];
    audioPlayer.value.src = source;
    
    audioPlayer.value.oncanplaythrough = () => {
      audioPlayer.value.play()
        .then(() => {
          console.log(`音频源 ${source} 成功播放`);
        })
        .catch(err => {
          console.warn(`无法自动播放音频源 ${source}:`, err);
          // 尝试在用户交互时播放
          document.addEventListener('click', function playOnInteraction() {
            audioPlayer.value.play().catch(e => console.warn('交互后仍无法播放:', e));
            document.removeEventListener('click', playOnInteraction);
          }, { once: true });
        });
    };
    
    audioPlayer.value.onerror = () => {
      console.warn(`音频源 ${source} 加载失败，尝试下一个源`);
      currentSourceIndex++;
      tryPlaySource();
    };
  }
  
  // 开始尝试播放
  tryPlaySource();
}

// 移除显示播放按钮的函数，改为静默处理
function showPlayMusicButton(hasError = false) {
  // 不再显示按钮，而是在用户下次交互时尝试播放
  if (hasError) {
    // 尝试另一个可能的路径
    audioPlayer.value.src = '/cornfield-chase.mp3';
  }
  
  // 添加一次性点击事件监听器，在用户交互时播放
  document.addEventListener('click', function playOnInteraction() {
    audioPlayer.value.play().catch(e => console.warn('交互后仍无法播放:', e));
    document.removeEventListener('click', playOnInteraction);
  }, { once: true });
}

// 增强角色选择反馈
function showCharacterInfo(name) {
  // 扩充角色信息库
  const characterInfo = {
    // 星际穿越
    '库珀': {
      desc: '星际穿越中的前NASA宇航员，穿越黑洞回到过去。',
      welcome: '欢迎回来，库珀。土星环等待着你的再次探索。'
    },
    '墨菲': {
      desc: '星际穿越中库珀的女儿，成为解决引力方程的物理学家。',
      welcome: '墨菲，继续探索那些看不见的维度吧。你的方程式还未完成。'
    },
    'Amelia Brand': {
      desc: '星际穿越中的宇航员科学家，前往可能宜居的星球。',
      welcome: '博士，Edmunds星球的数据已就位。爱将指引你找到答案。'
    },
    'Dr. Mann': {
      desc: '星际穿越中因长期孤独而精神崩溃的科学家。',
      welcome: '曼恩，人类的生存本能远比我们想象的更强大。'
    },
    
    // 盗梦空间
    'Cobb': {
      desc: '盗梦空间中的主角，能进入他人梦境窃取或植入思想。',
      welcome: '科布，这不是梦境，但现实与梦境的界限已经模糊。'
    },
    'Ariadne': {
      desc: '盗梦空间中的建筑师，设计梦境迷宫结构。',
      welcome: '阿里阿德涅，请继续为我们构建梦境的迷宫。'
    },
    'Arthur': {
      desc: '盗梦空间中的后勤和研究专家，科布的得力助手。',
      welcome: '亚瑟，你的精确计算将确保任务的成功。'
    },
    'Eames': {
      desc: '盗梦空间中的身份伪装专家，能在梦中变化形象。',
      welcome: '伊姆斯，你的伪装技巧依然是团队中最出色的。'
    },
    
    // 蝙蝠侠
    'Bruce Wayne': {
      desc: '蝙蝠侠三部曲中的主角，高谭市的黑暗骑士。',
      welcome: '韦恩先生，高谭需要你，但不一定需要蝙蝠侠。'
    },
    'Joker': {
      desc: '蝙蝠侠系列中的超级反派，混乱的代表。',
      welcome: '为什么这么严肃？让我们给这个世界带来一点混乱。'
    },
    'Bane': {
      desc: '黑暗骑士崛起中的超级反派，曾击败蝙蝠侠。',
      welcome: '你认为黑暗是你的盟友？你只是适应了黑暗...'
    },
    'Alfred': {
      desc: '蝙蝠侠的管家，布鲁斯·韦恩的忠实朋友。',
      welcome: '韦恩少爷，有些人只是想看这个世界燃烧。'
    },
    
    // 星际装置
    'TARS': {
      desc: '星际穿越中幽默的机器人助手，有着90%的诚实度设置。',
      welcome: '诚实参数设置为90%。幽默参数设置为100%。准备服务。'
    },
    'CASE': {
      desc: '星际穿越中的另一个机器人助手，更加严肃。',
      welcome: '任务优先级已确认。等待进一步指示。'
    },
    'Gargantua': {
      desc: '星际穿越中的超大质量黑洞，是剧情的关键点。',
      welcome: '时间在引力场中扭曲。这里的1小时相当于地球上的7年。'
    },
    'Endurance': {
      desc: '星际穿越中宇航员驾驶的宇宙飞船。',
      welcome: '持久号已做好跨越虫洞的准备。目的地：另一个星系。'
    },
        // 信条角色
    'Protagonist': {
      desc: '信条中的无名主角，一名CIA特工，被招募加入神秘组织"信条"。',
      welcome: '欢迎加入信条。你所看到的一切都已经发生过。'
    },
    'Neil': {
      desc: '信条中的关键角色，拥有逆向时间经验的特工，主角的盟友。',
      welcome: '对于我来说，这是终点；对你而言，这只是开始。'
    },
    'Kat': {
      desc: '信条中的女性角色，俄罗斯军火商Sator的妻子，寻求摆脱丈夫控制。',
      welcome: '有时，我们必须向前看，才能理解过去。'
    },
    'Sator': {
      desc: '信条中的主要反派，与未来人合作的俄罗斯军火商，试图逆转时间。',
      welcome: '我们生活在一个正在崩溃的世界，没有朋友，没有未来，没有协商的余地。'
    }
  };
  
  if (characterInfo[name]) {
    // 显示角色描述提示
    setTimeout(() => {
      const infoToast = document.createElement('div');
      infoToast.textContent = characterInfo[name].desc;
      infoToast.className = 'nolan-character-toast';
      document.body.appendChild(infoToast);
      
      console.log('角色描述提示已创建:', name, characterInfo[name].desc);
      
      // 设置自动移除提示的定时器
      setTimeout(() => {
        try {
          if (document.body.contains(infoToast)) {
            document.body.removeChild(infoToast);
          }
        } catch (error) {
          console.error('移除角色提示时出错:', error);
        }
      }, 3000);
    }, 100); // 短暂延迟确保DOM已更新
    
    // 更新纸条内容，使用"亲爱的[角色名]，[欢迎信息]"格式
    if (characterInfo[name].welcome) {
      const personalizedNoteContent = `${characterInfo[name].welcome}`;
      
      // 使用基础彩蛋组件的方法更新纸条内容
      if (baseEgg.value) {
        baseEgg.value.updateNoteContent(personalizedNoteContent);
      }
      
      emit('update-note-content', personalizedNoteContent);
    }
  }
}

// 改进创建诺兰模态框函数
function createNolanModal(title, quote) {
  // 先确保清理之前可能存在的弹窗
  const existingModals = document.querySelectorAll('.nolan-modal-overlay');
  existingModals.forEach(modal => {
    try {
      document.body.removeChild(modal);
    } catch (err) {
      console.warn('移除旧弹窗失败:', err);
    }
  });
  
  // 使用setTimeout确保DOM操作在一个单独的事件循环中
  setTimeout(() => {
    try {
      // 创建弹窗遮罩层
      const modalOverlay = document.createElement('div');
      modalOverlay.className = 'nolan-modal-overlay';
      
      // 创建弹窗容器
      const modalContainer = document.createElement('div');
      modalContainer.className = 'nolan-modal';
      
      // 创建弹窗标题
      const modalTitle = document.createElement('h3');
      modalTitle.className = 'nolan-modal-title';
      modalTitle.textContent = title;
      
      // 创建台词容器
      const quoteContainer = document.createElement('div');
      quoteContainer.className = 'nolan-modal-quote';
      quoteContainer.textContent = `"${quote}"`;
      
      // 创建关闭按钮
      const closeButton = document.createElement('button');
      closeButton.className = 'nolan-modal-close';
      closeButton.textContent = '开始旅程';
      closeButton.onclick = () => {
        // 添加关闭动画
        modalContainer.classList.add('nolan-modal-closing');
        modalOverlay.classList.add('nolan-overlay-closing');
        
        // 动画结束后移除元素
        setTimeout(() => {
          if (document.body.contains(modalOverlay)) {
            document.body.removeChild(modalOverlay);
          }
        }, 800);
      };
      
      // 组装弹窗
      modalContainer.appendChild(modalTitle);
      modalContainer.appendChild(quoteContainer);
      modalContainer.appendChild(closeButton);
      modalOverlay.appendChild(modalContainer);
      
      // 添加到body
      document.body.appendChild(modalOverlay);
      console.log('诺兰模式弹窗已创建:', title, quote);
      
      // 触发动画，使用更长的延迟以确保DOM已完全渲染
      setTimeout(() => {
        modalOverlay.classList.add('nolan-overlay-visible');
        modalContainer.classList.add('nolan-modal-visible');
      }, 50);
    } catch (error) {
      console.error('创建诺兰模式弹窗失败:', error);
      // 如果弹窗创建失败，使用简单的alert作为备选
      alert(`${title}\n\n"${quote}"`);
    }
  }, 100);
}

function deactivateNolanFanMode() {
  try {
    console.log('结束诺兰粉丝模式');
    
    // 使用基础彩蛋组件的停用方法
    if (baseEgg.value) {
      baseEgg.value.deactivateMode();
    }
    
    // 停止音频播放
    if (audioPlayer.value) {
      audioPlayer.value.pause();
      audioPlayer.value.src = '';
    }

    // 清理信条动画定时器
    if (window.tenetAnimationIntervals && window.tenetAnimationIntervals.length > 0) {
      window.tenetAnimationIntervals.forEach(interval => clearInterval(interval));
      window.tenetAnimationIntervals = [];
    }

    // 移除所有可能存在的模态框
    const existingModals = document.querySelectorAll('.nolan-modal-overlay');
    existingModals.forEach(modal => {
      try {
        // 添加关闭动画
        const modalContainer = modal.querySelector('.nolan-modal');
        if (modalContainer) {
          modalContainer.classList.add('nolan-modal-closing');
        }
        modal.classList.add('nolan-overlay-closing');
        
        // 动画结束后移除元素
        setTimeout(() => {
          if (document.body.contains(modal)) {
            document.body.removeChild(modal);
          }
        }, 800);
      } catch (err) {
        console.warn('移除诺兰模态框失败:', err);
        // 如果动画失败，直接尝试移除
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
      }
    });
    
    // 移除播放音乐按钮
    const musicButton = document.querySelector('.nolan-music-button');
    if (musicButton && document.body.contains(musicButton)) {
      document.body.removeChild(musicButton);
    }
    
    // 移除角色提示
    const characterToast = document.querySelector('.nolan-character-toast');
    if (characterToast && document.body.contains(characterToast)) {
      document.body.removeChild(characterToast);
    }
    
    // 移除视觉效果
    const nicknameContainer = document.querySelector('.nickname-container');
    if (nicknameContainer) {
      // 移除诺兰模式类
      nicknameContainer.classList.remove('nolan-fan-mode');
      nicknameContainer.classList.remove('nolan-interstellar', 'nolan-inception', 'nolan-batman', 'nolan-tenet');

      // 移除信条效果
      const tenetEffect = nicknameContainer.querySelector('.tenet-effect');
      if (tenetEffect) tenetEffect.remove();

      // 移除标题类
      const movieTitles = ['interstellar-title', 'inception-title', 'batman-title', 'tenet-title'];
      movieTitles.forEach(cls => {
        nicknameContainer.classList.remove(cls);
      });
      
      // 移除星空背景和黑洞效果
      const starfield = nicknameContainer.querySelector('.nolan-starfield');
      if (starfield) starfield.remove();
      
      const blackhole = nicknameContainer.querySelector('.nolan-blackhole');
      if (blackhole) blackhole.remove();
    }
    
    // 发出彩蛋结束事件
    emit('deactivate');
    
    // 重置当前电影类型
    currentNolanMovie.value = '';
    
  } catch (error) {
    console.error('结束诺兰粉丝模式失败:', error);
  }
}

function addNolanVisualEffect() {
  // 获取昵称容器
  const nicknameContainer = document.querySelector('.nickname-container');
  if (!nicknameContainer) {
    console.warn('未找到昵称容器，无法添加视觉效果');
    return;
  }
  
  console.log('正在添加诺兰视觉效果：', currentNolanMovie.value);
  
  try {
    // 清理可能已存在的所有效果元素
    const allEffects = document.querySelectorAll('.nolan-effect, .interstellar-effect, .batman-effect, .inception-effect, .tenet-effect');
    allEffects.forEach(effect => {
      if (effect.parentNode) {
        effect.parentNode.removeChild(effect);
      }
    });
    
    // 确保容器为相对定位，以便绝对定位子元素相对于它
    nicknameContainer.style.position = 'relative';
    nicknameContainer.style.overflow = 'visible';
    
    // 更新数据属性和类
    nicknameContainer.setAttribute('data-nolan-movie', currentNolanMovie.value);
    nicknameContainer.classList.remove('nolan-interstellar', 'nolan-inception', 'nolan-batman', 'nolan-tenet');
    nicknameContainer.classList.add(`nolan-${currentNolanMovie.value}`);
    nicknameContainer.classList.add('nolan-fan-mode'); // 确保添加基础类
    
    // 延迟添加视觉效果，确保DOM已完全就绪
    setTimeout(() => {
      // 根据电影类型应用不同效果
      let effectAdded = false;
      
      switch(currentNolanMovie.value) {
        case 'interstellar':
          console.log('添加星际效果');
          addInterstellarEffect(nicknameContainer);
          effectAdded = true;
          break;
        case 'batman':
          console.log('添加蝙蝠侠效果');
          addBatmanEffect(nicknameContainer);
          effectAdded = true;
          break;
        case 'inception':
          console.log('添加盗梦空间效果');
          addInceptionEffect(nicknameContainer);
          effectAdded = true;
          break;
        case 'tenet':
          console.log('添加信条效果');
          addTenetEffect(nicknameContainer);
          effectAdded = true;
          break;
        default:
          console.log('使用默认星际效果');
          addInterstellarEffect(nicknameContainer);
          effectAdded = true;
      }
      
      // 为动画效果元素强制应用重要样式
      const addedEffects = nicknameContainer.querySelectorAll('.nolan-effect');
      console.log('添加的效果元素数量:', addedEffects.length);
      
      addedEffects.forEach(effect => {
        // 强制设置关键样式，确保效果不会消失
        effect.style.position = 'absolute';
        effect.style.top = '0';
        effect.style.left = '0';
        effect.style.width = '100%';
        effect.style.height = '100%';
        effect.style.zIndex = '0';
        effect.style.pointerEvents = 'none';
        effect.style.opacity = '1';
        effect.style.visibility = 'visible';
        effect.style.display = 'block';
        
        // 特别处理信条效果
        if (effect.classList.contains('tenet-effect')) {
          console.log('应用信条特殊样式');
          // 确保信条效果的子元素也有正确的样式
          const timeParticles = effect.querySelector('.time-particles');
          if (timeParticles) {
            timeParticles.style.opacity = '1';
            timeParticles.style.visibility = 'visible';
            timeParticles.style.zIndex = '1';
          }
          
          const timeIndicator = effect.querySelector('.time-indicator');
          if (timeIndicator) {
            timeIndicator.style.opacity = '0.7';
            timeIndicator.style.visibility = 'visible';
            timeIndicator.style.zIndex = '2';
          }
          
          const chromaticAberration = effect.querySelector('.chromatic-aberration');
          if (chromaticAberration) {
            chromaticAberration.style.opacity = '1';
            chromaticAberration.style.visibility = 'visible';
            chromaticAberration.style.zIndex = '1';
          }
        }
      });
      
      
    // 延长检查时间，确保效果持久存在
    setTimeout(() => {
      const stillExists = nicknameContainer.querySelector('.nolan-effect');
      console.log('效果1000ms后仍然存在:', !!stillExists);
      
      // 如果效果已消失，尝试重新添加
      if (!stillExists) {
        console.log('效果已消失，尝试重新添加...');
        // 根据电影类型重新添加效果
        if(currentNolanMovie.value === 'interstellar') {
          addInterstellarEffect(nicknameContainer);
        } else if(currentNolanMovie.value === 'batman') {
          addBatmanEffect(nicknameContainer);
        } else if(currentNolanMovie.value === 'inception') {
          addInceptionEffect(nicknameContainer);
        } else if(currentNolanMovie.value === 'tenet') {
          addTenetEffect(nicknameContainer);
          // 特别处理信条效果，确保它不会消失
          const tenetEffect = nicknameContainer.querySelector('.tenet-effect');
          if (tenetEffect) {
            console.log('重新添加信条效果后强制应用样式');
            tenetEffect.style.position = 'absolute';
            tenetEffect.style.top = '0';
            tenetEffect.style.left = '0';
            tenetEffect.style.width = '100%';
            tenetEffect.style.height = '100%';
            tenetEffect.style.zIndex = '0';
            tenetEffect.style.pointerEvents = 'none';
            tenetEffect.style.opacity = '1';
            tenetEffect.style.visibility = 'visible';
            tenetEffect.style.display = 'block';
          }
        }
      }
    }, 1000);
          
    }, 50); // 短暂延迟确保DOM已更新
    
  } catch (error) {
    console.error('添加视觉效果时出错:', error);
  }
}

function addInterstellarEffect(container) {
  // 创建外层包装
  const effectWrapper = document.createElement('div');
  effectWrapper.className = 'nolan-effect interstellar-effect';
  // 强制设置关键样式，确保效果不会消失
  effectWrapper.style.position = 'absolute';
  effectWrapper.style.top = '0';
  effectWrapper.style.left = '0';
  effectWrapper.style.width = '100%';
  effectWrapper.style.height = '100%';
  effectWrapper.style.zIndex = '0';
  effectWrapper.style.pointerEvents = 'none';
  effectWrapper.style.opacity = '1';
  effectWrapper.style.visibility = 'visible';
  effectWrapper.style.display = 'block';
  effectWrapper.style.overflow = 'hidden';

  // 创建星空背景
  const starfield = document.createElement('div');
  starfield.className = 'nolan-starfield';
  
  // 创建更多样化的星星
  for (let i = 0; i < 80; i++) {
    const star = document.createElement('div');
    star.className = 'nolan-star';
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    // 变化星星大小
    const size = Math.random() * 3 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    // 随机亮度
    const brightness = Math.random() * 0.6 + 0.4;
    star.style.opacity = brightness.toString();
    star.style.animationDuration = `${Math.random() * 4 + 2}s`;
    star.style.animationDelay = `${Math.random() * 5}s`;
    starfield.appendChild(star);
  }
  
  // 创建黑洞效果
  const blackhole = document.createElement('div');
  blackhole.className = 'nolan-blackhole';
  
  // 创建引力透镜效果
  const gravitationalLens = document.createElement('div');
  gravitationalLens.className = 'gravitational-lens';
  
  // 创建星云云雾
  for (let i = 0; i < 3; i++) {
    const nebula = document.createElement('div');
    nebula.className = 'interstellar-nebula';
    nebula.style.top = `${Math.random() * 80 + 10}%`;
    nebula.style.left = `${Math.random() * 80 + 10}%`;
    nebula.style.transform = `rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.5 + 0.5})`;
    nebula.style.opacity = (Math.random() * 0.2 + 0.1).toString();
    effectWrapper.appendChild(nebula);
  }
  
  // 添加行星轨道
  const orbit = document.createElement('div');
  orbit.className = 'interstellar-orbit';
  
  // 组装效果
  effectWrapper.appendChild(starfield);
  effectWrapper.appendChild(blackhole);
  effectWrapper.appendChild(gravitationalLens);
  effectWrapper.appendChild(orbit);
  container.appendChild(effectWrapper);
}

// 处理波纹效果函数
function handleRippleEffect(e) {
  const container = e.currentTarget;
  const ripple = document.createElement('div');
  ripple.className = 'nolan-ripple';
  
  const rect = container.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size/2}px`;
  ripple.style.top = `${e.clientY - rect.top - size/2}px`;
  
  container.appendChild(ripple);
  
  setTimeout(() => {
    if (ripple.parentNode === container) {
      container.removeChild(ripple);
    }
  }, 1000);
}

// 蝙蝠侠特效
function addBatmanEffect(container) {
  // 创建外层包装
  const effectWrapper = document.createElement('div');
  effectWrapper.className = 'nolan-effect batman-effect';
  
  // 添加哥谭市剪影
  const gothamSilhouette = document.createElement('div');
  gothamSilhouette.className = 'gotham-silhouette';
  effectWrapper.appendChild(gothamSilhouette);
  
  // 添加蝙蝠标志
  const batSignal = document.createElement('div');
  batSignal.className = 'bat-signal';
  effectWrapper.appendChild(batSignal);
  
  // 添加雾气效果
  const fog = document.createElement('div');
  fog.className = 'gotham-fog';
  effectWrapper.appendChild(fog);
  
  // 添加闪电效果
  const lightning = document.createElement('div');
  lightning.className = 'gotham-lightning';
  effectWrapper.appendChild(lightning);
  
  // 添加雨滴效果
  const rainContainer = document.createElement('div');
  rainContainer.className = 'rain-container';
  
  // 创建多个雨滴
  for (let i = 0; i < 40; i++) {
    const raindrop = document.createElement('div');
    raindrop.className = 'raindrop';
    
    // 直接设置关键样式而不只依赖CSS类
    raindrop.style.position = 'absolute';
    raindrop.style.width = '2px';
    raindrop.style.height = '20px';
    raindrop.style.left = `${Math.random() * 100}%`;
    raindrop.style.top = `${Math.random() * 50 - 50}px`; // 起始位置在容器上方
    raindrop.style.background = 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.5))';
    raindrop.style.animationName = 'rain-fall';
    raindrop.style.animationDuration = `${Math.random() * 0.5 + 0.5}s`;
    raindrop.style.animationTimingFunction = 'linear';
    raindrop.style.animationIterationCount = 'infinite';
    raindrop.style.animationDelay = `${Math.random() * 1}s`;
    raindrop.style.opacity = (Math.random() * 0.6 + 0.4).toString();
    
    rainContainer.appendChild(raindrop);
  }
  
  // 触发随机闪电
  triggerRandomLightning(lightning);
  
  effectWrapper.appendChild(rainContainer);
  container.appendChild(effectWrapper);
}

// 触发随机闪电的函数
function triggerRandomLightning(lightningElement) {
  // 随机决定何时闪电
  const triggerLightning = () => {
    // 添加闪电活跃类
    lightningElement.classList.add('lightning-active');
    
    // 短暂延迟后移除闪电效果
    setTimeout(() => {
      lightningElement.classList.remove('lightning-active');
      
      // 设置下一次闪电的时间 (3-10秒间隔)
      const nextInterval = Math.random() * 7000 + 3000;
      setTimeout(triggerLightning, nextInterval);
    }, 200);
  };
  
  // 初次延迟1-4秒闪电
  const initialDelay = Math.random() * 3000 + 1000;
  setTimeout(triggerLightning, initialDelay);
}

// 盗梦空间特效
function addInceptionEffect(container) {
  // 创建外层包装
  const effectWrapper = document.createElement('div');
  effectWrapper.className = 'nolan-effect inception-effect';
  
  // 创建镜像折叠效果
  const mirrorWrapper = document.createElement('div');
  mirrorWrapper.className = 'mirror-wrapper';
  
  // 创建折叠城市层
  for (let i = 0; i < 4; i++) {
    const cityLayer = document.createElement('div');
    cityLayer.className = 'folding-city-layer';
    cityLayer.style.bottom = `${i * 25}%`;
    cityLayer.style.animationDelay = `${i * 0.8}s`;
    cityLayer.style.opacity = (1 - i * 0.2).toString();
    mirrorWrapper.appendChild(cityLayer);
  }
  
  // 创建梦境层次指示器
  const dreamLevels = document.createElement('div');
  dreamLevels.className = 'dream-levels';
  for (let i = 0; i < 3; i++) {
    const levelIndicator = document.createElement('div');
    levelIndicator.className = 'dream-level-indicator';
    levelIndicator.style.opacity = (0.7 - i * 0.15).toString();
    levelIndicator.style.animationDelay = `${i * 1}s`;
    dreamLevels.appendChild(levelIndicator);
  }
  
  // 创建陀螺效果
  const spinner = document.createElement('div');
  spinner.className = 'inception-spinner';
  
  effectWrapper.appendChild(mirrorWrapper);
  effectWrapper.appendChild(dreamLevels);
  effectWrapper.appendChild(spinner);
  container.appendChild(effectWrapper);
}

// TENET特效 - 修复动画加载问题
function addTenetEffect(container) {
  // 创建外层包装
  const effectWrapper = document.createElement('div');
  effectWrapper.className = 'nolan-effect tenet-effect';
  
  // 直接设置关键样式而不只依赖CSS类
  effectWrapper.style.position = 'absolute';
  effectWrapper.style.top = '0';
  effectWrapper.style.left = '0';
  effectWrapper.style.width = '100%';
  effectWrapper.style.height = '100%';
  effectWrapper.style.zIndex = '0';
  effectWrapper.style.pointerEvents = 'none';
  effectWrapper.style.opacity = '1';
  effectWrapper.style.visibility = 'visible';
  effectWrapper.style.display = 'block';
  effectWrapper.style.overflow = 'hidden';
  effectWrapper.style.backgroundColor = 'rgba(15, 32, 45, 0.3)';
  
  // 添加时间倒流粒子效果
  const timeParticles = document.createElement('div');
  timeParticles.className = 'time-particles';
  timeParticles.style.position = 'absolute';
  timeParticles.style.top = '0';
  timeParticles.style.left = '0';
  timeParticles.style.width = '100%';
  timeParticles.style.height = '100%';
  timeParticles.style.zIndex = '1';
  
  // 创建粒子
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'time-particle';
    
    // 直接设置关键样式而不只依赖CSS类
    particle.style.position = 'absolute';
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.left = `${Math.random() * 100}%`;
    
    // 变化粒子大小
    const size = Math.random() * 8 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // 设置粒子颜色 - 红蓝交替
    particle.style.backgroundColor = i % 2 === 0 ? 'rgba(255, 87, 87, 0.8)' : 'rgba(87, 160, 255, 0.8)';
    particle.style.borderRadius = '50%';
    
    // 设置动画持续时间和延迟
    const duration = Math.random() * 4 + 2;
    const delay = Math.random() * 2;
    
    // 使用CSS动画而不是JavaScript动画
    particle.style.animationName = 'time-particle-flow';
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.animationIterationCount = 'infinite';
    particle.style.animationTimingFunction = 'linear';
    particle.style.animationDirection = i % 2 === 0 ? 'normal' : 'reverse';
    
    timeParticles.appendChild(particle);
  }
  
  // 创建红蓝分离效果
  const chromaticAberration = document.createElement('div');
  chromaticAberration.className = 'chromatic-aberration';
  chromaticAberration.style.position = 'absolute';
  chromaticAberration.style.top = '0';
  chromaticAberration.style.left = '0';
  chromaticAberration.style.width = '100%';
  chromaticAberration.style.height = '100%';
  chromaticAberration.style.background = 'linear-gradient(45deg, rgba(255, 0, 0, 0.1) 0%, transparent 20%, transparent 80%, rgba(0, 0, 255, 0.1) 100%)';
  chromaticAberration.style.zIndex = '1';
  chromaticAberration.style.pointerEvents = 'none';
  chromaticAberration.style.animation = 'chromatic-shift 8s infinite alternate ease-in-out';
  
  // 创建时间指示器
  const timeIndicator = document.createElement('div');
  timeIndicator.className = 'time-indicator';
  timeIndicator.style.position = 'absolute';
  timeIndicator.style.bottom = '20px';
  timeIndicator.style.right = '20px';
  timeIndicator.style.width = '40px';
  timeIndicator.style.height = '20px';
  timeIndicator.style.backgroundImage = 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20"><text x="0" y="15" font-family="Arial" font-size="16" font-weight="bold" fill="rgb(255,87,87)">T E N E T</text></svg>\')';
  timeIndicator.style.backgroundSize = 'contain';
  timeIndicator.style.backgroundRepeat = 'no-repeat';
  timeIndicator.style.zIndex = '2';
  timeIndicator.style.animation = 'time-indicator-flash 4s infinite alternate ease-in-out';
  timeIndicator.style.opacity = '0.7';
  
  // 添加反向时间流效果
  const reverseTimeFlow = document.createElement('div');
  reverseTimeFlow.className = 'reverse-time-flow';
  reverseTimeFlow.style.position = 'absolute';
  reverseTimeFlow.style.top = '0';
  reverseTimeFlow.style.left = '0';
  reverseTimeFlow.style.width = '100%';
  reverseTimeFlow.style.height = '100%';
  reverseTimeFlow.style.background = 'radial-gradient(circle at center, transparent 70%, rgba(255, 87, 87, 0.1) 100%)';
  reverseTimeFlow.style.zIndex = '0';
  reverseTimeFlow.style.animation = 'reverse-time-flow 10s infinite alternate ease-in-out';
  
  // 组装效果
  effectWrapper.appendChild(timeParticles);
  effectWrapper.appendChild(chromaticAberration);
  effectWrapper.appendChild(timeIndicator);
  effectWrapper.appendChild(reverseTimeFlow);
  container.appendChild(effectWrapper);
  
  // 不再使用JavaScript动画，改为完全依赖CSS动画
  // setupTenetAnimations(timeIndicator, chromaticAberration);
}

// 设置信条特有的动画 - 不再使用此函数，改为CSS动画
function setupTenetAnimations(timeIndicator, chromaticAberration) {
  // 此函数不再使用，保留以避免引用错误
  console.log('使用CSS动画代替JavaScript动画');
}


// 修正更新界面风格函数
function updateInterfaceByMovie(movieType) {
  const container = document.querySelector('.nickname-container');
  if (!container) return;
  
  // 添加诺兰粉丝模式类
  container.classList.add('nolan-fan-mode');
  
  // 移除所有电影类风格类名
  container.classList.remove('nolan-interstellar', 'nolan-inception', 'nolan-batman', 'nolan-tenet');
  
  // 添加对应电影的风格类
  container.classList.add(`nolan-${movieType}`);
  
  // 更新界面标题 - 不直接操作伪元素
  // 而是通过CSS类控制伪元素内容
  const movieTitles = {
    'interstellar': 'interstellar-title',
    'inception': 'inception-title',
    'batman': 'batman-title',
    'tenet': 'tenet-title'
  };
  
  // 移除所有标题类
  Object.values(movieTitles).forEach(cls => {
    container.classList.remove(cls);
  });
  
  // 添加对应标题类
  if (movieTitles[movieType]) {
    container.classList.add(movieTitles[movieType]);
  }
}

// 监听步骤变化
watch(() => props.currentStep, (newStep) => {
  if (newStep === props.targetStep && props.isActive) {
    // 当到达目标步骤且彩蛋已激活时，更新视觉效果
    addNolanVisualEffect();
  }
});

// 向外部暴露的函数
defineExpose({
  activateNolanFanMode,
  deactivateNolanFanMode,
  showCharacterInfo,
  getWelcomeClass,
  getNoteClass,
  getNoteContent
});
</script>

<style>
/* 诺兰模式相关样式 */
.nolan-modal-overlay {
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
  transition: opacity 0.8s ease;
}

.nolan-overlay-visible {
  opacity: 1;
}

.nolan-overlay-closing {
  opacity: 0;
}

.nolan-modal {
  background-color: rgba(16, 26, 35, 0.95);
  border-radius: 8px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  color: #fff;
  text-align: center;
  box-shadow: 0 0 30px rgba(87, 160, 255, 0.3);
  transform: scale(0.9);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  border: 1px solid rgba(87, 160, 255, 0.2);
}

.nolan-modal-visible {
  transform: scale(1);
  opacity: 1;
}

.nolan-modal-closing {
  transform: scale(0.9);
  opacity: 0;
}

.nolan-modal-title {
  font-size: 24px;
  margin-top: 0;
  margin-bottom: 20px;
  color: #57a0ff;
  letter-spacing: 1px;
}

.nolan-modal-quote {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 30px;
  font-style: italic;
  position: relative;
  padding: 10px 20px;
  border-left: 3px solid #57a0ff;
  color: rgba(255, 255, 255, 0.9);
  background-color: rgba(87, 160, 255, 0.1);
  border-radius: 0 4px 4px 0;
  text-align: left;
}

.nolan-modal-close {
  background-color: #57a0ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nolan-modal-close:hover {
  background-color: #3a8bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(58, 139, 255, 0.4);
}

/* 角色提示样式 */
.nolan-character-toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(16, 26, 35, 0.95);
  color: white;
  padding: 15px 20px;
  border-radius: 6px;
  font-size: 15px;
  max-width: 350px;
  text-align: center;
  z-index: 9998;
  box-shadow: 0 0 15px rgba(87, 160, 255, 0.3);
  border: 1px solid rgba(87, 160, 255, 0.2);
  animation: nolan-toast-in 0.5s ease, nolan-toast-out 0.5s ease 2.5s forwards;
}

@keyframes nolan-toast-in {
  from { opacity: 0; transform: translate(-50%, 20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

@keyframes nolan-toast-out {
  from { opacity: 1; transform: translate(-50%, 0); }
  to { opacity: 0; transform: translate(-50%, -20px); }
}

/* 星空效果样式 */
.nolan-starfield {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

/* 修复星星可见性 */
.nolan-star {
  position: absolute;
  background-color: white !important; /* 强制白色 */
  border-radius: 50%;
  opacity: 0.8 !important;
  box-shadow: 0 0 2px 1px rgba(255, 255, 255, 0.5) !important; /* 增加光晕 */
  animation: nolan-star-twinkle 3s infinite ease-in-out;
  z-index: 0 !important;
}

@keyframes nolan-star-twinkle {
  0% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 0.9; transform: scale(1.2); }
  100% { opacity: 0.2; transform: scale(0.8); }
}

/* 确保效果可见 */
.nolan-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1 !important; /* 使用!important确保优先级 */
  overflow: visible; /* 改为visible，避免效果被裁剪 */
  pointer-events: none;
  opacity: 1 !important; /* 确保效果可见 */
}

/* 黑洞效果修正 */
.nolan-blackhole {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 70%);
  box-shadow: 0 0 40px 10px rgba(0, 0, 0, 0.8);
  transform: translate(-50%, -50%);
  z-index: 0;
  opacity: 0.9; /* 增加不透明度确保可见 */
  animation: blackhole-pulse 8s infinite alternate ease-in-out;
}

@keyframes nolan-blackhole-pulse {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
}

/* 波纹效果 */
.nolan-ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(87, 160, 255, 0.3);
  transform: scale(0);
  animation: nolan-ripple-effect 1s linear;
  pointer-events: none;
}

@keyframes nolan-ripple-effect {
  to {
    transform: scale(2);
    opacity: 0;
  }
}

/* 诺兰粉丝模式电影特定样式 */
.nolan-fan-mode {
  position: relative;
  overflow: hidden;
  transition: all 0.8s ease-in-out;
  border: 1px solid rgba(87, 160, 255, 0.3);
  box-shadow: 0 0 15px rgba(87, 160, 255, 0.2);
}

/* 星际穿越风格 */
.nolan-interstellar {
  background-color: rgba(16, 26, 45, 0.9);
  box-shadow: 0 0 25px rgba(87, 160, 255, 0.4);
}

.nolan-interstellar input {
  border-color: rgba(87, 160, 255, 0.5) !important;
  color: #fff !important;
  background-color: rgba(16, 26, 45, 0.7) !important;
}

.nolan-interstellar .nickname-suggestion {
  background-color: rgba(16, 26, 45, 0.8);
  border-color: rgba(87, 160, 255, 0.5);
  color: #fff;
}

.nolan-interstellar .nickname-suggestion:hover {
  background-color: rgba(87, 160, 255, 0.2);
} 

/* 盗梦空间风格 - 修正为电影实际的冷色调 */
.nolan-inception {
  background-color: rgba(28, 35, 45, 0.9);
  box-shadow: 0 0 25px rgba(70, 130, 180, 0.4);
  transform: perspective(1000px) rotateX(3deg);
}

.nolan-inception input {
  border-color: rgba(70, 130, 180, 0.5) !important;
  color: #fff !important;
  background-color: rgba(28, 35, 45, 0.7) !important
}

.nolan-inception .nickname-suggestion {
  background-color: rgba(28, 35, 45, 0.8);
  border-color: rgba(70, 130, 180, 0.5);
  color: #fff;
}

/* 蝙蝠侠风格 */
.nolan-batman {
  background-color: rgba(20, 20, 20, 0.95);
  box-shadow: 0 0 25px rgba(255, 255, 0, 0.2);
}

.nolan-batman input {
  border-color: rgba(255, 255, 0, 0.3) !important;
  color: #fff !important;
  background-color: rgba(20, 20, 20, 0.9) !important;
}

.nolan-batman .nickname-suggestion {
  background-color: rgba(20, 20, 20, 0.9);
  border-color: rgba(255, 255, 0, 0.3);
  color: #fff;
}

/* 信条风格 */
.nolan-tenet {
  background-color: rgba(15, 32, 45, 0.9);
  box-shadow: 0 0 25px rgba(255, 87, 87, 0.3);
}

.nolan-tenet input {
  border-color: rgba(255, 87, 87, 0.4) !important;
  color: #fff !important;
  background-color: rgba(15, 32, 45, 0.8) !important;
}

.nolan-tenet .nickname-suggestion {
  background-color: rgba(15, 32, 45, 0.8);
  border-color: rgba(255, 87, 87, 0.4);
  color: #fff;
}

/* 各电影风格的欢迎信息样式 */
.interstellar-welcome {
  font-family: 'Arial', sans-serif;
  color: #57a0ff;
  font-weight: 300;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(87, 160, 255, 0.5);
}

/* 盗梦空间欢迎信息样式 */
.inception-welcome {
  font-family: 'Georgia', serif;
  color: #4682b4;
  font-style: italic;
  letter-spacing: 1px;
  text-shadow: 0 0 8px rgba(70, 130, 180, 0.4);
  transform: perspective(500px) rotateX(2deg);
  display: inline-block;
}


.batman-welcome {
  font-family: 'Impact', sans-serif;
  color: #e6e600;
  text-transform: uppercase;
  letter-spacing: 3px;
  text-shadow: 0 0 12px rgba(230, 230, 0, 0.3);
}

.tenet-welcome {
  font-family: 'Courier New', monospace;
  color: #ff5757;
  font-weight: bold;
  letter-spacing: -1px;
  text-shadow: 0 0 8px rgba(255, 87, 87, 0.4);
}

/* 各电影风格的示例纸条样式 */
.interstellar-note {
  background: linear-gradient(to bottom, rgba(16, 26, 45, 0.8), rgba(16, 26, 45, 0.9)) !important;
  color: #ffffff !important;
  border: 1px solid rgba(87, 160, 255, 0.5) !important;
  font-family: 'Arial', sans-serif !important;
  box-shadow: 0 0 20px rgba(87, 160, 255, 0.3) !important;
  text-shadow: 0 0 5px rgba(87, 160, 255, 0.3) !important;
}

/* 盗梦空间笔记样式 - 蓝灰色梦境感 */
.inception-note {
  background: linear-gradient(to bottom, rgba(28, 35, 45, 0.8), rgba(28, 35, 45, 0.9)) !important;
  color: #ffffff !important;
  border: 1px solid rgba(70, 130, 180, 0.5) !important;
  font-family: 'Georgia', '楷体', 'STKaiti', '宋体', 'SimSun', serif !important;
  font-style: italic !important;
  box-shadow: 0 0 20px rgba(70, 130, 180, 0.3), inset 0 0 10px rgba(70, 130, 180, 0.1) !important;
  transform: perspective(800px) rotateX(2deg) !important;
  text-shadow: 0 0 3px rgba(70, 130, 180, 0.5) !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
  position: relative !important;
  overflow: hidden !important;
}

.inception-note::before {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: skewX(-25deg);
  animation: inception-shimmer 6s infinite;
}

@keyframes inception-shimmer {
  0% { left: -150%; }
  50% { left: 150%; }
  100% { left: 150%; }
}

/* 蝙蝠侠笔记样式 - 暗黑高谭风格 */
.batman-note {
  background: linear-gradient(to bottom, rgba(20, 20, 20, 0.9), rgba(30, 30, 30, 0.95)) !important;
  color: #ffffff !important;
  border: 1px solid rgba(230, 230, 0, 0.3) !important;
  font-family: 'Arial', '黑体', 'SimHei', '微软雅黑', 'Microsoft YaHei', sans-serif !important;
  box-shadow: 0 0 20px rgba(230, 230, 0, 0.2), inset 0 0 15px rgba(0, 0, 0, 0.7) !important;
  letter-spacing: 0.5px !important;
  border-radius: 2px !important;
  text-shadow: 0 0 2px rgba(230, 230, 0, 0.3) !important;
  position: relative !important;
  transition: all 0.3s ease !important;
  overflow: hidden !important;
}

.batman-note::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(230, 230, 0, 0.5), transparent);
}

.batman-note:hover {
  box-shadow: 0 0 25px rgba(230, 230, 0, 0.3), inset 0 0 15px rgba(0, 0, 0, 0.7) !important;
}

/* 信条笔记样式 - 时空逆转科技感 */
.tenet-note {
  background: linear-gradient(to bottom, rgba(15, 32, 45, 0.8), rgba(15, 32, 45, 0.9)) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 87, 87, 0.4) !important;
  font-family: 'Courier New', '等线', 'DengXian', '微软雅黑', 'Microsoft YaHei', monospace !important;
  box-shadow: 0 0 20px rgba(255, 87, 87, 0.3), 0 0 40px rgba(87, 160, 255, 0.1) !important;
  letter-spacing: -0.5px !important;
  border-radius: 3px !important;
  position: relative !important;
  overflow: hidden !important;
  transition: all 0.3s ease !important;
}

.tenet-note::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent 0%, 
    rgba(255, 87, 87, 0.03) 25%,
    transparent 50%,
    rgba(87, 160, 255, 0.03) 75%, 
    transparent 100%
  );
  z-index: 1;
  pointer-events: none;
}

.tenet-note::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.05), transparent);
  transform: skewX(-25deg);
  animation: tenet-time-shift 8s infinite alternate;
}

@keyframes tenet-time-shift {
  0% { transform: translateX(0) skewX(-25deg); opacity: 0; }
  20% { opacity: 0.5; }
  60% { opacity: 0; }
  100% { transform: translateX(300%) skewX(-25deg); opacity: 0.5; }
}

/* 响应式调整 */
@media (max-width: 480px) {
  .nolan-modal {
    padding: 20px;
    width: 95%;
  }
  
  .nolan-modal-title {
    font-size: 20px;
  }
  
  .nolan-modal-quote {
    font-size: 16px;
    padding: 8px 15px;
  }
  
  .nolan-character-toast {
    max-width: 300px;
    font-size: 14px;
    padding: 12px 15px;
  }
  
  .nolan-blackhole {
    width: 40px;
    height: 40px;
  }
}

/* 星际穿越效果加强 */
.interstellar-effect {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 0 !important;
  pointer-events: none !important;
  opacity: 1 !important;
  visibility: visible !important;
  display: block !important;
  background-color: rgba(16, 26, 45, 0.3) !important;
}

.nolan-starfield {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
}

/* 确保星星可见 */
.nolan-star {
  position: absolute;
  background-color: white;
  border-radius: 50%;
  opacity: 0.8;
  animation: nolan-star-twinkle 3s infinite ease-in-out;
  z-index: 1; /* 确保在黑色背景上方 */
}

.interstellar-nebula {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(87, 160, 255, 0.3) 0%, rgba(87, 160, 255, 0.1) 40%, transparent 70%);
  filter: blur(8px);
  animation: nebula-pulse 10s infinite alternate ease-in-out;
}

@keyframes nebula-pulse {
  0% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.3); opacity: 0.3; }
  100% { transform: scale(1); opacity: 0.1; }
}

.nolan-blackhole {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 70%);
  box-shadow: 0 0 40px 10px rgba(0, 0, 0, 0.8);
  transform: translate(-50%, -50%);
  z-index: 0;
  opacity: 0.9;
  animation: blackhole-pulse 8s infinite alternate ease-in-out;
}

.gravitational-lens {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: transparent;
  border: 2px solid rgba(87, 160, 255, 0.1);
  transform: translate(-50%, -50%);
  z-index: -1;
  box-shadow: 0 0 20px 5px rgba(87, 160, 255, 0.05), inset 0 0 20px 5px rgba(87, 160, 255, 0.05);
  animation: lens-rotate 20s linear infinite;
}

.gravitational-lens::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 1px solid rgba(87, 160, 255, 0.05);
  transform: translate(-50%, -50%);
  animation: lens-rotate-reverse 25s linear infinite;
}

.interstellar-orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 240px;
  height: 80px;
  border-radius: 50%;
  border: 1px solid rgba(87, 160, 255, 0.1);
  transform: translate(-50%, -50%);
  animation: orbit-rotate 30s linear infinite;
  z-index: -1;
}

.interstellar-orbit::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  top: 0;
  left: 50%;
  box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.5);
  animation: planet-orbit 30s linear infinite;
}

@keyframes blackhole-pulse {
  0% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 40px 10px rgba(0, 0, 0, 0.8); }
  50% { transform: translate(-50%, -50%) scale(1.2); box-shadow: 0 0 60px 20px rgba(0, 0, 0, 0.9); }
  100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 40px 10px rgba(0, 0, 0, 0.8); }
}

@keyframes lens-rotate {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes lens-rotate-reverse {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(-360deg); }
}

@keyframes orbit-rotate {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes planet-orbit {
  0% { transform: translateX(-50%) rotate(0deg) translateY(-40px); }
  100% { transform: translateX(-50%) rotate(360deg) translateY(-40px); }
}

/* 蝙蝠侠特效增强 */

.batman-effect {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 0 !important;
  pointer-events: none !important;
  opacity: 1 !important;
  visibility: visible !important;
  display: block !important;
  background-color: rgba(20, 20, 20, 0.3) !important;
}


.gotham-silhouette {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30%;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 200"><path d="M0,200 L0,150 L50,145 L70,160 L100,130 L120,140 L140,120 L160,130 L180,110 L200,120 L220,100 L240,110 L260,90 L280,110 L300,80 L320,100 L340,80 L360,90 L380,70 L400,85 L420,65 L440,80 L460,60 L480,70 L500,50 L520,65 L540,45 L560,60 L580,40 L600,55 L620,35 L640,50 L660,30 L680,45 L700,25 L720,40 L740,30 L760,45 L780,25 L800,40 L820,20 L840,35 L860,15 L880,30 L900,10 L920,25 L940,15 L960,30 L980,10 L1000,25 L1020,5 L1040,20 L1060,10 L1080,25 L1100,5 L1120,20 L1140,10 L1160,30 L1180,20 L1200,30 L1200,200 Z" fill="black"/></svg>');
  background-size: 100% 100%;
  opacity: 0.8;
  z-index: 1;
}


/* 修复蝙蝠侠元素 */
.bat-signal {
  position: absolute;
  top: 30%;
  left: 50%;
  width: 50px;
  height: 30px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><path d="M50,0 L60,10 L80,10 L75,20 L90,35 L70,35 L60,60 L50,45 L40,60 L30,35 L10,35 L25,20 L20,10 L40,10 L50,0 Z" fill="rgb(255,255,0)"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  transform: translate(-50%, -50%);
  opacity: 0.5 !important; /* 增加默认不透明度 */
  animation: bat-signal-flash 4s infinite ease-in-out !important; /* 缩短动画周期 */
  z-index: 2;
  filter: drop-shadow(0 0 10px rgba(255, 255, 0, 0.8));
}


.gotham-fog {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  z-index: 0;
}

/* 修复雨滴效果相关样式 */
.rain-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
  pointer-events: none;
}

.raindrop {
  position: absolute;
  width: 2px;
  height: 20px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.5));
  z-index: 2;
  pointer-events: none;
}

@keyframes rain-fall {
  0% { transform: translateY(-20px); }
  100% { transform: translateY(calc(100vh)); }
}

/* 确保动画运行效果不被覆盖 */
.batman-effect .raindrop {
  animation: rain-fall linear infinite;
}

/* 添加闪电效果样式 */
.gotham-lightning {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  opacity: 0;
  z-index: 3;
  transition: opacity 0.1s ease-out;
  pointer-events: none;
}

.lightning-active {
  opacity: 0;
  animation: lightning-flash 0.6s ease-out;
}

@keyframes lightning-flash {
  0% {
    background-color: transparent;
    opacity: 0;
  }
  10% {
    background-color: rgba(255, 255, 255, 0.8);
    opacity: 0.8;
    box-shadow: 0 0 30px 10px rgba(255, 255, 255, 0.6);
  }
  20% {
    background-color: transparent;
    opacity: 0;
  }
  30% {
    background-color: rgba(255, 255, 255, 0.6);
    opacity: 0.6;
  }
  40% {
    background-color: transparent;
    opacity: 0;
  }
  100% {
    background-color: transparent;
    opacity: 0;
  }
}

/* 添加蝙蝠侠闪电的蝙蝠信号增强效果 */
.lightning-active + .bat-signal {
  filter: drop-shadow(0 0 20px rgba(255, 255, 0, 1));
  opacity: 0.9 !important;
  animation: bat-signal-enhanced 0.6s ease-out !important;
}

@keyframes bat-signal-enhanced {
  0% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.3); filter: drop-shadow(0 0 30px rgba(255, 255, 0, 1)); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

/* 修复bat-signal闪烁动画 */
@keyframes bat-signal-flash {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}


/* 确保子元素可见性 */
.nolan-star, .bat-signal, .gotham-silhouette, .raindrop, .gotham-fog {
  position: absolute !important;
  z-index: 1 !important;
  opacity: 1 !important;
  visibility: visible !important;
}

/* 盗梦空间增强效果 */
.inception-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  perspective: 1000px;
}

.mirror-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  animation: mirror-rotate 20s infinite linear;
}

/* 盗梦空间增强效果 - 调整为蓝灰色系 */
.folding-city-layer {
  position: absolute;
  width: 100%;
  height: 25%;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100"><path d="M0,100 L0,60 L20,50 L40,65 L60,45 L80,55 L100,35 L120,50 L140,30 L160,40 L180,20 L200,30 L220,10 L240,25 L260,15 L280,30 L300,10 L320,20 L340,5 L360,15 L380,0 L400,10 L420,0 L440,15 L460,5 L480,20 L500,10 L520,25 L540,15 L560,30 L580,20 L600,35 L620,25 L640,40 L660,30 L680,45 L700,35 L720,50 L740,40 L760,55 L780,45 L800,60 L820,50 L840,65 L860,55 L880,70 L900,60 L920,75 L940,65 L960,80 L980,70 L1000,85 L1000,100 Z" fill="rgba(70, 130, 180, 0.3)"/></svg>');
  background-size: cover;
  transform-origin: center bottom;
  animation: city-fold infinite alternate ease-in-out 8s;
}

.dream-levels {
  position: absolute;
  top: 10%;
  left: 5%;
  z-index: 2;
}

.dream-level-indicator {
  width: 30px;
  height: 30px;
  margin-bottom: 15px;
  border-radius: 50%;
  border: 2px solid rgba(70, 130, 180, 0.8);
  box-shadow: 0 0 10px rgba(70, 130, 180, 0.5);
  animation: dream-level-pulse 2s infinite alternate ease-in-out;
}

.inception-spinner {
  position: absolute;
  bottom: 15%;
  right: 15%;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(70, 130, 180, 0.8), rgba(40, 100, 150, 0.8));
  box-shadow: 0 0 15px rgba(70, 130, 180, 0.6);
  animation: spinner-rotate 8s linear infinite;
  z-index: 3;
}

@keyframes mirror-rotate {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}

@keyframes city-fold {
  0% { transform: rotateX(0deg); }
  100% { transform: rotateX(80deg); }
}

@keyframes dream-level-pulse {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.1); opacity: 0.8; }
}

@keyframes spinner-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(1440deg); }
}

/* 信条效果 */
.tenet-effect {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 0 !important; /* 改为0，与其他效果一致 */
  overflow: hidden !important;
  visibility: visible !important;
  opacity: 1 !important;
  background-color: rgba(15, 32, 45, 0.3) !important;
  pointer-events: none !important;
  display: block !important;
}

.time-particles {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 1 !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: none !important;
  display: block !important;
}

.time-particle {
  position: absolute !important;
  border-radius: 50% !important;
  z-index: 2 !important;
  visibility: visible !important;
  opacity: 0.8 !important;
  box-shadow: 0 0 5px 2px rgba(255, 87, 87, 0.3) !important; /* 添加光晕效果 */
  pointer-events: none !important;
  display: block !important;
}

.time-particle:nth-child(even) {
  box-shadow: 0 0 5px 2px rgba(87, 160, 255, 0.3) !important; /* 蓝色粒子光晕 */
}

.chromatic-aberration {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: linear-gradient(45deg, rgba(255, 0, 0, 0.1) 0%, transparent 20%, transparent 80%, rgba(0, 0, 255, 0.1) 100%) !important;
  animation: chromatic-shift 8s infinite alternate ease-in-out !important;
  z-index: 1 !important;
  pointer-events: none !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
}

.time-indicator {
  position: absolute !important;
  bottom: 20px !important;
  right: 20px !important;
  width: 40px !important;
  height: 20px !important;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20"><text x="0" y="15" font-family="Arial" font-size="16" font-weight="bold" fill="rgb(255,87,87)">T E N E T</text></svg>') !important;
  background-size: contain !important;
  background-repeat: no-repeat !important;
  animation: time-indicator-flash 4s infinite alternate ease-in-out !important;
  z-index: 2 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  filter: drop-shadow(0 0 3px rgba(255, 87, 87, 0.8)) !important; /* 添加文字阴影 */
}

.reverse-time-flow {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: radial-gradient(circle at center, transparent 70%, rgba(255, 87, 87, 0.1) 100%) !important;
  z-index: 0 !important;
  animation: reverse-time-flow 10s infinite alternate ease-in-out !important;
  pointer-events: none !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
}

/* 确保信条粒子动画正确定义 */
@keyframes time-particle-flow {
  0% { 
    transform: translateY(0) translateX(0) scale(0); 
    opacity: 0; 
  }
  50% { 
    opacity: 1; 
  }
  100% { 
    transform: translateY(-100px) translateX(100px) scale(1.5); 
    opacity: 0; 
  }
}

@keyframes chromatic-shift {
  0% { transform: translateX(-5px); }
  100% { transform: translateX(5px); }
}

@keyframes time-indicator-flash {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}

@keyframes reverse-time-flow {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* 更新现有动画 */
@keyframes nolan-star-twinkle {
  0% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 0.9; transform: scale(1.2); }
  100% { opacity: 0.2; transform: scale(0.8); }
}
</style>