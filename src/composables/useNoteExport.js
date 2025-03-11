import { ref } from 'vue';
import html2canvas from 'html2canvas';

export function useNoteExport() {
  // 改进版exportAsImage函数
  const exportAsImage = async (element) => {
    try {
      if (!element) {
        throw new Error("Element to export is null or undefined");
      }

      console.log("导出元素:", element); // 添加调试信息
      
      // 使用html2canvas直接导出，避免iframe复杂性
      // 避免重复导入已经导入的库
      // const html2canvas = (await import('html2canvas')).default;
      
      // 确保所有字体和图片已加载完成
      await document.fonts.ready;
      
      // 添加延迟确保渲染完成
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 优化：不再使用onclone选项，而是直接处理目标元素
      const canvas = await html2canvas(element, {
        scale: 2, // 提高导出质量
        useCORS: true, // 允许跨域图片
        allowTaint: true,
        backgroundColor: null, // 保留透明背景
        logging: true, // 开启日志以便调试
        imageTimeout: 0, // 不设置图片超时
        removeContainer: false // 不移除容器
      });
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('导出图片失败:', error);
      throw error;
    }
  };

  // 保存到设备的函数
  const saveToDevice = async (dataUrl, fileName = 'note.png') => {
    try {
      // 针对iOS Safari特殊处理
      if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        // 在新标签页中打开图片，让用户长按保存
        const newTab = window.open();
        if (newTab) {
          newTab.document.write(`
            <html>
              <head>
                <title>保存心语图片</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body {
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background-color: #f5f5f5;
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    padding: 20px;
                    text-align: center;
                  }
                  img {
                    max-width: 100%;
                    max-height: 80vh;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    margin-bottom: 20px;
                  }
                  p {
                    color: #333;
                    margin-bottom: 10px;
                  }
                  .tip {
                    font-size: 14px;
                    color: #666;
                  }
                </style>
              </head>
              <body>
                <img src="${dataUrl}" alt="导出的心语">
                <p>请长按图片，选择"存储图像"或"添加到照片"</p>
                <p class="tip">保存后可关闭此页面</p>
              </body>
            </html>
          `);
          return true;
        }
        return false;
      }

      // 桌面浏览器和安卓设备使用标准下载方法
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (error) {
      console.error("保存图片失败:", error);
      return false;
    }
  };

  // 分享图片
  const shareImage = async (imageUrl) => {
    try {
      // 检查是否支持Web Share API
      if (navigator.share && navigator.canShare) {
        // 将Data URL转换为File对象
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'note.png', { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: '分享心语',
          });
          return true;
        }
      }
      
      // 如果不支持文件分享，尝试只分享链接
      if (navigator.share) {
        await navigator.share({
          title: '分享心语',
          text: '我用星语心笺生成了一段心语，点击查看',
          url: window.location.href
        });
        return true;
      }
      
      // 如果都不支持，提供复制到剪贴板的选项
      return false;
    } catch (error) {
      console.error('分享失败:', error);
      return false;
    }
  };

  return {
    exportAsImage,
    saveToDevice,
    shareImage
  };
}