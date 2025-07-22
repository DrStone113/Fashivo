<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header text-center">
            <h3>Login</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="email" class="form-label">Email address</label>
                <input type="email" class="form-control" id="email" v-model="email" required autocomplete="email">
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" v-model="password" required autocomplete="current-password">
              </div>
              <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
              <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
                <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Login
              </button>
            </form>
            <p class="mt-3 text-center">
              Don't have an account? <router-link to="/register">Register here</router-link>
            </p>
            <p class="text-center">
              <router-link to="/forgot-password">Forgot password?</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/authStore';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const handleLogin = async () => {
  errorMessage.value = '';
  isLoading.value = true;
  try {
    await authStore.login(email.value, password.value);
    
    // Kiểm tra xem có redirect parameter không
    const redirectPath = route.query.redirect || '/';
    router.push(redirectPath); // Chuyển hướng về trang trước đó hoặc trang chủ
  } catch (error) {
    errorMessage.value = error.message || 'Login failed. Please check your credentials.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Add any specific styles for the login page here */
</style>
