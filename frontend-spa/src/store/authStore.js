// src/store/authStore.js
import { defineStore } from 'pinia';
import authService from '@/services/auth.service';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    token: null, // Pinia Persistedstate sẽ tự động lấy từ localStorage nếu có
    authLoading: false,
    authError: null,
  }),
  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isUser: (state) => state.user?.role === 'user',
    // Bạn có thể thêm getter để lấy role hiện tại
    currentUserRole: (state) => state.user?.role,
  },
  actions: {
    async login(email, password) {
      this.authLoading = true;
      this.authError = null;
      try {
        const data = await authService.login(email, password);
        this.user = data.user;
        this.token = data.token;
        this.isAuthenticated = true;
        // Pinia Persistedstate sẽ tự động lưu token và user vào localStorage
        // localStorage.setItem('jwtToken', data.token); // Không cần dòng này nữa nếu dùng persist
        // localStorage.setItem('user', JSON.stringify(data.user)); // Không cần dòng này nữa nếu dùng persist
        router.push('/');
        return data;
      } catch (error) {
        this.authError = error.message || 'Đăng nhập thất bại.';
        this.isAuthenticated = false;
        this.user = null; // Đảm bảo user được reset khi lỗi
        this.token = null; // Đảm bảo token được reset khi lỗi
        // localStorage.removeItem('jwtToken'); // Không cần dòng này nữa nếu dùng persist
        // localStorage.removeItem('user'); // Không cần dòng này nữa nếu dùng persist
        throw error;
      } finally {
        this.authLoading = false;
      }
    },

    async signup(userData) {
      this.authLoading = true;
      this.authError = null;
      try {
        let dataToSend;
        if (userData.avatarFile) {
          dataToSend = new FormData();
          for (const key in userData) {
            if (key === 'avatarFile') {
                dataToSend.append('avatar', userData[key]);
            } else if (userData[key] !== null) { 
              dataToSend.append(key, userData[key]);
            }
          }
        } else {
          dataToSend = userData;
        }
        
        const data = await authService.signup(dataToSend);
        return data;
      } catch (error) {
        this.authError = error.message || 'Đăng ký thất bại.';
        throw error;
      } finally {
        this.authLoading = false;
      }
    },

    async logout() {
      this.authLoading = true;
      this.authError = null;
      try {
        await authService.logout(); // Gọi API logout backend nếu có
      } catch (error) {
        console.error('Error calling backend logout API:', error);
        // Vẫn tiếp tục xóa trạng thái frontend ngay cả khi backend logout lỗi
      } finally {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        // Pinia Persistedstate sẽ tự động xóa khỏi localStorage
        // localStorage.removeItem('jwtToken'); // Không cần dòng này nữa
        // localStorage.removeItem('user'); // Không cần dòng này nữa
        this.authLoading = false;
        router.push('/login');
      }
    },

    // Hàm này sẽ được gọi khi ứng dụng khởi động để khôi phục trạng thái
    async initializeAuth() {
      // Pinia Persistedstate đã khôi phục token và user (nếu có) vào state
      // Chúng ta chỉ cần xác thực lại token với backend nếu nó tồn tại
      if (this.token && !this.user) { // Nếu có token nhưng user chưa được load (ví dụ: lần đầu tải app sau khi cài persist)
        try {
          const userProfile = await authService.getMe(); // Gọi API để lấy thông tin user
          this.user = userProfile;
          this.isAuthenticated = true;
          console.log('Auth state initialized with user profile from API:', this.user);
        } catch (error) {
          console.error('Failed to re-authenticate or fetch user profile on app load:', error);
          // Nếu token không hợp lệ hoặc hết hạn, tự động logout
          this.logout();
        }
      } else if (this.token && this.user) { // Nếu cả token và user đều có (từ persisted state)
        this.isAuthenticated = true;
        console.log('Auth state restored from persisted state:', this.user);
      } else {
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        console.log('No auth token found, user is not authenticated.');
      }
    },

    // Các hàm updateProfile, updatePassword không cần thay đổi logic persist
    async updateProfile(updateData) {
      this.authLoading = true;
      this.authError = null;
      try {
        const updatedUser = await authService.updateMe(updateData);
        this.user = updatedUser;
        return updatedUser;
      } catch (error) {
        this.authError = error.message || 'Cập nhật hồ sơ thất bại.';
        throw error;
      } finally {
        this.authLoading = false;
      }
    },

    async updatePassword(currentPassword, newPassword, newPasswordConfirm) {
      this.authLoading = true;
      this.authError = null;
      try {
        const updatedUser = await authService.updateMyPassword(currentPassword, newPassword, newPasswordConfirm);
        this.user = updatedUser;
        return updatedUser;
      } catch (error) {
        this.authError = error.message || 'Cập nhật mật khẩu thất bại.';
        throw error;
      } finally {
        this.authLoading = false;
      }
    },
  },
  // THÊM DÒNG NÀY ĐỂ KÍCH HOẠT LƯU TRỮ TRẠNG THÁI
  persist: true, 
});
