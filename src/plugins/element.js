import Vue from 'vue'

import { Message } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import {
    Button,
    Form,
    FormItem,
    Input,
    Container,
    Header,
    Aside,
    Main,
    Menu,
    Submenu,
    MenuItem,
    MenuItemGroup,
    Breadcrumb,
    BreadcrumbItem,
    Card,
    Select,
    Option,
    Table,
    TableColumn,
    Switch,
    Tooltip,
    Pagination,
    Alert,
    Dialog,
    Row,
    Col,
    MessageBox,
    Tag,
    Tree
} from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(MenuItemGroup)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Select)
Vue.use(Option)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Alert)
Vue.use(Dialog)
Vue.use(Row)
Vue.use(Col)
Vue.use(MessageBox)
Vue.use(Tag)
Vue.use(Tree)



Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm