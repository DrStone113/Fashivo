<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">
        <img src="../assets/a3rkgo5r.png" alt="Logo" height="40" class="d-inline-block align-text-top">
        Clothing Shop
      </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/menu">Products</router-link>
          </li>
          <!-- Có thể thêm link đến trang lịch sử đơn hàng nếu có -->
          <!-- <li class="nav-item">
            <router-link class="nav-link" to="/orders-history">My Orders</router-link>
          </li> -->
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link" to="/info">
              <i class="fas fa-user"></i> Account
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/cart"> <!-- Đã đổi link sang /cart -->
              <i class="fas fa-shopping-cart"></i> Cart
              <span v-if="totalItems > 0" class="badge bg-danger ms-1">{{ totalItems }}</span>
            </router-link>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
              aria-expanded="false">
              <span v-if="authStore.isAuthenticated">{{ authStore.user?.name || 'User' }}</span>
              <span v-else>Guest</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
              <li v-if="!authStore.isAuthenticated">
                <router-link class="dropdown-item" to="/login">Login</router-link>
              </li>
              <li v-if="!authStore.isAuthenticated">
                <router-link class="dropdown-item" to="/register">Register</router-link>
              </li>
              <li v-if="authStore.isAuthenticated">
                <a class="dropdown-item" href="#" @click.prevent="handleLogout">Logout</a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

const totalItems = computed(() => cartStore.totalItems);

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login'); // Chuyển hướng về trang đăng nhập sau khi logout
  } catch (error) {
    console.error('Logout failed:', error);
    alert('Logout failed. Please try again.');
  }
};
</script>

<style scoped>
/* Add any specific styles for the header here */
</style>