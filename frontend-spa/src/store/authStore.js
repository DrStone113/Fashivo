// src/store/authStore.js
import { defineStore } from 'pinia';
import authService from '@/services/auth.service'; // Đảm bảo import đúng
import router from '@/router'; // Import router nếu bạn dùng để redirect

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    token: localStorage.getItem('jwtToken') || null,
    authLoading: false,
    authError: null,
  }),
  actions: {
    async login(email, password) {
      this.authLoading = true;
      this.authError = null;
      try {
        const data = await authService.login(email, password);
        this.user = data.user;
        this.token = data.token;
        this.isAuthenticated = true;
        localStorage.setItem('jwtToken', data.token);
        // console.log('Login successful, user:', this.user);
        // console.log('Login successful, token:', this.token);
        return data; // Trả về dữ liệu nếu cần ở component
      } catch (error) {
        this.authError = error.message || 'Đăng nhập thất bại.';
        this.isAuthenticated = false;
        localStorage.removeItem('jwtToken');
        throw error; // Re-throw để component có thể bắt lỗi
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
          // Nếu có file avatar, tạo FormData
          dataToSend = new FormData();
          for (const key in userData) {
            // Loại bỏ avatarFile khỏi FormData nếu không muốn gửi lại dưới tên này
            // Tên trường 'avatar' đã được xử lý bởi input file và @change
            if (key === 'avatarFile') {
                dataToSend.append('avatar', userData[key]); // Append file với tên 'avatar'
            } else if (userData[key] !== null) { 
              dataToSend.append(key, userData[key]);
            }
          }
        } else {
          // Nếu không có file avatar, gửi JSON bình thường
          dataToSend = userData;
        }
        
        const data = await authService.signup(dataToSend); // Gửi dataToSend
        // Không tự động đăng nhập sau khi đăng ký, chỉ thông báo thành công
        // và chuyển hướng đến trang login
        // this.user = data.user;
        // this.token = data.token;
        // this.isAuthenticated = true;
        // localStorage.setItem('jwtToken', data.token);
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
        await authService.logout();
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        localStorage.removeItem('jwtToken');
        // console.log('Logout successful');
        // router.push('/login'); // Chuyển hướng sau khi đăng xuất
      } catch (error) {
        this.authError = error.message || 'Đăng xuất thất bại.';
        throw error;
      } finally {
        this.authLoading = false;
      }
    },

    async getProfile() {
      if (!this.token) {
        this.isAuthenticated = false;
        this.user = null;
        return null;
      }
      try {
        const user = await authService.getMe();
        this.user = user;
        this.isAuthenticated = true;
        return user;
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        localStorage.removeItem('jwtToken');
        throw error;
      }
    },

    async updateProfile(updateData) {
      this.authLoading = true;
      this.authError = null;
      try {
        const updatedUser = await authService.updateMe(updateData);
        this.user = updatedUser; // Cập nhật user trong store
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
        this.user = updatedUser; // Cập nhật user trong store
        return updatedUser;
      } catch (error) {
        this.authError = error.message || 'Cập nhật mật khẩu thất bại.';
        throw error;
      } finally {
        this.authLoading = false;
      }
    },

    // Hàm để kiểm tra trạng thái xác thực khi ứng dụng khởi động
    async checkAuth() {
      if (this.token) {
        try {
          await this.getProfile();
        } catch (error) {
          // Token không hợp lệ hoặc hết hạn, xóa token
          this.logout();
        }
      }
    },
  },
});