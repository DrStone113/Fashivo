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

function makeCategoryService() {
  const baseUrl = '/api/v1/categories';

  async function fetchCategories(page = 1, limit = 10, filters = {}) {
    let url = new URL(baseUrl, window.location.origin);
    url.searchParams.set('page', page);
    url.searchParams.set('limit', limit);
    if (filters.name) url.searchParams.set('name', filters.name);

    const data = await efetch(url.toString());
    return data;
  }

  async function fetchCategory(categoryId) {
    const { category } = await efetch(`${baseUrl}/${categoryId}`);
    return category;
  }

  // Các hàm cho Admin (nếu cần)
  async function createCategory(categoryData) {
    return efetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    });
  }

  async function updateCategory(categoryId, categoryData) {
    return efetch(`${baseUrl}/${categoryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    });
  }

  async function deleteCategory(categoryId) {
    return efetch(`${baseUrl}/${categoryId}`, {
      method: 'DELETE',
    });
  }

  return {
    fetchCategories,
    fetchCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}

export default makeCategoryService();
