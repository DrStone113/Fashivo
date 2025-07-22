async function efetch(url, options = {}) {
  let result = {};
  let json = {};

  // Lấy token từ localStorage
  const token = localStorage.getItem('jwtToken');

  // Thêm header Authorization nếu có token
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json', // Mặc định là JSON, có thể ghi đè nếu cần (ví dụ FormData)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // Thực hiện fetch với headers đã cập nhật
    result = await fetch(url, { ...options, headers });
    json = await result.json();
  } catch (error) {
    throw new Error(error.message);
  }

  if (!result.ok || json.status !== 'success') {
    // Xử lý lỗi 401 cụ thể nếu cần, ví dụ: chuyển hướng đến trang đăng nhập
    if (result.status === 401) {
      // Tùy chọn: Xóa token và chuyển hướng đến trang đăng nhập
      // localStorage.removeItem('jwtToken');
      // window.location.href = '/login';
      throw new Error(json.message || 'Unauthorized: Vui lòng đăng nhập lại.');
    }
    throw new Error(json.message || 'API request failed');
  }
  return json.data;
}

function makeAuthService() {
  const baseUrl = '/api/v1/auth';

  async function login(email, password) {
    return efetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  }

  async function signup(userData) {
    // userData có thể bao gồm name, email, password, passwordConfirm, phone, address, avatarFile
    const formData = new FormData();
    for (const key in userData) {
      if (userData[key]) {
        formData.append(key, userData[key]);
      }
    }

    return efetch(`${baseUrl}/signup`, {
      method: 'POST',
      body: formData, // FormData tự động set Content-Type
    });
  }

  async function logout() {
    return efetch(`${baseUrl}/logout`);
  }

  async function getMe() {
    return efetch(`${baseUrl}/me`);
  }

  async function updateMe(userData) {
    const formData = new FormData();
    for (const key in userData) {
      if (userData[key]) {
        formData.append(key, userData[key]);
      }
    }
    return efetch(`${baseUrl}/updateMe`, {
      method: 'PATCH',
      body: formData,
    });
  }

  async function updateMyPassword(currentPassword, newPassword, newPasswordConfirm) {
    return efetch(`${baseUrl}/updateMyPassword`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword, newPasswordConfirm }),
    });
  }

  async function forgotPassword(email) {
    return efetch(`${baseUrl}/forgotPassword`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  }

  async function resetPassword(token, password, passwordConfirm) {
    return efetch(`${baseUrl}/resetPassword/${token}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
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
