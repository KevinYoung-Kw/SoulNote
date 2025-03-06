import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/main.css';
import './styles/dark-mode.css'; // 添加暗黑模式专用样式

const app = createApp(App);

app.use(router);
app.mount('#app');
