/**
 * 处理和清理输出内容，确保没有未闭合的标签
 * @param {string} content 输入内容
 * @returns {string} 清理后的内容
 */
export function sanitizeContent(content) {
  if (!content) return '';
  
  // 检查是否有<content>标签
  const hasOpenTag = content.includes('<content>');
  const hasCloseTag = content.includes('</content>');
  
  // 如果只有开标签没有闭标签，移除开标签
  if (hasOpenTag && !hasCloseTag) {
    content = content.replace('<content>', '');
  }
  
  // 如果有两个标签，提取中间内容
  if (hasOpenTag && hasCloseTag) {
    const startPos = content.indexOf('<content>') + '<content>'.length;
    const endPos = content.indexOf('</content>');
    if (startPos < endPos) {
      content = content.substring(startPos, endPos);
    }
  }
  
  // 移除所有剩余的content标签
  content = content.replace(/<\/?content>/g, '');
  
  return content.trim();
}

/**
 * 规范化内容，确保包含正确的content标签
 * @param {string} content 输入内容
 * @returns {string} 规范化后的内容
 */
export function normalizeContent(content) {
  if (!content) return '';
  
  // 先清理所有现有的content标签
  content = content.replace(/<\/?content>/g, '').trim();
  
  // 然后规范化地添加content标签
  return `<content>${content}</content>`;
}

/**
 * 从服务器响应中提取内容
 * @param {string} response 服务器响应
 * @returns {string} 提取的内容
 */
export function extractContentFromResponse(response) {
  if (!response) return '';
  
  // 尝试使用正则表达式匹配content标签之间的内容
  const contentMatch = response.match(/<content>([\s\S]*?)<\/content>/);
  if (contentMatch && contentMatch[1]) {
    return contentMatch[1].trim();
  }
  
  // 如果没有找到正确格式的content标签，检查是否有开标签但没有闭标签
  if (response.includes('<content>')) {
    const content = response.split('<content>')[1];
    if (content) {
      return content.trim();
    }
  }
  
  // 如果没有任何content标签，返回原始响应（可能需要根据实际情况修改）
  return response.trim();
}
