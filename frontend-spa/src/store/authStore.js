// src/store/authStore.js
import { defineStore } from 'pinia';
import authService from '../services/auth.service';
import router from '../router'; // Import router để chuyển hướng

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
  }),
  actions: {
    async login(email, password) {
      try {
        const data = await authService.login(email, password);
        this.user = data.user;
        this.token = data.token;
        this.isAuthenticated = true;
        localStorage.setItem('jwtToken', data.token);
        console.log('Login successful:', this.user);
        return true;
      } catch (error) {
        console.error('Login failed:', error);
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        localStorage.removeItem('jwtToken');
        throw error;
      }
    },
    async signup(userData) {
      try {
        const data = await authService.signup(userData);
        console.log('Signup successful:', data);
        return true;
      } catch (error) {
        console.error('Signup failed:', error);
        throw error;
      }
    },
    async logout() {
      try {
        await authService.logout();
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        localStorage.removeItem('jwtToken');
        console.log('Logout successful.');
        router.push('/login'); // Chuyển hướng về trang đăng nhập sau khi đăng xuất
      } catch (error) {
        console.error('Logout failed:', error);
        // Nếu logout thất bại (ví dụ: token đã hết hạn trên server), vẫn xóa token và đăng xuất ở client
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        localStorage.removeItem('jwtToken');
        router.push('/login'); // Vẫn chuyển hướng
        throw error;
      }
    },
    async fetchUser() {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          this.isAuthenticated = false;
          this.user = null;
          return;
        }
        const data = await authService.getMe();
        this.user = data.user;
        this.isAuthenticated = true;
        console.log('User data fetched:', this.user);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        localStorage.removeItem('jwtToken'); // Xóa token nếu không hợp lệ
        // Nếu lỗi là do token hết hạn, chuyển hướng đến trang đăng nhập
        if (error.message.includes('Unauthorized') || error.message.includes('jwt expired')) {
          router.push('/login');
        }
        // Không throw lỗi ở đây để ứng dụng vẫn chạy nếu người dùng chưa đăng nhập
      }
    },
    async updateProfile(userData) {
      try {
        const data = await authService.updateMe(userData);
        this.user = data.user;
        console.log('Profile updated:', this.user);
        return true;
      } catch (error) {
        console.error('Failed to update profile:', error);
        throw error;
      }
    },
    async updatePassword(currentPassword, newPassword, newPasswordConfirm) {
      try {
        await authService.updateMyPassword(currentPassword, newPassword, newPasswordConfirm);
        console.log('Password updated successfully.');
        return true;
      } catch (error) {
        console.error('Failed to update password:', error);
        throw error;
      }
    },
    async forgotPassword(email) {
      try {
        await authService.forgotPassword(email);
        console.log('Forgot password email sent.');
        return true;
      } catch (error) {
        console.error('Failed to send forgot password email:', error);
        throw error;
      }
    },
    async resetPassword(token, password, passwordConfirm) {
      try {
        await authService.resetPassword(token, password, passwordConfirm);
        console.log('Password reset successfully.');
        return true;
      } catch (error) {
        console.error('Failed to reset password:', error);
        throw error;
      }
    },
  },
});
