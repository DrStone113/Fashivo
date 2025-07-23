<template>
  <div class="register-page-wrapper">
    <div class="register-container">
      <h2 class="main-title">Đăng Ký Tài Khoản Mới</h2>

      <form @submit.prevent="handleRegister" class="register-forms-layout">
        <!-- Phần 1: Thông tin tài khoản và Avatar -->
        <div class="register-section card-section">
          <h3 class="section-title">Thông Tin Tài Khoản</h3>
          <div class="form-group">
            <label for="name" class="form-label">Họ và Tên</label>
            <input type="text" class="form-control" id="name" v-model="name" required autocomplete="name" placeholder="Nhập họ và tên của bạn">
          </div>
          <div class="form-group">
            <label for="email" class="form-label">Địa chỉ Email</label>
            <input type="email" class="form-control" id="email" v-model="email" required autocomplete="email" placeholder="Nhập địa chỉ email của bạn">
          </div>
          <div class="form-group">
            <label for="password" class="form-label">Mật khẩu</label>
            <input type="password" class="form-control" id="password" v-model="password" required autocomplete="new-password" placeholder="Tạo mật khẩu">
          </div>
          <div class="form-group">
            <label for="passwordConfirm" class="form-label">Xác nhận mật khẩu</label>
            <input type="password" class="form-control" id="passwordConfirm" v-model="passwordConfirm" required autocomplete="new-password" placeholder="Xác nhận mật khẩu">
          </div>
          <div class="form-group avatar-upload-group">
            <label for="avatar" class="form-label">Ảnh đại diện (Tùy chọn)</label>
            <input type="file" class="form-control file-input" id="avatar" @change="handleAvatarUpload" accept="image/*">
            <small class="help-text">Chọn một file ảnh để làm avatar.</small>
          </div>
        </div>

        <!-- Phần 2: Thông tin liên hệ -->
        <div class="register-section card-section">
          <h3 class="section-title">Thông Tin Liên Hệ</h3>
          <div class="form-group">
            <label for="phone" class="form-label">Số điện thoại (Tùy chọn)</label>
            <input type="tel" class="form-control" id="phone" v-model="phone" autocomplete="tel" placeholder="Nhập số điện thoại">
          </div>
          <div class="form-group">
            <label for="address" class="form-label">Địa chỉ (Tùy chọn)</label>
            <textarea class="form-control" id="address" v-model="address" autocomplete="street-address" placeholder="Nhập địa chỉ của bạn"></textarea>
          </div>
        </div>

        <!-- Vùng thông báo lỗi và nút đăng ký (toàn chiều rộng) -->
        <div class="full-width-controls">
          <div v-if="errorMessage" class="status-message error-message">{{ errorMessage }}</div>
          <button type="submit" class="action-button submit-button" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <i v-else class="fas fa-user-plus"></i> Đăng Ký
          </button>
        </div>
      </form>

      <p class="mt-4 text-center already-account-text">
        Đã có tài khoản? <router-link to="/login" class="login-link">Đăng nhập tại đây</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';

const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const phone = ref('');
const address = ref('');
const avatarFile = ref(null);
const errorMessage = ref('');
const isLoading = ref(false);
const router = useRouter();
const authStore = useAuthStore();

const handleAvatarUpload = (event) => {
  avatarFile.value = event.target.files[0];
};

const handleRegister = async () => {
  errorMessage.value = '';
  isLoading.value = true;

  if (password.value !== passwordConfirm.value) {
    errorMessage.value = 'Mật khẩu không khớp.';
    isLoading.value = false;
    return;
  }

  try {
    const userData = {
      name: name.value,
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value, // Backend schema sẽ validate này
      phone: phone.value,
      address: address.value,
      avatarFile: avatarFile.value, 
      role: 'user' // Mặc định là user
    };
    await authStore.signup(userData);
    alert('Đăng ký thành công! Vui lòng đăng nhập.'); // Thay bằng modal thông báo
    router.push('/login');
  } catch (error) {
    errorMessage.value = error.message || 'Đăng ký thất bại. Vui lòng thử lại.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Tổng thể trang */
.register-page-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center; /* Căn giữa theo chiều dọc */
  padding: 40px 20px;
  background: linear-gradient(135deg, #f0f4f8, #e0e7ee); /* Nền gradient nhẹ */
  font-family: 'Inter', sans-serif;
}

.register-container {
  max-width: 1000px; /* Chiều rộng tổng thể lớn hơn để chứa 2 cột */
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
  width: 100%; /* Đảm bảo thông báo chiếm toàn bộ chiều rộng */
}
.error-message {
  background-color: #ffebee;
  color: #D32F2F;
}

/* Layout 2 cột cho form */
.register-forms-layout {
  display: flex;
  gap: 30px; /* Khoảng cách giữa các cột */
  flex-wrap: wrap; /* Cho phép xuống dòng trên mobile */
  justify-content: center; /* Căn giữa các cột nếu có ít hơn 2 cột */
}

.register-section { /* Style chung cho cả 2 phần form */
  flex: 1; /* Mỗi phần chiếm 1 phần bằng nhau */
  min-width: 400px; /* Đảm bảo đủ rộng trên desktop */
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

input[type="text"],
input[type="email"],
input[type="tel"],
input[type="password"],
textarea {
  width: calc(100% - 28px); 
  padding: 14px; 
  border: 1px solid #e0e0e0; 
  border-radius: 10px; 
  font-size: 1.05rem;
  transition: border-color 0.3s, box-shadow 0.3s;
  background-color: #fcfcfc; 
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="tel"]:focus,
input[type="password"]:focus,
textarea:focus {
  border-color: #6C63FF; 
  outline: none;
  box-shadow: 0 0 0 4px rgba(108, 99, 255, 0.2); 
}

textarea {
  resize: vertical;
  min-height: 100px; 
}

.help-text {
  font-size: 0.9rem;
  color: #777;
  margin-top: 5px;
  display: block;
}

/* Avatar Upload */
.avatar-upload-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start; 
}

.file-input {
  width: 100%;
  padding: 12px 0;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background-color: #f8f8f8;
  cursor: pointer;
}

.file-input::file-selector-button {
  background-color: #6C63FF; 
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-right: 15px;
  transition: background-color 0.2s, transform 0.2s;
  font-weight: 600;
}

.file-input::file-selector-button:hover {
  background-color: #5A54D9; 
  transform: translateY(-1px);
}

/* Vùng điều khiển toàn chiều rộng (error message và button) */
.full-width-controls {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px; /* Khoảng cách giữa thông báo lỗi và nút */
  margin-top: 20px; /* Khoảng cách từ các section phía trên */
}

/* Nút hành động */
.action-button {
  width: 100%; /* Nút chiếm toàn bộ chiều rộng của vùng điều khiển */
  max-width: 400px; /* Giới hạn chiều rộng tối đa cho nút */
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
  background-image: linear-gradient(to right, #28a745, #218838); /* Gradient xanh lá đậm hơn */
  color: white;
}

.submit-button:hover:not(:disabled) {
  background-image: linear-gradient(to right, #218838, #1e7e34);
}

/* Văn bản "Đã có tài khoản?" */
.already-account-text {
  font-size: 1.05em;
  color: #555;
  margin-top: 30px;
}

.login-link {
  color: #6C63FF; /* Màu tím/xanh cho link */
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.login-link:hover {
  color: #5A54D9;
  text-decoration: underline;
}

/* Spinner */
.spinner-border {
  margin-right: 10px;
}

/* Responsive */
@media (max-width: 992px) { /* Cho tablet */
  .register-container {
    padding: 30px;
  }
  .main-title {
    font-size: 2em;
    margin-bottom: 30px;
  }
  .register-forms-layout {
    flex-direction: column; /* Chuyển thành 1 cột trên màn hình nhỏ */
    gap: 25px;
  }
  .register-section {
    min-width: unset;
    width: 100%;
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
  input[type="text"],
  input[type="email"],
  input[type="tel"],
  input[type="password"],
  textarea {
    font-size: 1em;
    padding: 12px;
  }
  .action-button {
    font-size: 1.1em;
    padding: 15px 20px;
    max-width: 100%; /* Cho phép nút chiếm toàn bộ chiều rộng */
  }
  .full-width-controls {
    margin-top: 0; /* Giảm khoảng cách trên mobile */
  }
}

@media (max-width: 576px) { /* Cho mobile nhỏ hơn */
  .register-container {
    padding: 20px;
  }
  .main-title {
    font-size: 1.8em;
    margin-bottom: 25px;
  }
  .section-title {
    font-size: 1.4em;
    margin-bottom: 20px;
  }
  .already-account-text {
    font-size: 0.95em;
  }
  .action-button {
    font-size: 1em;
    padding: 12px 15px;
  }
}
</style>
