// src/services/cart.service.js
import { BASE_URL_API, DEFAULT_IMAGE } from '../constants';

// Hàm efetch (không đổi)
async function efetch(url, options = {}) {
  let result = {};
  let json = {};

  const token = localStorage.getItem('jwtToken');
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
      throw new Error(json.message || 'Unauthorized: Vui lòng đăng nhập lại.');
    }
    throw new Error(json.message || `API request failed with status ${result.status}`);
  }
  return json.data;
}

function makeCartService() {
  const baseUrl = `${BASE_URL_API}/carts`;

  async function fetchUserCart() {
    const data = await efetch(`${baseUrl}/myCart`);
    // Đảm bảo data.cart và data.cart.items tồn tại trước khi map
    if (data && data.cart && data.cart.items) {
      data.cart.items = data.cart.items.map((item) => {
        return {
          ...item,
          product: {
            ...item.product,
            image_url: item.product.image_url ?? DEFAULT_IMAGE
          }
        };
      });
    } else {
      // Trả về cấu trúc rỗng nếu không có dữ liệu giỏ hàng
      return { cart: { items: [] } };
    }
    return data;
  }

  async function addItemToCart(productId, quantity) {
    return efetch(`${baseUrl}/addItem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  async function updateItemQuantity(productId, quantity) {
    return efetch(`${baseUrl}/updateItemQuantity`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  async function removeItemFromCart(productId) {
    return efetch(`${baseUrl}/removeItem`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    });
  }

  // CHỨC NĂNG XÓA GIỎ HÀNG NÀY ĐÃ ĐÚNG VÀ SẼ ĐƯỢC SỬ DỤNG CHO CẢ "CLEAR CART" VÀ "PROCEED TO CHECKOUT"
  async function clearMyCart() {
    return efetch(`${baseUrl}/clearMyCart`, {
      method: 'DELETE',
    });
  }

  // ... (Các hàm khác không đổi nếu không liên quan trực tiếp đến vấn đề này)
  async function createCart(userId) {
    return efetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async function fetchCartInformation(cartId) {
    const { cart } = await efetch(`${baseUrl}/${cartId}`);
    return cart;
  }

  async function updateCartInformation(cart) {
    return efetch(`${baseUrl}/${cart.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cart),
    });
  }

  async function deleteCart(cartId) {
    return efetch(`${baseUrl}/${cartId}`, {
      method: 'DELETE',
    });
  }

  return {
    fetchUserCart,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearMyCart,
    createCart,
    fetchCartInformation,
    updateCartInformation,
    deleteCart,
  };
}

export default makeCartService();