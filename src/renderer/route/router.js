import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue'
import Manage from '../views/Manage.vue'
import Read from '../views/Read.vue'

const routes = [
    { //默认
        path: '/',
        component: Manage,
        children: [{
            path: '/',
            component: Home
        }]
    }, {
        path: '/read/:key',
        component: Read
    }
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})