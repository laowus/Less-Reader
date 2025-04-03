import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue'
import Read from '../views/Read.vue'


const routes = [
    { //默认
        path: '/',
        component: Home
    }, {
        path: '/read/:id',
        component: Read
    }
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})