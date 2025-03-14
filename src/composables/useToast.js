import { ref } from 'vue';

const toasts = ref([]);

export function useToast() {
  const showToast = ({ type = 'info', message, duration = 3000 }) => {
    const id = Date.now();
    const toast = {
      id,
      type,
      message,
      show: true
    };
    
    toasts.value.push(toast);
    
    setTimeout(() => {
      const index = toasts.value.findIndex(t => t.id === id);
      if (index > -1) {
        toasts.value.splice(index, 1);
      }
    }, duration);
  };
  
  return {
    toasts,
    showToast
  };
} 