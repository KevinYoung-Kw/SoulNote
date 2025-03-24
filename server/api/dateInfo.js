/**
 * 日期信息API
 * 提供当前日期的农历、节气等信息
 */
const { getTimeContext } = require('../services/modules/timeUtils');

/**
 * 获取当前日期信息
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 */
exports.getCurrentDateInfo = (req, res) => {
  try {
    // 获取时间上下文信息
    const { timeContext } = getTimeContext(false);
    
    // 从timeContext中提取日期信息
    const { dateInfo } = timeContext;
    
    // 构建响应数据
    const response = {
      date: new Date().toISOString(),
      lunarDate: dateInfo.lunarDate || '',
      animal: dateInfo.animal || '',
      festivals: dateInfo.festivals || [],
      weekDay: dateInfo.weekDay || '',
      solarTerm: '', // 节气信息需要从lunar-javascript库获取
      astro: dateInfo.astro || '',
      dayType: dateInfo.dayType || '',
      success: true
    };
    
    // 添加节气信息（如果在timeUtils中有提供）
    if (dateInfo.solarTerm) {
      response.solarTerm = dateInfo.solarTerm;
    }
    
    res.json(response);
  } catch (error) {
    console.error('获取日期信息失败:', error);
    res.status(500).json({
      error: '获取日期信息失败',
      message: error.message,
      success: false
    });
  }
}; 