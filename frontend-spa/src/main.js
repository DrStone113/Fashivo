// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Import router
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

// Import Bootstrap CSS và JS
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap'; 

// Import Font Awesome
import '@fortawesome/fontawesome-free/css/all.css'; // Đảm bảo Font Awesome được import

// Import Vue Query
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';

// Import authStore để fetch user ngay khi app khởi động
import { useAuthStore } from './store/authStore';

// Tạo một QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Dữ liệu được coi là stale sau 5 phút
      refetchOnWindowFocus: false, // Không tự động refetch khi tab được focus lại
    },
  },
});

const app = createApp(App);

// Khởi tạo Pinia và sử dụng plugin persistedstate
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

app.use(router);

// Sử dụng Vue Query Plugin và truyền QueryClient vào
app.use(VueQueryPlugin, {
  queryClient,
});

// Fetch user data ngay khi ứng dụng được mount
// Điều này đảm bảo trạng thái xác thực được tải trước khi các component render
router.isReady().then(() => {
  const authStore = useAuthStore();
  // ĐÃ SỬA: Gọi initializeAuth() thay vì getProfile()
  authStore.initializeAuth().catch(error => { 
    console.error("Failed to initialize auth state on startup:", error);
    // Xử lý lỗi nếu cần, ví dụ: chuyển hướng về trang đăng nhập
    // router.push('/login'); 
  });
  app.mount('#app');
});
