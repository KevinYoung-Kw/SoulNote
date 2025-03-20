const db = require('./db');

async function main() {
  try {
    console.log('开始测试埋点功能');
    
    // 添加测试事件 - 页面访问事件
    const pageViewEvent = await db.addEvent({
      eventType: 'page_view',
      userId: 'test_user',
      ipAddress: '127.0.0.1',
      userAgent: 'Test Agent',
      data: { page: '/home' }
    });
    console.log('添加页面访问事件成功:', pageViewEvent);
    
    // 添加测试事件 - 参数选择事件
    const paramSelectEvent = await db.addEvent({
      eventType: 'param_select',
      userId: 'test_user',
      ipAddress: '127.0.0.1',
      userAgent: 'Test Agent',
      data: { 
        paramType: 'temperature',
        paramValue: '0.7'
      }
    });
    console.log('添加参数选择事件成功:', paramSelectEvent);
    
    // 添加测试事件 - 笔记生成事件
    const noteGenerateEvent = await db.addEvent({
      eventType: 'note_generate',
      userId: 'test_user',
      ipAddress: '127.0.0.1',
      userAgent: 'Test Agent',
      data: { 
        noteId: 'test-note-123',
        promptLength: 50
      }
    });
    console.log('添加笔记生成事件成功:', noteGenerateEvent);
    
    // 获取事件统计
    const stats = await db.getEventStats();
    console.log('事件统计:', stats);
    
    // 获取事件类型分布
    const distribution = await db.getEventTypeDistribution();
    console.log('事件类型分布:', distribution);
    
    // 获取参数分布
    const paramDistribution = await db.getParamDistribution('temperature');
    console.log('温度参数分布:', paramDistribution);
    
    // 获取唯一用户数
    const uniqueUsers = await db.getUniqueUserCount();
    console.log('唯一用户数:', uniqueUsers);
    
  } catch (err) {
    console.error('测试过程中出错:', err);
  }
}

main(); 