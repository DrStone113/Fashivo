    // src/services/auth.service.js (Frontend)
    import { BASE_URL_API } from '../constants';

    async function efetch(url, options = {}) {
      let result = {};
      let json = {};

      const token = localStorage.getItem('jwtToken');

      const headers = {
        ...options.headers,
      };

      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        result = await fetch(url, { ...options, headers });
        // NEW: Chỉ cố gắng parse JSON nếu response có content-type là application/json
        const contentType = result.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            json = await result.json();
        } else {
            // Nếu không phải JSON, có thể là text hoặc không có body
            // console.log('Non-JSON response:', await result.text());
            json = { status: result.ok ? 'success' : 'fail', message: await result.text() || result.statusText };
        }
      } catch (error) {
        console.error('Network or parsing error in efetch:', error);
        if (result && !result.ok) { 
          try {
            const errorText = await result.text();
            console.error('Raw response text for error:', errorText);
            throw new Error(errorText || `API request failed with status ${result.status}`);
          } catch (textError) {
            console.error('Failed to read error response text:', textError);
            throw new Error(`API request failed with status ${result.status}`);
          }
        }
        throw new Error(error.message);
      }

      if (!result.ok || json.status !== 'success') {
        if (result.status === 401) {
          localStorage.removeItem('jwtToken');
          throw new Error(json.message || 'Unauthorized: Vui lòng đăng nhập lại.');
        }
        // NEW: Kiểm tra nếu json.message không tồn tại, sử dụng thông báo mặc định
        throw new Error(json.message || `API request failed with status ${result.status}`); 
      }
      return json.data;
    }

    function makeAuthService() {
      const baseUrl = `${BASE_URL_API}/auth`; 

      async function login(email, password) {
        return efetch(`${baseUrl}/login`, {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
      }

      async function signup(userData) {
        const formData = new FormData();
        for (const key in userData) {
          if (userData[key]) {
            formData.append(key, userData[key]);
          }
        }

        return efetch(`${baseUrl}/signup`, {
          method: 'POST',
          body: formData, 
        });
      }

      async function logout() {
        return efetch(`${baseUrl}/logout`, {
          method: 'POST', // NEW: Đảm bảo là POST
        });
      }

      async function getMe() {
        return efetch(`${baseUrl}/me`);
      }

      async function updateMe(userData) {
        let bodyToSend;
        let headers = {};

        if (userData instanceof FormData) {
          bodyToSend = userData;
        } else {
          bodyToSend = JSON.stringify(userData);
          headers['Content-Type'] = 'application/json';
        }

        return efetch(`${baseUrl}/me`, { 
          method: 'PATCH', 
          headers: headers,
          body: bodyToSend,
        });
      }

      async function updateMyPassword(currentPassword, newPassword, newPasswordConfirm) {
        return efetch(`${baseUrl}/update-password`, { 
          method: 'PATCH', 
          body: JSON.stringify({ currentPassword, newPassword, newPasswordConfirm }),
        });
      }

      async function forgotPassword(email) {
        return efetch(`${baseUrl}/forgot-password`, {
          method: 'POST',
          body: JSON.stringify({ email }),
        });
      }

      async function resetPassword(token, password, passwordConfirm) {
        return efetch(`${baseUrl}/reset-password/${token}`, {
          method: 'PATCH',
          body: JSON.stringify({ password, passwordConfirm }),
        });
      }

      return {
        login,
        signup,
        logout,
        getMe,
        updateMe,
        updateMyPassword,
        forgotPassword,
        resetPassword,
      };
    }

    export default makeAuthService();
    