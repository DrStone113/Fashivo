// src/services/auth.service.js (Frontend)
import { BASE_URL_API } from '../constants';

async function efetch(url, options = {}) {
  let result = {};
  let json = {};

  // SỬA LỖI: Lấy token từ key 'jwt' thay vì 'jwtToken'
  const token = localStorage.getItem('jwt'); 

  const headers = {
    ...options.headers,
  };

  // NEW: Chỉ đặt Content-Type: application/json nếu body KHÔNG phải là FormData
  // Khi gửi FormData, trình duyệt sẽ tự động đặt Content-Type: multipart/form-data kèm boundary
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    result = await fetch(url, { ...options, headers });
    const contentType = result.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        json = await result.json();
    } else {
        // Nếu không phải JSON, có thể là text hoặc không có body
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
      // SỬA LỖI: Xóa token từ key 'jwt'
      localStorage.removeItem('jwt');
      // Có thể thêm logic để chuyển hướng người dùng về trang đăng nhập
      // Ví dụ: router.push('/login'); (nếu router có thể truy cập ở đây)
      throw new Error(json.message || 'Unauthorized: Vui lòng đăng nhập lại.');
    }
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
    // userData có thể là một object JSON hoặc FormData
    let bodyToSend = userData;
    let headers = {};

    if (!(userData instanceof FormData)) {
      // Nếu không phải FormData, thì là JSON
      bodyToSend = JSON.stringify(userData);
      headers['Content-Type'] = 'application/json'; // Đảm bảo Content-Type là JSON
    }
    // Nếu là FormData, efetch đã xử lý Content-Type đúng cách và trình duyệt tự động đặt boundary

    return efetch(`${baseUrl}/signup`, {
      method: 'POST',
      headers: headers, // Truyền headers đã được điều chỉnh
      body: bodyToSend, 
    });
  }

  async function logout() {
    return efetch(`${baseUrl}/logout`, {
      method: 'POST', 
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
