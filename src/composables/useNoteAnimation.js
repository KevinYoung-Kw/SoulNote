import { ref } from 'vue';
import gsap from 'gsap';

export function useNoteAnimation(defaultDuration = 2.0) {
  const noteRef = ref(null);
  const isAnimating = ref(false);
  
  /**
   * 播放纸条生成动画
   * 实现从模糊到清晰、淡入淡出的效果
   * @param {number} customDuration 自定义动画时长（秒）
   * @returns {object} GSAP时间线对象
   */
  function playGenerateAnimation(customDuration) {
    if (!noteRef.value) return;
    
    const duration = customDuration || defaultDuration;
    isAnimating.value = true;
    
    // 设置初始状态
    gsap.set(noteRef.value, {
      filter: 'blur(15px)',
      opacity: 0,
      scale: 0.95
    });

    // 创建动画序列
    const timeline = gsap.timeline({
      onComplete: () => {
        isAnimating.value = false;
      }
    });
    
    // 1. 淡入模糊状态
    timeline.to(noteRef.value, {
      opacity: 0.7,
      duration: duration * 0.25, // 占总时长的1/4
      ease: 'power2.inOut'
    });
    
    // 2. 逐渐清晰
    timeline.to(noteRef.value, {
      filter: 'blur(0px)',
      scale: 1,
      opacity: 1,
      duration: duration * 0.6, // 占总时长的3/5
      ease: 'power2.out'
    });
    
    // 3. 显示光晕效果
    if (noteRef.value.querySelector('.note-glow')) {
      timeline.fromTo(
        noteRef.value.querySelector('.note-glow'),
        { opacity: 0 },
        { 
          opacity: 0.7, 
          duration: duration * 0.25, 
          ease: 'power2.inOut',
          onComplete: () => {
            // 光晕效果淡出
            gsap.to(noteRef.value.querySelector('.note-glow'), {
              opacity: 0,
              duration: duration * 0.75,
              delay: 0.1
            });
          }
        },
        '-=0.8'
      );
    }
    
    return timeline;
  }
  
  return {
    noteRef,
    isAnimating,
    playGenerateAnimation
  };
}
