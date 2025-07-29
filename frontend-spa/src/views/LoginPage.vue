<template>
  <div class="login-page-wrapper-styled">
    <div class="login-container-styled">
      <h2 class="main-title-styled">Login</h2>

      <div class="login-form-section-styled card-section-styled">
        <h3 class="section-title-styled">Welcome Back!</h3>
        <form @submit.prevent="handleLogin">
          <div class="form-group-styled">
            <label for="email" class="form-label-styled">Email Address</label>
            <input 
              type="email" 
              class="form-control-styled" 
              id="email" 
              v-model="email" 
              required 
              autocomplete="email" 
              placeholder="Enter your email address"
            >
          </div>
          <div class="form-group-styled">
            <label for="password" class="form-label-styled">Password</label>
            <input 
              type="password" 
              class="form-control-styled" 
              id="password" 
              v-model="password" 
              required 
              autocomplete="current-password" 
              placeholder="Enter your password"
            >
          </div>
          
          <div v-if="errorMessage" class="status-message-styled error-message-styled">{{ errorMessage }}</div>
          
          <button type="submit" class="action-button-styled submit-button-styled" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <i v-else class="fas fa-sign-in-alt me-2"></i> Login
          </button>
        </form>
        <p class="mt-4 text-center dont-have-account-text-styled">
          Don't have an account? <router-link to="/register" class="register-link-styled">Register here</router-link>
        </p>
        <p class="text-center forgot-password-text-styled">
          <router-link to="/forgot-password" class="forgot-password-link-styled">Forgot password?</router-link>
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
    
    const redirectPath = route.query.redirect || '/';
    router.push(redirectPath); 
  } catch (error) {
    errorMessage.value = error.message || 'Login failed. Please check your credentials.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Tổng thể trang */
.login-page-wrapper-styled {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center; /* Căn giữa theo chiều dọc */
  padding: 40px 20px;
  background: linear-gradient(135deg, #f0f4f8, #e0e7ee); /* Nền gradient nhẹ */
  font-family: 'Poppins', sans-serif; /* Poppins font */
}

.login-container-styled {
  max-width: 500px; /* Chiều rộng tổng thể */
  width: 100%;
  background: #ffffff;
  border-radius: 20px; /* More rounded */
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2); /* Stronger shadow */
  padding: 40px;
  box-sizing: border-box;
}

.main-title-styled {
  text-align: center;
  color: #333;
  margin-bottom: 40px;
  font-size: 2.5em;
  font-weight: 800; /* Bolder */
  position: relative;
  padding-bottom: 15px;
}

.main-title-styled::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px; /* Wider underline */
  height: 5px; /* Thicker underline */
  background: linear-gradient(to right, #a855f7, #ec4899); /* Vibrant Purple to Pink Gradient */
  border-radius: 2px;
}

/* Thông báo trạng thái chung */
.status-message-styled {
  padding: 18px 25px; /* More padding */
  border-radius: 12px; /* More rounded */
  margin-bottom: 25px;
  font-size: 1.05em;
  font-weight: 600; /* Bolder */
  display: flex;
  align-items: center;
  gap: 12px; /* More space */
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}
.error-message-styled {
  background-color: #ffe8e8; /* Lighter red */
  color: #e53935; /* Darker red */
}

/* Form Section */
.login-form-section-styled { 
  background: #fdfdfd;
  border-radius: 18px; /* More rounded */
  box-shadow: 0 8px 25px rgba(0,0,0,0.1); /* Deeper shadow */
  padding: 35px; /* More padding */
  box-sizing: border-box;
}

.section-title-styled {
  color: #333;
  margin-top: 0;
  margin-bottom: 30px;
  font-size: 1.8em;
  font-weight: 700; /* Bolder */
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 15px; /* More padding */
  text-align: left;
}

/* Form Group và Input Fields */
.form-group-styled {
  margin-bottom: 28px; /* Tăng khoảng cách giữa các trường */
  width: 100%; 
}

label.form-label-styled {
  display: block;
  margin-bottom: 12px; /* Tăng khoảng cách giữa label và input */
  font-weight: 600;
  color: #333;
  font-size: 1.05em;
}

input[type="email"],
input[type="password"] {
  width: calc(100% - 2px); /* Adjust for border */
  padding: 15px; /* Tăng padding */
  border: 1px solid #e0e0e0; /* Border mềm hơn */
  border-radius: 10px; /* Bo góc nhiều hơn */
  font-size: 1.05rem;
  transition: border-color 0.3s, box-shadow 0.3s, background-color 0.3s;
  background-color: #fcfcfc; /* Nền input hơi ngà */
  color: #333;
}

input[type="email"]:focus,
input[type="password"]:focus {
  border-color: #a855f7; /* Purple border when focus */
  outline: none;
  box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.2); /* Shadow when focus */
  background-color: white;
}

/* Nút hành động */
.action-button-styled {
  width: 100%;
  padding: 18px 25px;
  border: none;
  border-radius: 15px; /* More rounded */
  font-size: 1.2em;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.25); /* Stronger shadow */
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.action-button-styled:hover:not(:disabled) {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.4);
}

.action-button-styled:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
  opacity: 0.7;
}

.submit-button-styled {
  background-image: linear-gradient(to right, #6a11cb, #2575fc); /* Blue-Purple Gradient for Login */
  color: white;
}

.submit-button-styled:hover:not(:disabled) {
  background-image: linear-gradient(to right, #2575fc, #6a11cb); /* Reverse gradient on hover */
}

/* Văn bản "Chưa có tài khoản?" */
.dont-have-account-text-styled,
.forgot-password-text-styled {
  font-size: 1.05em;
  color: #555;
  margin-top: 20px;
}

.register-link-styled,
.forgot-password-link-styled {
  color: #a855f7; /* Purple for links */
  font-weight: 700; /* Bolder links */
  text-decoration: none;
  transition: color 0.2s;
}

.register-link-styled:hover,
.forgot-password-link-styled:hover {
  color: #ec4899; /* Pink on hover */
  text-decoration: underline;
}

/* Spinner */
.spinner-border {
  margin-right: 10px;
}

/* Responsive */
@media (max-width: 768px) { /* Cho tablet và mobile */
  .login-container-styled {
    padding: 30px;
    border-radius: 15px;
  }
  .main-title-styled {
    font-size: 2em;
    margin-bottom: 30px;
  }
  .main-title-styled::after {
    width: 80px;
    height: 4px;
  }
  .login-form-section-styled {
    padding: 30px;
    border-radius: 15px;
  }
  .section-title-styled {
    font-size: 1.6em;
    margin-bottom: 25px;
  }
  .form-group-styled {
    margin-bottom: 20px;
  }
  label.form-label-styled {
    font-size: 1em;
    margin-bottom: 8px;
  }
  input[type="email"],
  input[type="password"] {
    font-size: 1em;
    padding: 12px;
  }
  .action-button-styled {
    font-size: 1.1em;
    padding: 15px 20px;
  }
  .status-message-styled {
    font-size: 1em;
    padding: 15px 20px;
  }
}

@media (max-width: 480px) { /* Cho mobile nhỏ hơn */
  .login-container-styled {
    padding: 20px;
  }
  .main-title-styled {
    font-size: 1.8em;
    margin-bottom: 25px;
  }
  .main-title-styled::after {
    width: 60px;
    height: 3px;
  }
  .dont-have-account-text-styled,
  .forgot-password-text-styled {
    font-size: 0.95em;
  }
  .action-button-styled {
    font-size: 1em;
    padding: 12px 15px;
  }
}
</style>
