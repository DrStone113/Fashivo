<template>
  <div class="profile-page-wrapper">
    <div class="profile-container">
      <h2 class="main-title">Thông Tin Hồ Sơ Của Bạn</h2>

      <div v-if="!authStore.isAuthenticated" class="status-message warning-message">
        <i class="fas fa-exclamation-triangle"></i> Vui lòng <router-link to="/login" class="alert-link">đăng nhập</router-link> để xem và cập nhật hồ sơ của bạn.
      </div>

      <div v-else class="profile-forms-layout">
        <div class="profile-section card-section">
          <h3 class="section-title">Cập Nhật Thông Tin Cá Nhân</h3>
          <form @submit.prevent="updateProfile">
            <div class="form-group">
              <label for="name" class="form-label">Họ và Tên</label>
              <input type="text" class="form-control" id="name" v-model="userForm.name" required placeholder="Nhập họ và tên của bạn">
            </div>
            <div class="form-group">
              <label for="email" class="form-label">Địa chỉ Email</label>
              <input type="email" class="form-control" id="email" v-model="userForm.email" required placeholder="Nhập địa chỉ email mới">
              </div>
            <div class="form-group">
              <label for="phone" class="form-label">Số điện thoại</label>
              <input type="tel" class="form-control" id="phone" v-model="userForm.phone" placeholder="Nhập số điện thoại">
            </div>
            <div class="form-group">
              <label for="address" class="form-label">Địa chỉ</label>
              <textarea class="form-control" id="address" v-model="userForm.address" placeholder="Nhập địa chỉ của bạn"></textarea>
            </div>
            <div class="form-group avatar-upload-group">
              <label for="avatar" class="form-label">Ảnh đại diện</label>
              <input type="file" class="form-control file-input" id="avatar" @change="handleAvatarUpload" accept="image/*">
              <div v-if="userForm.avatar_url" class="current-avatar-preview mt-2">
                Ảnh hiện tại: 
                <img :src="userForm.avatar_url" alt="Avatar" class="img-thumbnail-styled" onerror="this.onerror=null;this.src='/public/image/products/BLANK.jpg.png';">
              </div>
              <small class="help-text">Chọn một file ảnh mới để thay đổi avatar. Ảnh sẽ được nén tự động.</small>
            </div>

            <div v-if="errorMessage" class="status-message error-message">{{ errorMessage }}</div>
            <div v-if="successMessage" class="status-message success-message">{{ successMessage }}</div>

            <button type="submit" class="action-button submit-button" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <i v-else class="fas fa-user-edit"></i> Cập Nhật Hồ Sơ
            </button>
          </form>
        </div>

        <div class="profile-section card-section">
          <h3 class="section-title">Thay Đổi Mật Khẩu</h3>
          <form @submit.prevent="changePassword">
            <div class="form-group">
              <label for="currentPassword" class="form-label">Mật khẩu hiện tại</label>
              <input type="password" class="form-control" id="currentPassword" v-model="passwordForm.currentPassword" required placeholder="Nhập mật khẩu hiện tại">
            </div>
            <div class="form-group">
              <label for="newPassword" class="form-label">Mật khẩu mới</label>
              <input type="password" class="form-control" id="newPassword" v-model="passwordForm.newPassword" required placeholder="Nhập mật khẩu mới">
            </div>
            <div class="form-group">
              <label for="newPasswordConfirm" class="form-label">Xác nhận mật khẩu mới</label>
              <input type="password" class="form-control" id="newPasswordConfirm" v-model="passwordForm.newPasswordConfirm" required placeholder="Xác nhận mật khẩu mới">
            </div>

            <div v-if="passwordErrorMessage" class="status-message error-message">{{ passwordErrorMessage }}</div>
            <div v-if="passwordSuccessMessage" class="status-message success-message">{{ passwordSuccessMessage }}</div>

            <button type="submit" class="action-button change-password-button" :disabled="passwordLoading">
              <span v-if="passwordLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <i v-else class="fas fa-key"></i> Thay Đổi Mật Khẩu
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { useAuthStore } from '@/store/authStore';

const authStore = useAuthStore();

const userForm = reactive({
  name: '',
  email: '', // Giữ lại email để bind vào input
  address: '',
  phone: '',
  avatar_url: '',
  avatarFile: null,
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
});

const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const passwordLoading = ref(false);
const passwordErrorMessage = ref('');
const passwordSuccessMessage = ref('');

onMounted(() => {
  if (authStore.isAuthenticated && authStore.user) {
    Object.assign(userForm, authStore.user);
  }
});

watch(() => authStore.user, (newUser) => {
  if (newUser) {
    Object.assign(userForm, newUser);
  }
}, { immediate: true });

// Hàm nén ảnh trước khi upload (giữ nguyên)
const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const elem = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        ctx.canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, {
            type: 'image/jpeg', 
            lastModified: Date.now()
          }));
        }, 'image/jpeg', quality);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (file) {
    errorMessage.value = ''; 
    try {
      const compressedFile = await compressImage(file, 400, 400, 0.7); 
      userForm.avatarFile = compressedFile;
      userForm.avatar_url = URL.createObjectURL(compressedFile); 
    } catch (error) {
      errorMessage.value = 'Lỗi khi nén ảnh: ' + error.message;
      console.error('Image compression error:', error);
      userForm.avatarFile = null;
      userForm.avatar_url = authStore.user?.avatar_url || ''; 
    }
  } else {
    userForm.avatarFile = null;
    userForm.avatar_url = authStore.user?.avatar_url || ''; 
  }
};

const updateProfile = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  isLoading.value = true;
  try {
    let dataToSend;

    if (userForm.avatarFile) {
      dataToSend = new FormData();
      dataToSend.append('name', userForm.name);
      dataToSend.append('email', userForm.email); // THÊM EMAIL VÀO FORM DATA
      dataToSend.append('address', userForm.address);
      dataToSend.append('phone', userForm.phone);
      dataToSend.append('avatar', userForm.avatarFile); 
    } else {
      dataToSend = {
        name: userForm.name,
        email: userForm.email, // THÊM EMAIL VÀO OBJECT
        address: userForm.address,
        phone: userForm.phone,
      };
      if (userForm.avatar_url === '/public/image/products/BLANK.jpg.png' && authStore.user?.avatar_url !== '/public/image/products/BLANK.jpg.png') {
        dataToSend.avatar_url = null;
      } else if (userForm.avatar_url && userForm.avatar_url.startsWith('blob:')) {
        // Do nothing, this is a temporary URL for preview
      } else if (authStore.user?.avatar_url && !userForm.avatar_url) {
        dataToSend.avatar_url = null;
      } else if (userForm.avatar_url) {
        dataToSend.avatar_url = userForm.avatar_url; 
      }
    }
    
    await authStore.updateProfile(dataToSend);
    successMessage.value = 'Hồ sơ đã được cập nhật thành công!';
    userForm.avatarFile = null; 
  } catch (error) {
    errorMessage.value = error.message || 'Cập nhật hồ sơ thất bại.';
  } finally {
    isLoading.value = false;
  }
};

const changePassword = async () => {
  passwordErrorMessage.value = '';
  passwordSuccessMessage.value = '';
  passwordLoading.value = true;

  if (passwordForm.newPassword !== passwordForm.newPasswordConfirm) {
    passwordErrorMessage.value = 'Mật khẩu mới không khớp.';
    passwordLoading.value = false;
    return;
  }
  if (passwordForm.newPassword.length < 6) { 
    passwordErrorMessage.value = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
    passwordLoading.value = false;
    return;
  }

  try {
    await authStore.updatePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword,
      passwordForm.newPasswordConfirm
    );
    passwordSuccessMessage.value = 'Mật khẩu đã được thay đổi thành công!';
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.newPasswordConfirm = '';
  } catch (error) {
    passwordErrorMessage.value = error.message || 'Thay đổi mật khẩu thất bại.';
  } finally {
    passwordLoading.value = false;
  }
};
</script>

<style scoped>
/* Tổng thể trang */
.profile-page-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Căn trên */
  padding: 40px 20px;
  background: linear-gradient(135deg, #f0f4f8, #e0e7ee); /* Nền gradient nhẹ */
  font-family: 'Inter', sans-serif;
}

.profile-container {
  max-width: 1000px; /* Chiều rộng tổng thể */
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
.warning-message {
  background-color: #fff3e0;
  color: #f57c00;
}
.error-message {
  background-color: #ffebee;
  color: #D32F2F;
}
.success-message {
  background-color: #e8f5f9; /* Màu xanh nhạt hơn */
  color: #2196F3; /* Màu xanh dương */
}
.alert-link {
  color: inherit;
  font-weight: 600;
  text-decoration: underline;
}

/* Layout 2 cột cho form */
.profile-forms-layout {
  display: flex;
  gap: 30px;
  flex-wrap: wrap; /* Cho phép xuống dòng trên mobile */
}

.profile-section { /* Style chung cho cả 2 phần form */
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
  margin-bottom: 25px; /* Tăng khoảng cách giữa các trường */
  width: 100%; 
}

label.form-label {
  display: block;
  margin-bottom: 10px; /* Tăng khoảng cách giữa label và input */
  font-weight: 600;
  color: #333;
  font-size: 1.05em;
}

input[type="text"],
input[type="email"],
input[type="tel"],
input[type="password"],
textarea {
  width: calc(100% - 28px); /* Điều chỉnh padding */
  padding: 14px; /* Tăng padding */
  border: 1px solid #e0e0e0; /* Border mềm hơn */
  border-radius: 10px; /* Bo góc nhiều hơn */
  font-size: 1.05rem;
  transition: border-color 0.3s, box-shadow 0.3s;
  background-color: #fcfcfc; /* Nền input hơi ngà */
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="tel"]:focus,
input[type="password"]:focus,
textarea:focus {
  border-color: #6C63FF; /* Màu border khi focus */
  outline: none;
  box-shadow: 0 0 0 4px rgba(108, 99, 255, 0.2); /* Bóng đổ khi focus */
}

/* KHÔNG CÒN DISABLED CHO EMAIL */
/* input[type="email"]:disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
  color: #777;
} */

textarea {
  resize: vertical;
  min-height: 120px; 
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
  align-items: flex-start; /* Căn trái nội dung */
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
  background-color: #6C63FF; /* Màu tím/xanh cho nút chọn file */
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

.current-avatar-preview {
  margin-top: 15px;
  font-size: 1em;
  color: #555;
  display: flex;
  align-items: center;
  gap: 10px;
}

.img-thumbnail-styled {
  width: 80px; /* Kích thước thumbnail */
  height: 80px;
  object-fit: cover;
  border-radius: 50%; /* Ảnh tròn */
  border: 2px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
  background-image: linear-gradient(to right, #4CAF50, #66BB6A); /* Gradient xanh lá */
  color: white;
}

.submit-button:hover:not(:disabled) {
  background-image: linear-gradient(to right, #388E3C, #4CAF50);
}

.change-password-button {
  background-image: linear-gradient(to right, #FFC107, #FFD54F); /* Gradient vàng cam */
  color: #333; /* Màu chữ đen hoặc đậm */
}

.change-password-button:hover:not(:disabled) {
  background-image: linear-gradient(to right, #FFA000, #FFC107);
}

/* Spinner */
.spinner-border {
  margin-right: 10px;
}

/* Responsive */
@media (max-width: 992px) { /* Cho tablet */
  .profile-container {
    padding: 30px;
  }
  .main-title {
    font-size: 2em;
    margin-bottom: 30px;
  }
  .profile-forms-layout {
    flex-direction: column;
    gap: 25px;
  }
  .profile-section {
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
  }
}

@media (max-width: 576px) { /* Cho mobile nhỏ hơn */
  .profile-container {
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
  .current-avatar-preview {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  .img-thumbnail-styled {
    width: 60px;
    height: 60px;
  }
  .action-button {
    font-size: 1em;
    padding: 12px 15px;
  }
}
</style>