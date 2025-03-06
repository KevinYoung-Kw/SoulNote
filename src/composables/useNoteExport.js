import { ref } from 'vue';
import html2canvas from 'html2canvas';

export function useNoteExport() {
  const exportStatus = ref('idle'); // idle, exporting, success, error
  
  async function exportAsImage(elementRef) {
    if (!elementRef) return null;
    
    try {
      exportStatus.value = 'exporting';
      
      // 配置html2canvas选项
      const options = {
        scale: 3, // 提高导出图片质量
        useCORS: true, // 允许加载跨域图片
        allowTaint: true,
        backgroundColor: null // 透明背景
      };
      
      // 生成canvas
      const canvas = await html2canvas(elementRef, options);
      
      // 转换为图片URL
      const imageUrl = canvas.toDataURL('image/png');
      
      exportStatus.value = 'success';
      return imageUrl;
      
    } catch (error) {
      console.error('导出图片失败:', error);
      exportStatus.value = 'error';
      throw error;
    }
  }
  
  async function saveToDevice(imageUrl, filename = 'soul-note.png') {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.click();
  }
  
  async function shareImage(imageUrl) {
    // 检查Web Share API是否可用
    if (navigator.share && navigator.canShare) {
      try {
        // 将Base64图片URL转换为File对象
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const file = new File([blob], 'soul-note.png', { type: 'image/png' });
        
        // 检查是否可以分享此文件
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: '来自星语心笺的心灵纸条',
            text: '分享一段温暖的话语给你...',
            files: [file]
          });
          return true;
        }
      } catch (error) {
        console.error('分享失败:', error);
      }
    }
    
    // 如果Web Share API不可用或分享失败，提供备用方式
    return false;
  }
  
  return {
    exportStatus,
    exportAsImage,
    saveToDevice,
    shareImage
  };
}
