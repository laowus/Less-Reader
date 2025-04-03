// main.js 或者 main.ts
import { createApp } from 'vue'
import App from './App.vue'
import "./assets/styles/reset.css";
import "./assets/styles/global.css";
import "./assets/styles/iconfont/iconfont.css";

//Router
import { router } from './route/router';
//LazyLoad
import VueLazyLoad from 'vue3-lazyload';
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css';

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
//全局异常处理器
app.config.errorHandler = (err, vm, info) => {
    // 处理错误
    console.log(err)
}

app.use(router)
    .use(VueLazyLoad, {
        loading: 'default_cover.png',
        error: 'default_cover.png'
    }).use(ElementPlus)
    .mount('#app')