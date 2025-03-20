/**
 * 服务器端管理员控制台工具
 * 提供命令行接口访问管理员功能
 * 
 * 用法: node adminConsole.js <命令> [参数]
 *
 * 可用命令:
 * - stats: 获取系统统计信息
 * - list-codes: 列出所有邀请码
 * - generate-code <前缀> <使用次数>: 生成新邀请码
 * - delete-code <邀请码>: 删除邀请码
 * - event-stats: 获取事件统计
 */

const axios = require('axios');
const readline = require('readline');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

// 管理员密钥
const ADMIN_KEY = process.env.ADMIN_KEY;
// API基础URL
const API_BASE_URL = `http://localhost:${process.env.PORT || 4000}/api/admin`;

if (!ADMIN_KEY) {
  console.error('错误: 未设置管理员密钥(ADMIN_KEY)');
  process.exit(1);
}

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 获取仪表盘数据
async function getDashboard() {
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard`, {
      params: {
        key: ADMIN_KEY
      }
    });
    
    if (response.data && response.data.success) {
      console.log('\n=== 系统统计 ===');
      console.log(`总验证次数: ${response.data.systemStats.totalVerifications || 0}`);
      console.log(`唯一用户数: ${response.data.systemStats.totalUniqueUsers || 0}`);
      console.log(`纸条生成数: ${response.data.systemStats.totalGeneratedNotes || 0}`);
      console.log(`数据更新时间: ${new Date(response.data.systemStats.lastUpdated).toLocaleString()}`);
      
      if (response.data.eventStats && !response.data.eventStats.error) {
        console.log('\n=== 事件统计 ===');
        console.log(`今日事件数: ${response.data.eventStats.todayEvents || 0}`);
        console.log(`昨日事件数: ${response.data.eventStats.yesterdayEvents || 0}`);
        
        if (response.data.eventStats.eventTypeDistribution) {
          console.log('\n事件类型分布:');
          response.data.eventStats.eventTypeDistribution.forEach(item => {
            console.log(`- ${item.type}: ${item.count}`);
          });
        }
      }
      
      console.log('\n=== 邀请码统计 ===');
      console.log(`邀请码总数: ${response.data.inviteCodeStats.length}`);
    } else {
      console.error('获取仪表盘数据失败:', response.data.message || '未知错误');
    }
  } catch (error) {
    console.error('请求错误:', error.message);
  }
}

// 列出所有邀请码
async function listInviteCodes() {
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard`, {
      params: {
        key: ADMIN_KEY
      }
    });
    
    if (response.data && response.data.success && response.data.inviteCodeStats) {
      console.log('\n=== 邀请码列表 ===');
      console.log('邀请码\t使用次数\t最大次数\t唯一IP\t创建时间\t最后使用');
      console.log('----------------------------------------------------------------------');
      
      response.data.inviteCodeStats.forEach(code => {
        console.log(`${code.code}\t${code.usedCount}\t${code.maxUses}\t${code.uniqueIPs}\t${new Date(code.createdAt).toLocaleDateString()}\t${code.lastUsed === 'Never' ? '未使用' : new Date(code.lastUsed).toLocaleDateString()}`);
      });
    } else {
      console.error('获取邀请码列表失败:', response.data.message || '未知错误');
    }
  } catch (error) {
    console.error('请求错误:', error.message);
  }
}

// 生成新邀请码
async function generateInviteCode(prefix, maxUses) {
  try {
    const response = await axios.post(`${API_BASE_URL}/invite-code`, {
      prefix,
      maxUses: parseInt(maxUses) || 100,
      adminKey: ADMIN_KEY
    });
    
    if (response.data && response.data.success) {
      console.log(`\n邀请码生成成功: ${response.data.inviteCode}`);
    } else {
      console.error('生成邀请码失败:', response.data.message || '未知错误');
    }
  } catch (error) {
    console.error('请求错误:', error.message);
  }
}

// 删除邀请码
async function deleteInviteCode(code) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/invite-code/${code}`, {
      params: {
        key: ADMIN_KEY
      }
    });
    
    if (response.data && response.data.success) {
      console.log(`\n邀请码 ${code} 删除成功`);
    } else {
      console.error('删除邀请码失败:', response.data.message || '未知错误');
    }
  } catch (error) {
    console.error('请求错误:', error.message);
  }
}

// 获取事件统计
async function getEventStats() {
  try {
    const response = await axios.get(`${API_BASE_URL}/event-analytics`, {
      params: {
        key: ADMIN_KEY,
        groupBy: 'day'
      }
    });
    
    if (response.data && response.data.success) {
      console.log('\n=== 事件分析 ===');
      console.log(`总事件数: ${response.data.analytics.totalEvents}`);
      console.log(`唯一用户数: ${response.data.analytics.uniqueUserCount}`);
      
      console.log('\n事件类型分布:');
      response.data.analytics.eventTypeDistribution.forEach(item => {
        console.log(`- ${item.type}: ${item.count} (${item.percentage}%)`);
      });
      
      console.log('\n时间序列数据 (最近7天):');
      const recentData = response.data.analytics.timeSeriesData.slice(-7);
      recentData.forEach(item => {
        console.log(`${item.date}: ${item.count} 事件`);
      });
    } else {
      console.error('获取事件统计失败:', response.data.message || '未知错误');
    }
  } catch (error) {
    console.error('请求错误:', error.message);
  }
}

// 显示帮助
function showHelp() {
  console.log(`
星语心笺管理员控制台工具

用法: node adminConsole.js <命令> [参数]

可用命令:
  stats               获取系统统计信息
  list-codes          列出所有邀请码
  generate-code       生成新邀请码，例如: 
                      generate-code SOUL 100
  delete-code         删除邀请码，例如:
                      delete-code SOUL123ABC
  event-stats         获取事件统计
  help                显示此帮助信息
  `);
}

// 交互式命令模式
function startInteractiveMode() {
  console.log('欢迎使用星语心笺管理员控制台 (输入"help"获取帮助，"exit"退出)');
  
  function promptCommand() {
    rl.question('\n> ', async (input) => {
      const args = input.trim().split(/\s+/);
      const command = args[0].toLowerCase();
      
      if (command === 'exit' || command === 'quit') {
        rl.close();
        return;
      }
      
      await processCommand(command, args.slice(1));
      promptCommand();
    });
  }
  
  promptCommand();
}

// 处理命令
async function processCommand(command, args) {
  switch (command) {
    case 'stats':
      await getDashboard();
      break;
    case 'list-codes':
      await listInviteCodes();
      break;
    case 'generate-code':
      await generateInviteCode(args[0], args[1]);
      break;
    case 'delete-code':
      await deleteInviteCode(args[0]);
      break;
    case 'event-stats':
      await getEventStats();
      break;
    case 'help':
      showHelp();
      break;
    default:
      console.log(`未知命令: ${command}\n输入"help"获取帮助`);
  }
}

// 主入口
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // 如果没有命令行参数，进入交互模式
    startInteractiveMode();
  } else {
    // 否则执行命令并退出
    const command = args[0].toLowerCase();
    await processCommand(command, args.slice(1));
    process.exit(0);
  }
}

main().catch(error => {
  console.error('执行失败:', error);
  process.exit(1);
}); 