// src/services/product.service.js
import { BASE_URL_API, DEFAULT_IMAGE } from '../constants';

// Hàm efetch không thay đổi, giữ nguyên như cũ
async function efetch(url, options = {}) {
  let result = {};
  let json = {};
  const token = localStorage.getItem('jwtToken');
  const headers = {
    ...options.headers,
    'Content-Type': options.body instanceof FormData ? undefined : 'application/json'
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

  // Bỏ console.log ở đây để không làm nhiễu console trong môi trường production
  // console.log('API Response Status:', result.status);
  // console.log('API Response JSON:', json);

  if (!result.ok || json.status !== 'success') {
    if (result.status === 401) {
      localStorage.removeItem('jwtToken');
      throw new Error(json.message || 'Unauthorized: Vui lòng đăng nhập lại.');
    }
    throw new Error(json.message || `API request failed with status ${result.status}`);
  }
  return json.data;
}

function makeProductService() {
  const baseUrl = `${BASE_URL_API}/product`;

  async function fetchProducts(page = 1, limit = 8, filters = {}) {
    // Khởi tạo URLSearchParams để xây dựng query string
    const queryParams = new URLSearchParams({
      page,
      limit
    });

    // 1. Giữ nguyên các bộ lọc đã hoạt động
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    if (filters.minPrice > 0) {
      queryParams.append('minPrice', filters.minPrice);
    }
    if (filters.maxPrice < 10000000) {
      queryParams.append('maxPrice', filters.maxPrice);
    }
    if (filters.inStock) {
      queryParams.append('inStock', 'true');
    }

    // 2. SỬA LỖI CUỐI CÙNG CHO CATEGORIES:
    // Lặp qua mảng ID và thêm từng cái vào query dưới dạng tham số riêng biệt
    // URL sẽ có dạng: ...&category_id=3&category_id=4
    if (filters.categories && filters.categories.length > 0) {
      filters.categories.forEach((id) => {
        queryParams.append('category_id', id);
      });
    }

    // 3. Giữ nguyên logic cho Sắp xếp
    if (filters.sortBy) {
      const [sortField, sortOrder] = filters.sortBy.split(',');
      if (sortField) {
        queryParams.append('sort', sortField);
        queryParams.append('order', sortOrder);
      }
    }

    const queryString = queryParams.toString();

    const data = await efetch(`${baseUrl}?${queryString}`);

    data.products = data.products.map((product) => ({
      ...product,
      image_url: product.image_url ?? DEFAULT_IMAGE
    }));

    return data;
  }

  // Các hàm còn lại không thay đổi
  async function fetchProduct(productId) {
    const dataFromApi = await efetch(`${baseUrl}/${productId}`);
    const actualProduct = dataFromApi.product;
    return {
      ...actualProduct,
      image_url: actualProduct.image_url ?? DEFAULT_IMAGE
    };
  }

  async function createProduct(productData) {
    return efetch(baseUrl, {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async function updateProduct(productId, productData) {
    return efetch(`${baseUrl}/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(productData)
    });
  }

  async function deleteProduct(productId) {
    return efetch(`${baseUrl}/${productId}`, {
      method: 'DELETE'
    });
  }

  return {
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct
  };
}

export default makeProductService();
