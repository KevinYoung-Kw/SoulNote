import { ref } from 'vue';
import html2canvas from 'html2canvas';

export function useNoteExport() {
  // 改进版exportAsImage函数，支持不同的导出格式和选项
  const exportAsImage = async (element, options = {}) => {
    try {
      if (!element) {
        throw new Error("Element to export is null or undefined");
      }

      console.log("导出元素:", element); // 添加调试信息
      console.log("导出选项:", options); // 添加选项调试信息
      
      // 确保所有字体和图片已加载完成
      await document.fonts.ready;
      
      // 添加延迟确保渲染完成
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 设置html2canvas选项
      const html2canvasOptions = {
        scale: options.scale || 2, // 提高导出质量
        useCORS: true, // 允许跨域图片
        allowTaint: true,
        backgroundColor: options.transparentBg ? null : '#ffffff', // 根据选项决定是否使用透明背景
        logging: true, // 开启日志以便调试
        imageTimeout: 0, // 不设置图片超时
        removeContainer: false // 不移除容器
      };
      
      // 创建canvas
      const canvas = await html2canvas(element, html2canvasOptions);
      
      // 根据选项决定导出格式和质量
      const format = options.format || 'png';
      const quality = options.quality || 0.9;
      
      if (format === 'jpg' || format === 'jpeg') {
        return canvas.toDataURL('image/jpeg', quality);
      } else {
        return canvas.toDataURL('image/png');
      }
    } catch (error) {
      console.error('导出图片失败:', error);
      throw error;
    }
  };

  // 保存到设备的函数，支持不同的文件格式
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

  // 分享图片，支持不同的文件格式
  const shareImage = async (imageUrl, options = {}) => {
    try {
      // 检查是否支持Web Share API
      if (navigator.share && navigator.canShare) {
        // 将Data URL转换为File对象
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        // 根据选项决定文件名和类型
        const format = options.format || 'png';
        const fileName = options.fileName || `note.${format}`;
        const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png';
        
        const file = new File([blob], fileName, { type: mimeType });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: options.title || '分享心语',
            text: options.text || '我用星语心笺生成了一段心语',
          });
          return true;
        }
      }
      
      // 如果不支持文件分享，尝试只分享链接
      if (navigator.share) {
        await navigator.share({
          title: options.title || '分享心语',
          text: options.text || '我用星语心笺生成了一段心语，点击查看',
          url: options.url || window.location.href
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

  // 新增：将canvas转换为Blob对象
  const canvasToBlob = async (canvas, format = 'png', quality = 0.9) => {
    return new Promise((resolve, reject) => {
      try {
        if (format === 'jpg' || format === 'jpeg') {
          canvas.toBlob(
            (blob) => resolve(blob),
            'image/jpeg',
            quality
          );
        } else {
          canvas.toBlob(
            (blob) => resolve(blob),
            'image/png'
          );
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  return {
    exportAsImage,
    saveToDevice,
    shareImage,
    canvasToBlob
  };
}