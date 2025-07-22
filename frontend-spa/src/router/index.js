// C:\DVWEB\mergre\ct313hm02-project-DrStone113\frontend-spa\src\router\index.js

import { createWebHistory, createRouter } from 'vue-router';
import MainPage from '@/views/MainPage.vue';
import MenuPage from '@/views/MenuPage.vue';
import InformationPage from '@/views/InformationPage.vue';
import CartPage from '@/views/CartPage.vue';
import LoginPage from '@/views/LoginPage.vue';
import RegisterPage from '@/views/RegisterPage.vue';
import ProductDetailPage from '@/views/ProductDetailPage.vue'; // <--- Import component mới

const routes = [
  {
    path: '/',
    name: 'MainPage',
    component: MainPage
  },
  {
    path: '/menu',
    name: 'MenuPage',
    component: MenuPage
  },
  {
    path: '/info',
    name: 'InformationPage',
    component: InformationPage
  },
  {
    path: '/cart',
    name: 'CartPage',
    component: CartPage
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'RegisterPage',
    component: RegisterPage
  },
  {
    // <--- THÊM ROUTE NÀY VÀO ĐÂY ---
    path: '/product/:id', // Đường dẫn động với tham số ID
    name: 'ProductDetail', // Tên của route
    component: ProductDetailPage, // Component sẽ được render
    props: true // Quan trọng: cho phép truyền params thành props vào component
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFoundPage',
    component: () => import('@/views/NotFound.vue')
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});
export default router;