import { ref } from 'vue';
import gsap from 'gsap';

export function useNoteAnimation() {
  const noteRef = ref(null);
  const isAnimating = ref(false);
  
  function playGenerateAnimation() {
    if (!noteRef.value) return;
    
    isAnimating.value = true;
    
    // 重置初始状态
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
      duration: 0.5,
      ease: 'power2.inOut'
    });
    
    // 2. 逐渐清晰
    timeline.to(noteRef.value, {
      filter: 'blur(0px)',
      scale: 1,
      opacity: 1,
      duration: 1.2,
      ease: 'power2.out'
    });
    
    // 3. 添加辉光效果
    timeline.fromTo(
      '.note-glow',
      { opacity: 0 },
      { opacity: 0.7, duration: 0.5, ease: 'power2.inOut' },
      '-=0.8'
    );
    
    // 4. 淡出辉光效果
    timeline.to('.note-glow', {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut'
    });
    
    return timeline;
  }
  
  return {
    noteRef,
    isAnimating,
    playGenerateAnimation
  };
}
