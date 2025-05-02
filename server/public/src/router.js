import { createRouter, createWebHistory } from 'vue-router';
import Login from './components/Login.vue';
import Dashboard from './components/Dashboard.vue';
import Applications from './components/Applications.vue';

const routes = [
    { path: '/login', component: Login },
    { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/applications', component: Applications, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/login' } 
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;