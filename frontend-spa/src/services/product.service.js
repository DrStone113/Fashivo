// src/services/product.service.js
import { BASE_URL_API, DEFAULT_IMAGE } from '../constants'; // Đảm bảo đúng tên biến BASE_URL_API

/**
 * Hàm trợ giúp để fetch API và xử lý phản hồi JSend.
 * Hàm này có thể được chuyển thành một file tiện ích riêng nếu nhiều service sử dụng.
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
async function efetch(url, options = {}) {
  let result = {};
  let json = {};

  // Lấy token từ localStorage
  const token = localStorage.getItem('jwtToken');

  // Thêm header Authorization nếu có token
  const headers = {
    ...options.headers,
    'Content-Type': options.body instanceof FormData ? undefined : 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    result = await fetch(url, { ...options, headers });
    json = await result.json();
  } catch (error) {
    console.error('Network or parsing error:', error);
    throw new Error(`Network or parsing error: ${error.message}`);
  }

  console.log('API Response Status:', result.status);
  console.log('API Response JSON:', json);

  if (!result.ok || json.status !== 'success') {
    if (result.status === 401) {
      localStorage.removeItem('jwtToken');
      // Tùy chọn: chuyển hướng đến trang đăng nhập nếu đây là một ứng dụng SPA
      // import router from '@/router';
      // router.push('/login');
      throw new Error(json.message || 'Unauthorized: Vui lòng đăng nhập lại.');
    }
    throw new Error(json.message || `API request failed with status ${result.status}`);
  }
  return json.data;
}


function makeProductService() {
  // SỬ DỤNG ĐÚNG TÊN BIẾN BASE_URL_API
  const baseUrl = `${BASE_URL_API}/product`; // URL cơ sở cho các API sản phẩm

  /**
   * Lấy danh sách sản phẩm với phân trang và bộ lọc.
   * @param {number} page - Trang hiện tại.
   * @param {number} limit - Số lượng sản phẩm trên mỗi trang.
   * @param {object} filters - Các bộ lọc sản phẩm (ví dụ: name, categoryId, minPrice, maxPrice, etc.)
   * @returns {Promise<{products: Array, metadata: object}>}
   */
  async function fetchProducts(page = 1, limit = 8, filters = {}) {
    const queryParams = new URLSearchParams({
      page: page,
      limit: limit,
      ...filters, // Thêm các bộ lọc vào query params
    }).toString();

    // API: GET /api/v1/product?page=...&limit=...&filterKey=...
    const data = await efetch(`${baseUrl}?${queryParams}`);
    // Giả sử `data` ở đây là `{ products: [...], metadata: {...} }` từ phản hồi JSend
    
    // Xử lý image_url cho mỗi sản phẩm
    data.products = data.products.map(product => ({
      ...product,
      image_url: product.image_url ?? DEFAULT_IMAGE // Sử dụng DEFAULT_IMAGE nếu không có
    }));

    return data;
  }

  /**
   * Lấy thông tin chi tiết của một sản phẩm theo ID.
   * @param {number} productId - ID của sản phẩm.
   * @returns {Promise<object>} - Thông tin chi tiết sản phẩm.
   */
  async function fetchProduct(productId) {
    // efetch trả về `json.data`, mà trong trường hợp này là `{ product: { ... } }`
    const dataFromApi = await efetch(`${baseUrl}/${productId}`);

    // BƯỚC SỬA LỖI QUAN TRỌNG: Lấy đối tượng sản phẩm thực sự từ `dataFromApi.product`
    const actualProduct = dataFromApi.product; 

    // Trả về đối tượng sản phẩm đã được làm phẳng và bổ sung image_url
    return {
      ...actualProduct, // Spread các thuộc tính của đối tượng sản phẩm thực sự
      image_url: actualProduct.image_url ?? DEFAULT_IMAGE, // Sử dụng `actualProduct.image_url`
    };
  }

  // Các API khác liên quan đến sản phẩm (ví dụ: tạo, cập nhật, xóa, tìm kiếm nâng cao)
  // có thể được thêm vào đây
  async function createProduct(productData) {
    return efetch(baseUrl, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async function updateProduct(productId, productData) {
    return efetch(`${baseUrl}/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(productData),
    });
  }

  async function deleteProduct(productId) {
    return efetch(`${baseUrl}/${productId}`, {
      method: 'DELETE',
    });
  }

  return {
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

export default makeProductService();