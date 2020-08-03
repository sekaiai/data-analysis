import Vue from 'vue'
// import VueRouter from 'vue-router';
// import iView from 'iview';
// import routes from './route';
import store from './store'

import router from './router'

import filters from './utils/util'
import db from './utils/db'
import logger from './utils/logger'
import 'iview/dist/styles/iview.css'
import './assets/less/common.less'
import App from './App.vue'
// 升级脚本
import './utils/upgrade'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

// Vue.use(VueRouter);

// Vue.use(iView);

Object.keys(filters).forEach(k => Vue.filter(k, filters[k]))

// const router = new VueRouter({
//     routes,
// });

if (process.env.NODE_ENV == 'development') {
    Vue.config.devtools = true
} else {
    Vue.config.devtools = false
}

Vue.prototype.$db = db

Vue.prototype.$logger = logger

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

Vue.mixin({
    data() {
        return {
            tableHeight: 0
        }
    },
    mounted() {
        // console.log('mounted')
        // 设置表格的高度
        const dom = this.$refs.tableBox
        if (dom) {
            setTimeout(() => {
                this.tableHeight = dom.clientHeight
            }, 400)
        }
    }
})

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
})
