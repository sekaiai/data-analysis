import Goods from './pages/menu/Goods.vue';
import DetailList from './pages/menu/DetailList.vue';

const menu = [{
        icon: 'cube',
        title: '数据分析',
        path: '/goods',
        component: Goods,
    },
    {
        icon: 'clipboard',
        title: '历史数据',
        path: '/detailList',
        component: DetailList,
    },
];
export default menu;