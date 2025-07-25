<script setup>
import AppHeader from '@/components/AppHeader.vue';
import { useCartStore } from '@/store/cartStore'; 
import { onMounted } from 'vue'; 

const cartStore = useCartStore(); 

onMounted(async () => {
  if (!cartStore.cartId) {
    try {
      await cartStore.fetchUserCart();
      console.log('Cart ID fetched:', cartStore.cartId);
    } catch (error) {
      console.error('Error fetching cart ID on app mount:', error);
    }
  } else {
    console.log('Cart ID already exists:', cartStore.cartId);
  }
});
</script>

<template>
  <AppHeader />
  <div class="container-fluid app-main-content">
    <router-view />
  </div>
</template>

<style>
/* Import Poppins font for global use */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* Giữ lại font và màu chữ cho toàn bộ app */
  font-family: 'Poppins', sans-serif;
  color: #333;
  /* Xóa các thuộc tính background ở đây nếu bạn chỉ muốn nó cho app-main-content */
  /* background-size: cover; */
  /* background-position: center center; */
  /* background-repeat: no-repeat; */
  /* background-attachment: fixed; */
}

.app-main-content {
  flex-grow: 1;
  padding-top: 20px;
  padding-bottom: 20px;
  position: relative;
  z-index: 1;
  
  /* --- THÊM CÁC THUỘC TÍNH BACKGROUND VÀO ĐÂY --- */
  background-image: url('/path/to/your/background-image.jpg'); /* Thay đổi đường dẫn này */
  background-size: cover; /* Đảm bảo ảnh bao phủ toàn bộ phần nội dung */
  background-position: center center; /* Căn giữa ảnh */
  background-repeat: no-repeat; /* Không lặp lại ảnh */
  background-attachment: scroll; /* Mặc định là scroll, ảnh sẽ cuộn cùng nội dung */
  /* Nếu bạn muốn ảnh nền của phần nội dung cố định khi cuộn, hãy dùng 'fixed' */
  /* background-attachment: fixed; */

  /* Tùy chọn: Thêm màu nền dự phòng hoặc làm mờ */
  background-color: #f0f0f0; /* Màu nền dự phòng */
  /* backdrop-filter: blur(5px); */ /* Ví dụ làm mờ nền (cần prefix cho trình duyệt cũ) */
}

.page {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
}
</style>