// src/services/cart.service.js
import axios from 'axios';
import { DEFAULT_IMAGE } from '../constants'; // Đảm bảo đường dẫn đúng

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Tạo một Axios instance chung để tự động thêm token
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor để thêm token vào mỗi yêu cầu
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi 401 tự động
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
      console.error('Unauthorized: Token invalid or expired. Logging out.');
    }
    return Promise.reject(error);
  }
);

class CartService {
  async fetchUserCart() {
    try {
      const response = await apiClient.get('/carts/myCart');
      const data = response.data.data;

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
        return { cart: { items: [] } };
      }
      return data;
    } catch (error) {
      console.error('Error fetching user cart:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Lỗi khi lấy giỏ hàng.');
    }
  }

  async addItem(productId, quantity) {
    try {
      const response = await apiClient.post('/carts/myCart', { product_id: productId, quantity });
      return response.data.data;
    } catch (error) {
      console.error('Error adding item to cart:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Lỗi khi thêm sản phẩm vào giỏ hàng.');
    }
  }

  async updateItemQuantity(productId, quantity) {
    try {
      const response = await apiClient.patch('/carts/myCart', { product_id: productId, quantity });
      return response.data.data.item;
    } catch (error) {
      console.error(
        'Error updating item quantity:',
        error.response?.data?.message || error.message
      );
      throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật số lượng sản phẩm.');
    }
  }

  async removeItem(productId) {
    try {
      // SỬA LỖI: Gửi DELETE request đến '/carts/removeItem' và truyền product_id trong body
      // Axios DELETE method có thể nhận data trong config object
      const response = await apiClient.delete('/carts/removeItem', {
        data: { product_id: productId }
      });
      return response.data.data;
    } catch (error) {
      console.error(
        'Error removing item from cart:',
        error.response?.data?.message || error.message
      );
      throw new Error(error.response?.data?.message || 'Lỗi khi xóa sản phẩm khỏi giỏ hàng.');
    }
  }

  async clearCart() {
    try {
      const response = await apiClient.delete('/carts/myCart');
      return response.data.data;
    } catch (error) {
      console.error('Error clearing cart:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Lỗi khi xóa giỏ hàng.');
    }
  }

  // Các hàm liên quan đến quản lý cart (nếu có)
  async createCart(userId) {
    try {
      const response = await apiClient.post('/carts', { user_id: userId });
      return response.data.data;
    } catch (error) {
      console.error('Error creating cart:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Lỗi khi tạo giỏ hàng.');
    }
  }

  async fetchCartInformation(cartId) {
    try {
      const response = await apiClient.get(`/carts/${cartId}`);
      return response.data.data.cart;
    } catch (error) {
      console.error(
        'Error fetching cart information:',
        error.response?.data?.message || error.message
      );
      throw new Error(error.response?.data?.message || 'Lỗi khi lấy thông tin giỏ hàng.');
    }
  }

  async updateCartInformation(cart) {
    try {
      const response = await apiClient.put(`/carts/${cart.id}`, cart);
      return response.data.data;
    } catch (error) {
      console.error(
        'Error updating cart information:',
        error.response?.data?.message || error.message
      );
      throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin giỏ hàng.');
    }
  }

  async deleteCart(cartId) {
    try {
      const response = await apiClient.delete(`/carts/${cartId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error deleting cart:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Lỗi khi xóa giỏ hàng.');
    }
  }
}

export default new CartService();
