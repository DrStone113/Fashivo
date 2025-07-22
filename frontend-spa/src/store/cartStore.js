// src/store/cartStore.js
import { defineStore } from 'pinia';
import cartService from '../services/cart.service';
import { useAuthStore } from './authStore';
import router from '../router'; // Import router để chuyển hướng

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartId: null,
    items: [],
    // Có thể thêm trạng thái loading và error để hiển thị trên UI
    isLoadingCart: false,
    cartError: null,
  }),
  getters: {
    totalItems: (state) => state.items.reduce((acc, item) => acc + item.quantity, 0),
    totalCartAmount: (state) => state.items.reduce((acc, item) => {
      // Đảm bảo item.product tồn tại và price là một số
      const price = Number(item.product?.price || 0);
      return acc + item.quantity * price;
    }, 0),
    totalItemsInCart: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    isEmpty: (state) => state.items.length === 0,
  },
  actions: {
    // Hàm trợ giúp để chuẩn hóa dữ liệu item (price thành Number)
    _normalizeCartItems(rawItems) {
        if (!Array.isArray(rawItems)) {
            console.warn('Expected array for cart items, got:', rawItems);
            return [];
        }
        return rawItems.map(item => ({
            ...item,
            product: {
                ...item.product,
                price: Number(item.product?.price || 0) // Chuyển đổi price thành Number
            }
        }));
    },

    async fetchUserCart() {
      this.isLoadingCart = true;
      this.cartError = null;
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated) {
          const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          this.items = this._normalizeCartItems(guestCart); // Sử dụng hàm chuẩn hóa
          this.cartId = 'guest';
          console.log('Guest cart loaded:', this.items);
          return; // Dừng thực thi nếu là khách
        }

        const data = await cartService.fetchUserCart();
        // Kiểm tra data.cart và data.cart.items
        if (!data || !data.cart || !Array.isArray(data.cart.items)) {
            console.warn('Backend returned unexpected cart data structure:', data);
            this.items = []; // Đặt giỏ hàng rỗng nếu cấu trúc không đúng
            this.cartId = null;
            this.cartError = 'Invalid cart data received from server.';
            return; // Dừng thực thi
        }

        this.cartId = data.cart.id;
        this.items = this._normalizeCartItems(data.cart.items); // Sử dụng hàm chuẩn hóa
        console.log('User cart fetched from backend:', this.items);

        // Đồng bộ giỏ hàng khách với người dùng
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        if (guestCart.length > 0) {
          console.log('Synchronizing guest cart with user cart...');
          // Chuẩn hóa guestCart trước khi xử lý
          const normalizedGuestCart = this._normalizeCartItems(guestCart);

          for (const guestItem of normalizedGuestCart) {
            const existingUserItem = this.items.find(item => item.product_id === guestItem.product_id);
            if (existingUserItem) {
              // Cập nhật số lượng nếu giỏ hàng khách có số lượng lớn hơn
              if (existingUserItem.quantity < guestItem.quantity) {
                await cartService.updateItemQuantity(guestItem.product_id, guestItem.quantity);
              }
            } else {
              await cartService.addItemToCart(guestItem.product_id, guestItem.quantity);
            }
          }
          localStorage.removeItem('guestCart');
          // Sau khi đồng bộ, fetch lại giỏ hàng từ backend để có dữ liệu mới nhất
          await this.fetchUserCart();
          console.log('Guest cart synchronized and cleared.');
        }

      } catch (error) {
        this.cartError = error.message;
        console.error('Error fetching user cart:', error);
        this.cartId = null;
        this.items = []; // Xóa giỏ hàng nếu có lỗi nghiêm trọng
        const authStore = useAuthStore();
        if (error.message.includes('Unauthorized') || error.message.includes('jwt expired')) {
          authStore.logout(); // Đăng xuất người dùng nếu token không hợp lệ
          router.push('/login'); // Chuyển hướng đến trang đăng nhập
        }
        throw error; // Vẫn ném lỗi để component có thể xử lý
      } finally {
        this.isLoadingCart = false;
      }
    },

    async addItem(product, quantity = 1) {
      this.cartError = null;
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated) {
          const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          const existingItemIndex = guestCart.findIndex((item) => item.product_id === product.id);
          
          if (existingItemIndex !== -1) {
            guestCart[existingItemIndex].quantity += quantity;
          } else {
            guestCart.push({
              product_id: product.id,
              quantity: quantity,
              product: {
                id: product.id,
                name: product.name,
                price: Number(product.price || 0), // Chuẩn hóa price khi thêm vào guest cart
                image_url: product.image_url,
              }
            });
          }
          localStorage.setItem('guestCart', JSON.stringify(guestCart));
          this.items = this._normalizeCartItems(guestCart); // Chuẩn hóa khi gán vào state
          console.log('Item added to guest cart:', this.items);
          return;
        }

        await cartService.addItemToCart(product.id, quantity);
        await this.fetchUserCart(); // Fetch lại để cập nhật từ backend
        console.log('Item added to user cart via API.');
      } catch (error) {
        this.cartError = error.message;
        console.error('Error adding item to cart:', error);
        throw error;
      }
    },

    async updateCartItem(productId, quantity) {
      this.cartError = null;
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated) {
          const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          const itemIndex = guestCart.findIndex(item => item.product_id === productId);
          if (itemIndex !== -1) {
            if (quantity <= 0) {
              guestCart.splice(itemIndex, 1);
            } else {
              guestCart[itemIndex].quantity = quantity;
            }
          }
          localStorage.setItem('guestCart', JSON.stringify(guestCart));
          this.items = this._normalizeCartItems(guestCart); // Chuẩn hóa khi gán vào state
          console.log('Guest cart item updated:', this.items);
          return;
        }

        await cartService.updateItemQuantity(productId, quantity);
        await this.fetchUserCart(); // Fetch lại để cập nhật từ backend
        console.log('User cart item updated via API.');
      } catch (error) {
        this.cartError = error.message;
        console.error('Error updating item quantity:', error);
        throw error;
      }
    },

    async removeCartItem(productId) {
      this.cartError = null;
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated) {
          let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          guestCart = guestCart.filter(item => item.product_id !== productId);
          localStorage.setItem('guestCart', JSON.stringify(guestCart));
          this.items = this._normalizeCartItems(guestCart); // Chuẩn hóa khi gán vào state
          console.log('Guest cart item removed:', this.items);
          return;
        }

        await cartService.removeItemFromCart(productId);
        await this.fetchUserCart(); // Fetch lại để cập nhật từ backend
        console.log('User cart item removed via API.');
      } catch (error) {
        this.cartError = error.message;
        console.error('Error removing item from cart:', error);
        throw error;
      }
    },

    async clearCart() {
      this.cartError = null;
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated) {
          localStorage.removeItem('guestCart');
          this.items = [];
          this.cartId = 'guest';
          console.log('Guest cart cleared.');
          return;
        }

        await cartService.clearMyCart();
        this.items = []; // Xóa hết item trong state sau khi backend báo thành công
        this.cartId = null; // Reset cartId cho user
        console.log('User cart cleared via API.');
        // Sau khi clear, không cần fetchUserCart vì nó đã trống
      } catch (error) {
        this.cartError = error.message;
        console.error('Error clearing cart:', error);
        throw error;
      }
    },
  },
  persist: true // Giữ nguyên persist nếu bạn muốn trạng thái giỏ hàng tồn tại qua các lần refresh
});