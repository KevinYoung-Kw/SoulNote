import PaperTemplate from './PaperTemplate.vue';
import ImageTopTemplate from './ImageTopTemplate.vue';
import ImageBottomTemplate from './ImageBottomTemplate.vue';
import ImageBgTemplate from './ImageBgTemplate.vue';
import SplitTemplate from './SplitTemplate.vue';
import CardTemplate from './CardTemplate.vue';

// 模板列表配置
export const templateList = [
  { 
    id: 'paper', 
    label: '纸条', 
    component: PaperTemplate,
    requiresImage: false,
    description: '简约纸条风格，适合纯文字内容'
  },
  { 
    id: 'image-top', 
    label: '上图下文', 
    component: ImageTopTemplate,
    requiresImage: true,
    description: '图片在上方，文字在下方的布局'
  },
  { 
    id: 'image-bottom', 
    label: '下图上文', 
    component: ImageBottomTemplate,
    requiresImage: true,
    description: '文字在上方，图片在下方的布局'
  },
  { 
    id: 'image-bg', 
    label: '图片背景', 
    component: ImageBgTemplate,
    requiresImage: true,
    description: '图片作为背景，文字覆盖在上方'
  },
  { 
    id: 'split', 
    label: '分屏布局', 
    component: SplitTemplate,
    requiresImage: true,
    description: '左右分屏布局，图文并排展示',
    isNew: true
  },
  { 
    id: 'card', 
    label: '卡片风格', 
    component: CardTemplate,
    requiresImage: false,
    description: '带有头部和底部的卡片式设计',
    isNew: true
  }
];

// 获取所有模板
export function getAllTemplates() {
  return templateList;
}

// 通过ID获取模板
export function getTemplateById(id) {
  return templateList.find(template => template.id === id);
}

// 获取不需要图片的模板
export function getTemplatesWithoutImage() {
  return templateList.filter(template => !template.requiresImage);
}

// 获取需要图片的模板
export function getTemplatesWithImage() {
  return templateList.filter(template => template.requiresImage);
}

// 获取新模板
export function getNewTemplates() {
  return templateList.filter(template => template.isNew);
}

export default {
  PaperTemplate,
  ImageTopTemplate,
  ImageBottomTemplate,
  ImageBgTemplate,
  SplitTemplate,
  CardTemplate
}; 