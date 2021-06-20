import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () =>
    import ('../components/Login')
const Home = () =>
    import ('../components/Home')
const Welcome = () =>
    import ('../components/Welcome')
const Users = () =>
    import ('../components/user/Users')
Vue.use(VueRouter)

const routes = [{
        path: '',
        redirect: '/login'
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/home',
        component: Home,
        redirect: '/welcome',
        children: [{
                path: '/welcome',
                component: Welcome
            },
            {
                path: '/users',
                component: Users
            }
        ]
    },
    {
        path: '/welcome',
        component: Welcome
    }
]

const router = new VueRouter({
        routes,
        mode: 'history',
    })
    // 路由守卫禁止未登录用户在URL中实现跳转
router.beforeEach((to, form, next) => {
        if (to.path === '/login') return next();
        const token = window.sessionStorage.getItem('token');
        if (!token) return next('/login');
        next();
    })
    /** 解决跳转重复路由报错问题 ,改变路由原型上的push方法*/
const routerPush = router.push;
router.push = path => {
    // 判断下当前路由是否就是要跳转的路由
    if (router.currentRoute.fullPath.includes(path)) return;
    return routerPush.call(router, path);
}

export default router