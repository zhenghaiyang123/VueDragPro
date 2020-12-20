import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);
export default new Router({
    routes: [{
            // 项目启动时的默认页面
            path: '/',
            redirect: 'login'
        },
        {
            path: '/',
            component: () => import('../components/common/Home.vue'),
            meta: {
                title: '自述文件'
            },
            children: [

           
                {
                    // 拖拽列表组件
                    path: '/drag',
                    component: () => import('../components/page/DragList.vue'),
                    meta: {
                        title: '拖拽布局'
                    }
                },
                {
                    // 拖拽列表组件
                    path: '/layoutpre',
                    component: () => import('../components/page/LayoutPre.vue'),
                    meta: {
                        title: '布局预览'
                    }
                },
               
              


            ]
        },
        {
            path: '/login',
            component: () => import('../components/page/Login.vue'),
            meta: {
                title: '登录'
            }
        },

    ]
});