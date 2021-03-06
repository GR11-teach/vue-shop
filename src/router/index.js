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
const Rights = () =>
    import ('../components/power/Rights')
const Roles = () =>
    import ('../components/power/Roles')
const Cate = () =>
    import ('../components/goods/Cate')
const Params = () =>
    import ('../components/goods/Params')
const GoodsList = () =>
    import ('../components/goods/List')
const Add = () =>
    import ('../components/goods/Add')
const Order = () =>
    import ('../components/order/Order')
const Report = () =>
    import ('../components/report/Report')
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
            },
            {
                path: '/rights',
                component: Rights
            },
            {
                path: '/roles',
                component: Roles
            },
            {
                path: '/categories',
                component: Cate
            },
            {
                path: '/params',
                component: Params
            },
            {
                path: '/goods',
                component: GoodsList
            },
            {
                path: '/goods/add',
                component: Add
            },
            {
                path: '/orders',
                component: Order
            },
            {
                path: '/reports',
                component: Report
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
    // ????????????????????????????????????URL???????????????
router.beforeEach((to, form, next) => {
        if (to.path === '/login') return next();
        const token = window.sessionStorage.getItem('token');
        if (!token) return next('/login');
        next();
    })
    /** ???????????????????????????????????? ,????????????????????????push??????*/
const routerPush = router.push;
router.push = path => {
    // ???????????????????????????????????????????????????
    if (router.currentRoute.fullPath.includes(path)) return;
    return routerPush.call(router, path);
}

export default router