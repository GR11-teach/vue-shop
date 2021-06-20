import Vue from 'vue'
import App from './App.vue'
import router from './router'

import './plugins/element.js'
// 导入全局样式
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

import axios from 'axios'

axios.defaults.baseURL = 'http://118.31.171.210:8801/api/private/v1/'
    // axios.defaults.baseURL = `http://127.0.0.1:8888/api/private/v1/`

axios.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token');
    return config
})
Vue.prototype.$http = axios;

Vue.config.productionTip = false

new Vue({
    render: h => h(App),
    router,
}).$mount('#app')