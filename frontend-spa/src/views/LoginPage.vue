<template>
  <div class="login-page-wrapper">
    <div class="login-container">
      <h2 class="main-title">Đăng Nhập</h2>

      <div class="login-form-section card-section">
        <h3 class="section-title">Chào Mừng Trở Lại!</h3>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email" class="form-label">Địa chỉ Email</label>
            <input type="email" class="form-control" id="email" v-model="email" required autocomplete="email" placeholder="Nhập địa chỉ email của bạn">
          </div>
          <div class="form-group">
            <label for="password" class="form-label">Mật khẩu</label>
            <input type="password" class="form-control" id="password" v-model="password" required autocomplete="current-password" placeholder="Nhập mật khẩu của bạn">
          </div>
          
          <div v-if="errorMessage" class="status-message error-message">{{ errorMessage }}</div>
          
          <button type="submit" class="action-button submit-button" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <i v-else class="fas fa-sign-in-alt"></i> Đăng Nhập
          </button>
        </form>
        <p class="mt-4 text-center dont-have-account-text">
          Chưa có tài khoản? <router-link to="/register" class="register-link">Đăng ký tại đây</router-link>
        </p>
        <p class="text-center forgot-password-text">
          <router-link to="/forgot-password" class="forgot-password-link">Quên mật khẩu?</router-link>
        </p>
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
    errorMessage.value = error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Tổng thể trang */
.login-page-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center; /* Căn giữa theo chiều dọc */
  padding: 40px 20px;
  background: linear-gradient(135deg, #f0f4f8, #e0e7ee); /* Nền gradient nhẹ */
  font-family: 'Inter', sans-serif;
}

.login-container {
  max-width: 500px; /* Chiều rộng tổng thể */
  width: 100%;
  background: #ffffff;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15); /* Bóng đổ mạnh hơn */
  padding: 40px;
  box-sizing: border-box;
}

.main-title {
  text-align: center;
  color: #333;
  margin-bottom: 40px;
  font-size: 2.5em;
  font-weight: 700;
  position: relative;
  padding-bottom: 15px;
}

.main-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(to right, #6C63FF, #A044FF); /* Gradient tím */
  border-radius: 2px;
}

/* Thông báo trạng thái chung */
.status-message {
  padding: 15px 20px;
  border-radius: 10px;
  margin-bottom: 25px;
  font-size: 1.05em;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.error-message {
  background-color: #ffebee;
  color: #D32F2F;
}

/* Form Section */
.login-form-section { 
  background: #fdfdfd;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  padding: 30px;
  box-sizing: border-box;
}

.section-title {
  color: #333;
  margin-top: 0;
  margin-bottom: 30px;
  font-size: 1.8em;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 12px;
  text-align: left;
}

/* Form Group và Input Fields */
.form-group {
  margin-bottom: 25px; 
  width: 100%; 
}

label.form-label {
  display: block;
  margin-bottom: 10px; 
  font-weight: 600;
  color: #333;
  font-size: 1.05em;
}

input[type="email"],
input[type="password"] {
  width: calc(100% - 28px); 
  padding: 14px; 
  border: 1px solid #e0e0e0; 
  border-radius: 10px; 
  font-size: 1.05rem;
  transition: border-color 0.3s, box-shadow 0.3s;
  background-color: #fcfcfc; 
}

input[type="email"]:focus,
input[type="password"]:focus {
  border-color: #6C63FF; 
  outline: none;
  box-shadow: 0 0 0 4px rgba(108, 99, 255, 0.2); 
}

/* Nút hành động */
.action-button {
  width: 100%;
  padding: 18px 25px;
  border: none;
  border-radius: 12px;
  font-size: 1.2em;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.action-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
  opacity: 0.7;
}

.submit-button {
  background-image: linear-gradient(to right, #007bff, #0056b3); /* Gradient xanh dương */
  color: white;
}

.submit-button:hover:not(:disabled) {
  background-image: linear-gradient(to right, #0056b3, #004085);
}

/* Văn bản "Chưa có tài khoản?" */
.dont-have-account-text,
.forgot-password-text {
  font-size: 1.05em;
  color: #555;
  margin-top: 20px;
}

.register-link,
.forgot-password-link {
  color: #6C63FF; /* Màu tím/xanh cho link */
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.register-link:hover,
.forgot-password-link:hover {
  color: #5A54D9;
  text-decoration: underline;
}

/* Spinner */
.spinner-border {
  margin-right: 10px;
}

/* Responsive */
@media (max-width: 768px) { /* Cho tablet và mobile */
  .login-container {
    padding: 30px;
  }
  .main-title {
    font-size: 2em;
    margin-bottom: 30px;
  }
  .login-form-section {
    padding: 25px;
  }
  .section-title {
    font-size: 1.6em;
    margin-bottom: 25px;
  }
  .form-group {
    margin-bottom: 20px;
  }
  label.form-label {
    font-size: 1em;
    margin-bottom: 8px;
  }
  input[type="email"],
  input[type="password"] {
    font-size: 1em;
    padding: 12px;
  }
  .action-button {
    font-size: 1.1em;
    padding: 15px 20px;
  }
}

@media (max-width: 480px) { /* Cho mobile nhỏ hơn */
  .login-container {
    padding: 20px;
  }
  .main-title {
    font-size: 1.8em;
    margin-bottom: 25px;
  }
  .dont-have-account-text,
  .forgot-password-text {
    font-size: 0.95em;
  }
  .action-button {
    font-size: 1em;
    padding: 12px 15px;
  }
}
</style>
