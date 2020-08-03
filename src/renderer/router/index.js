/*import Home from './pages/Home';
import menus from './menu';

const childrenRoutes = [];

for (const menu of menus) {
  childrenRoutes.push(menu);
}

childrenRoutes.push({
  path: '*',
  redirect: menus[ 0 ].path,
});

const routes = [
  {
    path: '/',
    component: Home,
    children: childrenRoutes,
  },
];

export default routes;
*/

import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'analyze',
            component: require('@/pages/home/index.vue').default
        },
        {
            path: '/bill/list',
            name: 'bill.list',
            component: require('@/pages/home/list.vue').default
        },
        {
            path: '/accept',
            name: 'accept',
            component: require('@/pages/accept/index.vue').default
        },
        {
            path: '/accept/add',
            name: 'accept.add',
            component: require('@/pages/accept/add.vue').default
        },
        {
            path: '/package',
            name: 'package',
            component: require('@/pages/package/index.vue').default
        },
        {
            path: '/relate',
            name: 'relate',
            component: require('@/pages/relate/index.vue').default
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
})
