# 星语心笺 (SoulNote)

## 项目概述

"星语心笺"是一款基于Web端的轻量级心灵纸条生成器。系统通过云服务API生成个性化正向文案，结合用户设置的星座、MBTI人格类型和心情，创造出独特且温暖的心灵文字。用户可观赏精美的生成动画，并能自由调整样式、保存和分享结果。

### 中文Slogan  
**「心笺一瞬，暖意自生」**  
- "心笺"呼应纸条的治愈属性，强调情感传递  
- "一瞬"体现生成内容的即时性与轻量化  
- "暖意自生"传递无需用户深度输入的自动化设计，自然唤醒内心温暖  

### 英文Slogan  
**「Soul Notes, Brighter Moments」**  
- "Soul Notes"直指心灵纸条的深度与个性化  
- "Brighter Moments"强调通过正向内容点亮用户的日常瞬间  
- 简洁押韵，易传播且富有画面感

## 核心功能

### 1. 个性化内容生成
- 基于用户选择的星座、MBTI人格类型生成个性化内容
- 支持输入emoji或文字表达当前心情
- 根据设备时间适配不同时段的文案风格
- 中文/中英双语输出选项

### 2. 精美视觉体验
- 纸条生成过程的显像动画效果，从模糊到清晰
- 多种纸条背景风格选择
- 字体大小调整功能
- 暗黑模式支持

### 3. 便捷管理与分享
- 收藏喜欢的纸条内容
- 导出为高质量图片
- 一键分享到社交媒体
- 基于浏览器指纹的无感用户识别，无需登录即可保存个人数据

### 4. 邀请码系统
- 基于邀请码的访问控制
- 管理员后台统计和监控
- 可限制单个邀请码的使用次数
- 自定义邀请码前缀功能

## 技术栈

### 前端
- **前端框架**: Vue.js 3 + Composition API
- **构建工具**: Vite
- **动画效果**: GSAP
- **样式设计**: 原生CSS + 变量
- **图标支持**: Font Awesome
- **HTTP请求**: Axios
- **图片导出**: html2canvas
- **状态管理**: Vue Reactivity + LocalStorage
- **路由管理**: Vue Router
- **用户识别**: FingerprintJS（浏览器指纹识别）

### 后端
- **运行环境**: Node.js
- **服务框架**: Express.js
- **数据存储**: MongoDB
- **身份验证**: JWT
- **API文档**: Swagger
- **日志管理**: Winston

## 项目结构

```
/SoulNote
├── public/                 # 静态资源
│   └── favicon.ico         # 网站图标
├── src/                    # 源代码
│   ├── assets/             # 资源文件
│   │   ├── onboarding-welcome.svg
│   │   └── onboarding-complete.svg
│   ├── components/         # 组件
│   │   └── NoteCard.vue    # 纸条卡片组件
│   ├── composables/        # 组合式函数
│   │   ├── useNoteAnimation.js  # 动画相关
│   │   └── useNoteExport.js     # 导出相关
│   ├── pages/              # 页面组件
│   │   ├── HomePage.vue        # 主页面
│   │   ├── OnboardingPage.vue  # 引导页
│   │   ├── SavedNotesPage.vue  # 收藏页
│   │   ├── SettingsPage.vue    # 设置页
│   │   └── WelcomePage.vue     # 欢迎页
│   ├── router/             # 路由配置
│   │   └── index.js
│   ├── services/           # 服务
│   │   ├── aiService.js    # AI生成服务
│   │   └── storageService.js # 存储服务
│   ├── styles/             # 样式
│   │   └── main.css        # 主样式文件
│   ├── App.vue             # 应用根组件
│   └── main.js             # 应用入口
server/
  ├── controllers/          # API 控制器
  │   └── noteController.js # 处理笔记生成请求
  ├── services/             # 业务逻辑服务
  │   ├── aiService.js      # AI API 调用服务
  │   ├── promptService.js  # 提示词构建服务
  │   └── modules/          # 提示词模块
  │       ├── constants.js     # 常量定义
  │       ├── apiService.js    # API服务函数
  │       ├── fortuneUtils.js  # 运势相关工具
  │       ├── personalityUtils.js # 性格特质工具
  │       ├── promptBuilder.js # 提示词构建器
  │       ├── themeUtils.js    # 主题工具
  │       ├── timeUtils.js     # 时间相关工具
  │       └── index.js         # 模块导出
  ├── utils/                # 工具函数
  │   ├── constants.js      # 全局常量定义
  │   └── logger.js         # 日志工具
  ├── routes/               # 路由定义
  │   └── noteRoutes.js     # 笔记生成相关路由
  ├── data/                 # 数据文件夹 (已有)
  ├── middleware/           # 中间件
  │   ├── auth.js           # 认证中间件
  │   └── rateLimiter.js    # 请求限制中间件
  ├── config/               # 配置
  │   └── config.js         # 环境配置
  ├── index.js              # 入口文件 (已有)
  └── package.json          # 项目配置 (已有)
├── .env.example            # 环境变量示例
├── index.html              # HTML入口
├── package.json            # 依赖配置
└── vite.config.js          # Vite配置
```

## 界面流程

1. **欢迎页面**: 展示应用介绍和功能亮点
2. **引导设置**: 引导用户完成必要的个人设置（星座、MBTI等）
3. **主界面**: 提供参数调整、纸条生成和样式设置功能
4. **生成动画**: 展示纸条内容从模糊到清晰的过程
5. **收藏页面**: 管理已保存的纸条内容
6. **设置页面**: 调整应用参数和个人偏好

## 特色体验

1. **零输入魔法**: 简单选择参数，一键获得专属文案
2. **优雅动效**: 精心设计的生成动画提供仪式感体验
3. **简约美学**: 以纸张质感为基础的界面设计，清新自然
4. **个性定制**: 多种背景和字体风格，满足不同审美需求
5. **深度关怀**: 基于星座和MBTI的文案更贴合个人特质

## 快速开始

1. **安装依赖**
   ```bash
   npm install
   ```

2. **配置环境变量**
   - 复制`.env.example`为`.env`
   - 设置您的API密钥和其他配置项

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **构建生产版本**
   ```bash
   npm run build
   ```

## 部署指南

### 构建优化
- 使用`esbuild` minifier提高构建速度
- 路由懒加载减少初始加载体积
- 资源预加载优化用户体验

### 安全考量
- API密钥应通过环境变量注入
- 敏感操作建议使用服务端代理
- 可选择Netlify/Vercel等平台的Serverless Functions

## 开发指南

### 前端部分

1. 安装依赖
```bash
npm install
```

2. 启动开发服务器
```bash
npm run dev
```

### 后端部分 (邀请码验证)

1. 进入后端目录
```bash
cd server
```

2. 安装依赖
```bash
npm install
```

3. 启动后端服务
```bash
npm run dev
```

4. 生产环境启动
```bash
npm start
```

### 配置邀请码系统

1. 在 `server/.env` 文件中设置管理员密钥
```
ADMIN_KEY=your_admin_key
```

2. 使用API生成新的邀请码
```
POST http://localhost:4000/api/generate-invite-code
Content-Type: application/json

{
  "adminKey": "your_admin_key",
  "maxUses": 100,
  "prefix": "SOUL"
}
```

3. 查看统计数据
```
GET http://localhost:4000/api/stats?key=your_admin_key
```

### 访问管理面板

1. 启动后端服务后，访问以下URL进入管理面板
```
http://localhost:4000/admin
```

## 开发团队

"星语心笺"是一个开源项目，欢迎贡献代码和提出建议。

## 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](LICENSE) 文件。

### 最近更新

#### 组件更新 (2024年3月版本)

1. **ParamsPanel.vue**
   - 实现基于概率和权重的智能搜索系统，支持模糊匹配和语义相关性搜索
   - 添加情感关键词映射表，将用户输入与表情进行智能匹配
   - 使用Levenshtein距离算法计算字符串相似度，提高搜索准确性
   - 实现搜索结果按相关性排序，并按分类分组显示
   - 优化了毒舌模式的样式和交互体验
   - 增强移动端适配和响应式设计

2. **NoteStyleCustomizer.vue**
   - 新增自定义样式定制器，提供更丰富的笔记样式选项
   - 添加多种布局选择：上图下文、下图上文、纯纸条、图片背景等
   - 支持字体、颜色、间距、边框等详细样式调整
   - 增加实时预览功能，所见即所得

3. **NoteCard.vue**
   - 重构卡片渲染逻辑，支持多种布局方式
   - 优化图片背景层实现，提升渲染性能
   - 新增社群二维码展示功能
   - 增强样式自定义能力，支持更多自定义属性

4. **ImagePreviewModel.vue**
   - 全新的图片预览与导出组件
   - 支持多种导出格式选择（PNG、JPG、WEBP）
   - 增加图片尺寸和质量控制选项
   - 添加透明背景支持
   - 优化导出流程和用户体验

5. **HomeView.vue 和 SavedNotesPage.vue**
   - 整合样式定制器和图片预览功能
   - 改进导出和分享流程
   - 优化笔记管理和查看体验

6. **ParamsPreview.vue**
   - 增强模式切换效果
   - 优化UI/UX设计，提高操作流畅度
   - 改进小屏幕设备适配

#### 功能更新

1. **智能搜索系统**
   - 基于权重的表情匹配算法，根据相关性得分排序结果
   - 支持直接关键词映射，如"可恶"→😡、"笑死"→🤣
   - 情感分析与语义理解，识别输入词与情感类别的关系
   - 相似度计算与多层次搜索策略，提高搜索结果准确性
   - 结果分组与排序优化，改进用户体验

2. **样式定制增强**
   - 扩展自定义样式选项，支持更多布局和设计风格
   - 优化样式继承和应用逻辑，提高定制灵活性
   - 增加更多预设模板，满足不同使用场景

3. **导出功能升级**
   - 重构图片导出系统，支持多种格式和质量设置
   - 优化Canvas渲染，提高导出图片质量
   - 增加批量导出能力
   - 改进分享功能，支持更多社交平台

4. **UI/UX优化**
   - 全面优化移动端适配和响应式设计
   - 改进动画效果和交互反馈
   - 增强暗黑模式和毒舌模式的视觉效果
   - 提升整体应用性能和加载速度

#### 最新版本更新

{
  number: '1.6.0',
  date: '2024-03-17',
  updates: [
    {
      type: 'feature',
      items: [
        '实现基于概率和权重的智能搜索系统，大幅提升表情查找体验',
        '新增自定义样式定制器，支持多种布局和详细样式调整',
        '升级图片导出系统，支持多种格式、尺寸和质量选项',
        '添加社群二维码展示功能，促进用户交流'
      ]
    },
    {
      type: 'improvement',
      items: [
        '优化移动端适配和响应式设计，提升跨设备使用体验',
        '改进UI/UX设计，增强视觉效果和交互流畅度',
        '提升应用性能和加载速度，优化资源使用效率',
        '增强毒舌模式的样式和交互体验'
      ]
    },
    {
      type: 'fix',
      items: [
        '修复在特定设备上的布局异常问题',
        '解决夜间模式下某些元素对比度不足的问题',
        '修复图片导出过程中可能出现的内存泄漏',
        '解决搜索结果有时不准确的问题'
      ]
    }
  ]
}