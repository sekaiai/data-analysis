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
    routes: [{
            path: '/',
            name: 'analyze',
            component: require('@/pages/home/index.vue').default
        },
        {
            path: '/history',
            name: 'history',
            component: require('@/pages/history/index.vue').default
        },
        {
            path: '/history/add',
            name: 'history.add',
            component: require('@/pages/history/add.vue').default
        },
        {
            path: '/package',
            name: 'package',
            component: require('@/pages/package/index.vue').default
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
})