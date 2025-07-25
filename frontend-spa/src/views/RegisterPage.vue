<template>
  <div class="register-page-wrapper-styled">
    <div class="register-container-styled">
      <h2 class="main-title-styled">Đăng Ký Tài Khoản Mới</h2>

      <form @submit.prevent="handleRegister" class="register-forms-layout-styled">
        <!-- Phần 1: Thông tin tài khoản và Avatar -->
        <div class="register-section-styled card-section-styled">
          <h3 class="section-title-styled">Thông Tin Tài Khoản</h3>
          <div class="form-group-styled">
            <label for="name" class="form-label-styled">Họ và Tên</label>
            <input 
              type="text" 
              class="form-control-styled" 
              id="name" 
              v-model="name" 
              required 
              autocomplete="name" 
              placeholder="Nhập họ và tên của bạn"
            >
          </div>
          <div class="form-group-styled">
            <label for="email" class="form-label-styled">Địa chỉ Email</label>
            <input 
              type="email" 
              class="form-control-styled" 
              id="email" 
              v-model="email" 
              required 
              autocomplete="email" 
              placeholder="Nhập địa chỉ email của bạn"
            >
          </div>
          <div class="form-group-styled">
            <label for="password" class="form-label-styled">Mật khẩu</label>
            <input 
              type="password" 
              class="form-control-styled" 
              id="password" 
              v-model="password" 
              required 
              autocomplete="new-password" 
              placeholder="Tạo mật khẩu"
            >
          </div>
          <div class="form-group-styled">
            <label for="passwordConfirm" class="form-label-styled">Xác nhận mật khẩu</label>
            <input 
              type="password" 
              class="form-control-styled" 
              id="passwordConfirm" 
              v-model="passwordConfirm" 
              required 
              autocomplete="new-password" 
              placeholder="Xác nhận mật khẩu"
            >
          </div>
          <div class="form-group-styled avatar-upload-group-styled">
            <label for="avatar" class="form-label-styled">Ảnh đại diện (Tùy chọn)</label>
            <input type="file" class="form-control-styled file-input-styled" id="avatar" @change="handleAvatarUpload" accept="image/*">
            <small class="help-text-styled">Chọn một file ảnh để làm avatar.</small>
          </div>
        </div>

        <!-- Phần 2: Thông tin liên hệ -->
        <div class="register-section-styled card-section-styled">
          <h3 class="section-title-styled">Thông Tin Liên Hệ</h3>
          <div class="form-group-styled">
            <label for="phone" class="form-label-styled">Số điện thoại (Tùy chọn)</label>
            <input 
              type="tel" 
              class="form-control-styled" 
              id="phone" 
              v-model="phone" 
              autocomplete="tel" 
              placeholder="Nhập số điện thoại"
            >
          </div>
          <div class="form-group-styled">
            <label for="address" class="form-label-styled">Địa chỉ (Tùy chọn)</label>
            <textarea 
              class="form-control-styled form-textarea-styled" 
              id="address" 
              v-model="address" 
              autocomplete="street-address" 
              placeholder="Nhập địa chỉ của bạn"
            ></textarea>
          </div>
        </div>

        <!-- Vùng thông báo lỗi và nút đăng ký (toàn chiều rộng) -->
        <div class="full-width-controls-styled">
          <div v-if="errorMessage" class="status-message-styled error-message-styled">{{ errorMessage }}</div>
          <button type="submit" class="action-button-styled submit-button-styled" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <i v-else class="fas fa-user-plus me-2"></i> Đăng Ký
          </button>
        </div>
      </form>

      <p class="mt-4 text-center already-account-text-styled">
        Đã có tài khoản? <router-link to="/login" class="login-link-styled">Đăng nhập tại đây</router-link>
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
  if (password.value.length < 6) { // Thêm validation cho độ dài mật khẩu
    errorMessage.value = 'Mật khẩu phải có ít nhất 6 ký tự.';
    isLoading.value = false;
    return;
  }

  try {
    const userData = {
      name: name.value,
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value, 
      phone: phone.value,
      address: address.value,
      avatarFile: avatarFile.value, 
      role: 'user' 
    };
    await authStore.signup(userData);
    alert('Đăng ký thành công! Vui lòng đăng nhập.'); 
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
.register-page-wrapper-styled {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center; /* Căn giữa theo chiều dọc */
  padding: 40px 20px;
  background: linear-gradient(135deg, #f0f4f8, #e0e7ee); /* Nền gradient nhẹ */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Modern Font */
}

.register-container-styled {
  max-width: 1000px; /* Chiều rộng tổng thể lớn hơn để chứa 2 cột */
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
  width: 100%; /* Đảm bảo thông báo chiếm toàn bộ chiều rộng */
}
.error-message-styled {
  background-color: #ffe8e8; /* Lighter red */
  color: #e53935; /* Darker red */
}

/* Layout 2 cột cho form */
.register-forms-layout-styled {
  display: flex;
  gap: 40px; /* Khoảng cách giữa các cột */
  flex-wrap: wrap; /* Cho phép xuống dòng trên mobile */
  justify-content: center; /* Căn giữa các cột nếu có ít hơn 2 cột */
}

.register-section-styled { /* Style chung cho cả 2 phần form */
  flex: 1; 
  min-width: 450px; /* Đảm bảo đủ rộng trên desktop */
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

input[type="text"],
input[type="email"],
input[type="tel"],
input[type="password"],
.form-textarea-styled {
  width: calc(100% - 2px); /* Adjust for border */
  padding: 15px; /* Tăng padding */
  border: 1px solid #e0e0e0; /* Border mềm hơn */
  border-radius: 10px; /* Bo góc nhiều hơn */
  font-size: 1.05rem;
  transition: border-color 0.3s, box-shadow 0.3s, background-color 0.3s;
  background-color: #fcfcfc; /* Nền input hơi ngà */
  color: #333;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="tel"]:focus,
input[type="password"]:focus,
.form-textarea-styled:focus {
  border-color: #a855f7; /* Purple border when focus */
  outline: none;
  box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.2); /* Shadow when focus */
  background-color: white;
}

.form-textarea-styled {
  resize: vertical;
  min-height: 120px; /* Taller textarea */
}

.help-text-styled {
  font-size: 0.9rem;
  color: #777;
  margin-top: 5px;
  display: block;
}

/* Avatar Upload */
.avatar-upload-group-styled {
  display: flex;
  flex-direction: column;
  align-items: flex-start; 
}

.file-input-styled {
  width: 100%;
  padding: 12px 0;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background-color: #f8f8f8;
  cursor: pointer;
  color: #555;
  font-size: 0.95rem;
}

.file-input-styled::file-selector-button {
  background-color: #6a11cb; /* Purple button */
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-right: 15px;
  transition: background-color 0.2s, transform 0.2s;
  font-weight: 600;
}

.file-input-styled::file-selector-button:hover {
  background-color: #530ea6; 
  transform: translateY(-2px);
}

/* Vùng điều khiển toàn chiều rộng (error message và button) */
.full-width-controls-styled {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px; /* Khoảng cách giữa thông báo lỗi và nút */
  margin-top: 20px; /* Khoảng cách từ các section phía trên */
}

/* Nút hành động */
.action-button-styled {
  width: 100%; /* Nút chiếm toàn bộ chiều rộng của vùng điều khiển */
  max-width: 400px; /* Giới hạn chiều rộng tối đa cho nút */
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
  background-image: linear-gradient(to right, #28a745, #218838); /* Green Gradient */
  color: white;
}

.submit-button-styled:hover:not(:disabled) {
  background-image: linear-gradient(to right, #218838, #1e7e34);
}

/* Văn bản "Đã có tài khoản?" */
.already-account-text-styled {
  font-size: 1.05em;
  color: #555;
  margin-top: 30px;
}

.login-link-styled {
  color: #a855f7; /* Purple for links */
  font-weight: 700; /* Bolder links */
  text-decoration: none;
  transition: color 0.2s;
}

.login-link-styled:hover {
  color: #ec4899; /* Pink on hover */
  text-decoration: underline;
}

/* Spinner */
.spinner-border {
  margin-right: 10px;
}

/* Responsive */
@media (max-width: 992px) { /* Cho tablet */
  .register-container-styled {
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
  .register-forms-layout-styled {
    flex-direction: column; /* Chuyển thành 1 cột trên màn hình nhỏ */
    gap: 30px;
  }
  .register-section-styled {
    min-width: unset;
    width: 100%;
    padding: 30px;
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
  input[type="text"],
  input[type="email"],
  input[type="tel"],
  input[type="password"],
  .form-textarea-styled {
    font-size: 1em;
    padding: 12px;
  }
  .action-button-styled {
    font-size: 1.1em;
    padding: 15px 20px;
    max-width: 100%; /* Cho phép nút chiếm toàn bộ chiều rộng */
  }
  .full-width-controls-styled {
    margin-top: 0; /* Giảm khoảng cách trên mobile */
  }
  .status-message-styled {
    font-size: 1em;
    padding: 15px 20px;
  }
}

@media (max-width: 576px) { /* Cho mobile nhỏ hơn */
  .register-container-styled {
    padding: 20px;
    border-radius: 15px;
  }
  .main-title-styled {
    font-size: 1.8em;
    margin-bottom: 25px;
  }
  .main-title-styled::after {
    width: 60px;
    height: 3px;
  }
  .section-title-styled {
    font-size: 1.4em;
    margin-bottom: 20px;
  }
  .already-account-text-styled {
    font-size: 0.95em;
  }
  .action-button-styled {
    font-size: 1em;
    padding: 12px 15px;
  }
}
</style>
