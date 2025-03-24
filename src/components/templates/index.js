import PaperTemplate from './PaperTemplate.vue';
import ImageTopTemplate from './ImageTopTemplate.vue';
import ImageBottomTemplate from './ImageBottomTemplate.vue';
import ImageBgTemplate from './ImageBgTemplate.vue';
import SplitTemplate from './SplitTemplate.vue';
import CardTemplate from './CardTemplate.vue';
import CalendarH5Template from './h5/CalendarH5Template.vue';
import SimpleCardH5Template from './h5/SimpleCardH5Template.vue';
import EmotionalH5Template from './h5/EmotionalH5Template.vue';

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

// H5模板列表
export const h5TemplateList = [
  {
    id: 'calendar-h5',
    label: '日历H5',
    component: CalendarH5Template,
    requiresImage: false,
    description: '日历风格的H5模板',
    isNew: true,
    isH5: true,
    previewContent: '春天的第一天到来时，我会回到这儿来，在你的窗下吹口哨。一年很快就会过去。'
  },
  {
    id: 'simple-card-h5',
    label: '简约卡片',
    component: SimpleCardH5Template,
    requiresImage: false,
    description: '简约卡片风格的H5模板',
    isNew: true,
    isH5: true
  },
  {
    id: 'emotional-h5',
    label: '情感渐变',
    component: EmotionalH5Template,
    requiresImage: false,
    description: '情感渐变背景H5模板，适合表达深情厚意',
    isNew: true,
    isH5: true,
    previewContent: '在这个世界上，总有那么一个人，愿意用温暖的手，握住你颤抖的心。'
  }
];

// 获取所有模板
export function getAllTemplates() {
  return templateList;
}

// 获取所有H5模板
export function getAllH5Templates() {
  return h5TemplateList;
}

// 获取所有模板(包括H5)
export function getAllTemplatesCombined() {
  return [...templateList, ...h5TemplateList];
}

// 通过ID获取模板
export function getTemplateById(id) {
  return templateList.find(template => template.id === id) || 
         h5TemplateList.find(template => template.id === id);
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
  return [...templateList, ...h5TemplateList].filter(template => template.isNew);
}

// 获取H5模板
export function getH5Templates() {
  return h5TemplateList;
}

export default {
  PaperTemplate,
  ImageTopTemplate,
  ImageBottomTemplate,
  ImageBgTemplate,
  SplitTemplate,
  CardTemplate,
  CalendarH5Template,
  SimpleCardH5Template,
  EmotionalH5Template
}; 