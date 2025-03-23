# 模板系统使用说明

## 概述

模板系统是一个组件化的设计，用于快速创建和扩展不同的笔记布局样式。
系统分为以下几个部分：

1. **BaseTemplate** - 所有模板的基础组件
2. **特定模板组件** - 如 PaperTemplate、ImageTopTemplate 等
3. **模板注册表** - 统一管理所有可用模板的 index.js

## 如何添加新模板

### 1. 创建新的模板组件

在 `src/components/templates` 目录下创建新的 `.vue` 文件：

```vue
<template>
  <base-template :background="background" :active="active" :disabled="disabled">
    <!-- 自定义模板内容 -->
    <div class="your-template-layout">
      <!-- 布局元素 -->
    </div>
  </base-template>
</template>

<script setup>
import { defineProps } from 'vue';
import BaseTemplate from './BaseTemplate.vue';

const props = defineProps({
  active: Boolean,
  disabled: Boolean,
  // 其他需要的属性
});

// 设置模板背景
const background = '自定义背景值';
</script>

<style scoped>
/* 自定义样式 */
</style>
```

### 2. 在 index.js 中注册模板

打开 `src/components/templates/index.js`，添加新模板：

```js
import YourNewTemplate from './YourNewTemplate.vue';

// 在 templateList 数组中添加新模板
export const templateList = [
  // 现有模板...
  { 
    id: 'your-template-id', 
    label: '你的模板名称', 
    component: YourNewTemplate,
    requiresImage: true, // 根据需要设置
    description: '模板描述',
    isNew: true // 标记为新模板
  }
];

// 同时更新默认导出
export default {
  // 现有模板...
  YourNewTemplate
};
```

## 模板组件约定

- 每个模板组件应该从 BaseTemplate 继承
- 模板应该通过 props 接收 `active` 和 `disabled` 属性
- 模板应该定义一个合适的背景值
- 模板内容应该使用相对大小（如百分比、flex 等）
- 如果模板需要特殊的功能或数据，可通过 extraProps 在模板定义中指定

## 在 NoteCard 中使用模板

模板系统主要通过 layout 属性来选择不同的布局。在 NoteCard 组件中根据 layout 值应用不同的样式和结构。

## 扩展提示

要创建更复杂的模板，您可以：

1. 添加更多的自定义属性到模板定义中
2. 为模板提供配置选项（如颜色变体、边框样式等）
3. 使用嵌套组件来创建复杂布局
4. 添加动画或交互效果

## 示例

参考现有的模板组件，如 `PaperTemplate.vue`、`ImageTopTemplate.vue` 等作为创建新模板的示例。 