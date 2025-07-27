// C:\DVWEB\mergre\ct313hm02-project-DrStone113\frontend-spa\src\router\index.js

import { createWebHistory, createRouter } from 'vue-router';
import MainPage from '@/views/MainPage.vue';
import MenuPage from '@/views/MenuPage.vue';
import InformationPage from '@/views/InformationPage.vue';
import CartPage from '@/views/CartPage.vue';
import LoginPage from '@/views/LoginPage.vue';
import RegisterPage from '@/views/RegisterPage.vue';
import EditProductPage from '@/views/admin/EditProductPage.vue';
import ProductDetailPage from '@/views/ProductDetailPage.vue'; // <--- Import component mới
import AddProductPage from '@/views/admin/AddProductPage.vue';

import { useAuthStore } from '@/store/authStore';

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
    path: '/admin/products/:id/edit', // Đường dẫn rõ ràng cho trang chỉnh sửa admin
    name: 'AdminEditProduct', // Tên route độc đáo cho việc chỉnh sửa
    component: EditProductPage, // Component EditProductPage bạn đã tạo
    props: true // Quan trọng: cho phép truyền ID vào component
    // meta: { requiresAuth: true, requiredRole: 'admin' }, // Kích hoạt bảo vệ route nếu có Auth Store
  },
  {
    path: '/admin/products/add', // URL cho trang thêm sản phẩm
    name: 'AddProduct', // Tên route để điều hướng đến
    component: AddProductPage // Component AddProductPage
    // meta: { requiresAuth: true, requiredRole: 'admin' }, // Bảo vệ route này nếu cần
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFoundPage',
    component: () => import('@/views/NotFound.vue')
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // If coming back to a page, restore the previous scroll position
    if (savedPosition) {
      return savedPosition;
    }

    // If navigating to a different route, scroll to the top
    if (to.path !== from.path) {
      return { top: 0, left: 0 };
    }

    // Otherwise, maintain the current scroll position (e.g., for query changes)
    return {};
  }
});
export default router;
