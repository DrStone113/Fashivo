// src/store/authStore.js
import { defineStore } from 'pinia';
import authService from '@/services/auth.service';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    token: null, 
    authLoading: false,
    authError: null,
  }),
  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isUser: (state) => state.user?.role === 'user',
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

        localStorage.setItem('jwt', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        router.push('/');
        return data;
      } catch (error) {
        this.authError = error.message || 'Đăng nhập thất bại.';
        this.isAuthenticated = false;
        this.user = null; 
        this.token = null; 
        localStorage.removeItem('jwt'); 
        localStorage.removeItem('user');
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
        this.user = data.user;
        this.token = data.token;
        this.isAuthenticated = true;
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/');
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
      } catch (error) {
        console.error('Error calling backend logout API:', error);
      } finally {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        localStorage.removeItem('jwt'); 
        localStorage.removeItem('user');
        this.authLoading = false;
        router.push('/login');
      }
    },

    async initializeAuth() {
      console.log('[AuthStore Init] Starting authentication initialization...');
      const storedToken = localStorage.getItem('jwt');
      const storedUser = localStorage.getItem('user');

      console.log('[AuthStore Init] Stored JWT:', storedToken ? 'Found' : 'Not Found');
      console.log('[AuthStore Init] Stored User:', storedUser ? 'Found' : 'Not Found');

      if (storedToken && storedUser) {
        try {
          this.token = storedToken;
          this.user = JSON.parse(storedUser);
          this.isAuthenticated = true;
          console.log('[AuthStore Init] Auth state restored from localStorage:', this.user);
          
          console.log('[AuthStore Init] Attempting to fetch user profile from API...');
          // SỬA LỖI: authService.getMe() trả về { user: {...} }, cần lấy user ra
          const responseData = await authService.getMe(); 
          this.user = responseData.user; // <--- DÒNG SỬA LỖI
          this.isAuthenticated = true;
          localStorage.setItem('user', JSON.stringify(this.user)); // Cập nhật localStorage
          console.log('[AuthStore Init] User profile re-fetched and updated during initialization:', this.user);

        } catch (error) {
          console.error('[AuthStore Init] Failed to re-authenticate or fetch user profile on app load:', error);
          this.logout(); 
          throw error;
        }
      } else {
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        localStorage.removeItem('jwt'); 
        localStorage.removeItem('user');
        console.log('[AuthStore Init] No auth token found, user is not authenticated.');
      }
      console.log('[AuthStore Init] Initialization complete. Current user state:', this.user);
    },

    async updateProfile(updateData) {
      this.authLoading = true;
      this.authError = null;
      try {
        const responseData = await authService.updateMe(updateData);
        this.user = responseData.user; 
        localStorage.setItem('user', JSON.stringify(this.user));
        console.log('Profile updated successfully in store:', this.user);
        return this.user;
      } catch (error) {
        this.authError = error.message || 'Cập nhật hồ sơ thất bại.';
        console.error('Failed to update profile:', error);
        throw error;
      } finally {
        this.authLoading = false;
      }
    },

    async updatePassword(currentPassword, newPassword, newPasswordConfirm) {
      this.authLoading = true;
      this.authError = null;
      try {
        const responseData = await authService.updateMyPassword(currentPassword, newPassword, newPasswordConfirm);
        console.log('Password updated successfully.');
        return responseData;
      } catch (error) {
        this.authError = error.message || 'Cập nhật mật khẩu thất bại.';
        console.error('Failed to update password:', error);
        throw error;
      } finally {
        this.authLoading = false;
      }
    },
  },
  persist: true, 
});
