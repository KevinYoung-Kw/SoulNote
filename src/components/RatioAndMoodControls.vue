<template>
  <div class="ratio-mood-controls-container">
    <!-- 布局比例控制组件 -->
    <LayoutControl
      v-if="showRatioControl"
      :layout="layout"
      :image-ratio="imageRatio"
      :text-ratio="textRatio"
      :split-direction="splitDirection"
      @update:image-ratio="val => $emit('update:imageRatio', val)"
      @update:text-ratio="val => $emit('update:textRatio', val)"
      @update:split-direction="val => $emit('update:splitDirection', val)"
    />
    
    <!-- 表情位置控制组件 - 始终显示，不受showEmoji影响 -->
    <MoodPositionControl
      v-if="showMoodControl"
      :model-value="moodPosition"
      :show-emoji="showEmoji"
      @update:model-value="handleMoodPositionUpdate"
      @update:show-emoji="val => $emit('update:showEmoji', val)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import LayoutControl from './LayoutControl.vue';
import MoodPositionControl from './MoodPositionControl.vue';

const props = defineProps({
  layout: {
    type: String,
    required: true
  },
  imageRatio: {
    type: Number,
    default: 0.5
  },
  textRatio: {
    type: Number,
    default: 0.5
  },
  splitDirection: {
    type: String,
    default: 'horizontal'
  },
  moodPosition: {
    type: String,
    default: 'default'
  },
  showEmoji: {
    type: Boolean,
    default: true
  },
  showMoodControl: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits([
  'update:imageRatio',
  'update:textRatio',
  'update:splitDirection',
  'update:moodPosition',
  'update:showEmoji'
]);

// 是否显示占比控制
const showRatioControl = computed(() => {
  return props.layout === 'image-top' || props.layout === 'image-bottom' || props.layout === 'split';
});

// 处理表情位置更新并添加日志
function handleMoodPositionUpdate(newPosition) {
  console.log('RatioAndMoodControls - 更新表情位置:', newPosition);
  emit('update:moodPosition', newPosition);
}
</script>

<style scoped>
.ratio-mood-controls-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}
</style> 