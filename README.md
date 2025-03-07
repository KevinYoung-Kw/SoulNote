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
├── server/                 # 服务器端代码
│   ├── controllers/        # 控制器
│   ├── models/             # 数据模型
│   ├── routes/             # 路由
│   ├── services/           # 服务
│   ├── utils/              # 工具函数
│   ├── .env.example        # 环境变量示例
│   ├── app.js              # 应用入口
│   └── server.js           # 服务器入口
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