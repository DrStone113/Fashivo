import { defineStore } from 'pinia';
import cartService from '../services/cart.service';
import { useAuthStore } from './authStore';
import router from '../router'; // Import router để chuyển hướng

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartId: null,
    items: [],
    isLoadingCart: false,
    cartError: null
  }),
  getters: {
    totalItems: (state) => state.items.reduce((acc, item) => acc + item.quantity, 0),
    // Total amount for selected products
    totalCartAmount: (state) => {
      return state.items.reduce((acc, item) => {
        if (!item.selected) return acc; // Chỉ tính các sản phẩm được chọn
        let price = 0;
        if (item.product && item.product.price !== undefined && item.product.price !== null) {
          price = Number(item.product.price);
          if (isNaN(price)) price = 0;
        }
        return acc + item.quantity * price;
      }, 0);
    },
    // Total quantity of selected products in the cart
    totalItemsInCart: (state) =>
      state.items.reduce((total, item) => {
        if (item.selected) {
          return total + item.quantity;
        }
        return total;
      }, 0),
    // Number of selected products
    selectedItemsCount: (state) => state.items.filter((item) => item.selected).length,
    // Are all products selected?
    isAllSelected: (state) => state.items.length > 0 && state.items.every((item) => item.selected),
    isEmpty: (state) => state.items.length === 0
  },
  actions: {
    _normalizeCartItems(rawItems) {
      if (!Array.isArray(rawItems)) {
        console.warn('Expected array for cart items, got:', rawItems);
        return [];
      }
      return rawItems.map((item) => {
        let normalizedPrice = 0;
        if (item.product && item.product.price !== undefined && item.product.price !== null) {
          let priceString = String(item.product.price);

          // Based on your response (e.g., '1200000.00'),
          // Number() will convert it to 1200000.
          // Then, we divide by 1 to get the correct price.
          normalizedPrice = Number(priceString); // Convert '1200000.00' to number 1200000
          normalizedPrice = normalizedPrice / 1; // Divide by 1 to get 120000

          // Kiểm tra lại nếu kết quả vẫn là NaN
          if (isNaN(normalizedPrice)) {
            normalizedPrice = 0;
            console.warn(
              `Could not parse price for product ${item.product.name}. Raw: '${item.product.price}'. Setting to 0.`
            );
          }
        }

        const product = { ...item.product, price: normalizedPrice };

        if (product.category_name && !product.category) {
          product.category = { name: product.category_name };
        }

        return {
          ...item,
          selected: item.selected !== undefined ? item.selected : true,
          product: product
        };
      });
    },

    async fetchUserCart() {
      this.isLoadingCart = true;
      this.cartError = null;
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated) {
          const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          this.items = this._normalizeCartItems(guestCart);
          this.cartId = 'guest';
          console.log('Guest cart loaded:', this.items);
          return;
        }

        const data = await cartService.fetchUserCart();
        if (!data || !data.cart || !Array.isArray(data.cart.items)) {
          console.warn('Backend returned unexpected cart data structure:', data);
          this.items = [];
          this.cartId = null;
          this.cartError = 'Invalid cart data received from server.';
          return;
        }

        this.cartId = data.cart.id;
        this.items = this._normalizeCartItems(data.cart.items);
        console.log('User cart fetched from backend (normalized):', this.items);

        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        if (guestCart.length > 0) {
          console.log('Synchronizing guest cart with user cart...');
          const normalizedGuestCart = this._normalizeCartItems(guestCart);

          for (const guestItem of normalizedGuestCart) {
            const existingUserItem = this.items.find(
              (item) => item.product_id === guestItem.product_id
            );
            if (existingUserItem) {
              if (existingUserItem.quantity < guestItem.quantity) {
                await cartService.updateItemQuantity(guestItem.product_id, guestItem.quantity);
              }
            } else {
              await cartService.addItem(guestItem.product_id, guestItem.quantity);
            }
          }
          localStorage.removeItem('guestCart');
          await this.fetchUserCart();
          console.log('Guest cart synchronized and cleared.');
        }
      } catch (error) {
        this.cartError = error.message;
        console.error('Error fetching user cart:', error);
        this.cartId = null;
        this.items = [];
        const authStore = useAuthStore();
        if (error.message.includes('Unauthorized') || error.message.includes('jwt expired')) {
          authStore.logout();
          router.push('/login');
        }
        throw error;
      } finally {
        this.isLoadingCart = false;
      }
    },

    async addItem(product, quantity = 1) {
      this.cartError = null;
      const existingItem = this.items.find((item) => item.product_id === product.id);

      if (existingItem) {
        await this.updateCartItem(product.id, existingItem.quantity + quantity);
        return;
      }

      const newItem = {
        product_id: product.id,
        quantity: quantity,
        selected: true,
        product: {
          ...product,
          price: Number(String(product.price)) / 1,
          category: product.category
        }
      };

      this.items.push(this._normalizeCartItems([newItem])[0]);

      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated) {
          const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          const existingItemIndex = guestCart.findIndex((item) => item.product_id === product.id);

          if (existingItemIndex !== -1) {
            guestCart[existingItemIndex].quantity += quantity;
          } else {
            guestCart.push(newItem);
          }
          localStorage.setItem('guestCart', JSON.stringify(guestCart));
          return;
        }
        await cartService.addItem(product.id, quantity);
      } catch (error) {
        this.items.pop();
        this.cartError = error.message;
        console.error('Error adding item to cart:', error);
        throw error;
      }
    },

    async updateCartItem(productId, quantity) {
      this.cartError = null;
      const itemIndex = this.items.findIndex((item) => item.product_id === productId);
      if (itemIndex === -1) return;

      const originalQuantity = this.items[itemIndex].quantity;
      this.items[itemIndex].quantity = quantity;

      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated) {
          const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          const guestItemIndex = guestCart.findIndex((item) => item.product_id === productId);
          if (guestItemIndex !== -1) {
            guestCart[guestItemIndex].quantity = quantity;
            localStorage.setItem('guestCart', JSON.stringify(guestCart));
          }
          return;
        }
        await cartService.updateItemQuantity(productId, quantity);
      } catch (error) {
        this.items[itemIndex].quantity = originalQuantity;
        this.cartError = error.message;
        console.error('Error updating item quantity:', error);
        throw error;
      }
    },

    async removeCartItem(productId) {
      this.cartError = null;
      const itemIndex = this.items.findIndex((item) => item.product_id === productId);
      if (itemIndex === -1) return;

      const removedItem = this.items.splice(itemIndex, 1)[0];

      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated) {
          let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          guestCart = guestCart.filter((item) => item.product_id !== productId);
          localStorage.setItem('guestCart', JSON.stringify(guestCart));
          return;
        }
        await cartService.removeItem(productId);
      } catch (error) {
        this.items.splice(itemIndex, 0, removedItem);
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

        await cartService.clearCart();
        this.items = [];
        this.cartId = null;
        console.log('User cart cleared via API.');
      } catch (error) {
        this.cartError = error.message;
        console.error('Error clearing cart:', error);
        throw error;
      } finally {
        this.isLoadingCart = false;
      }
    },

    setItemSelection(productId, selected) {
      const item = this.items.find((i) => i.product_id === productId);
      if (item) {
        item.selected = selected;
      }
    },

    setSelectAll(selected) {
      this.items.forEach((item) => {
        item.selected = selected;
      });
    },

    async checkoutSelectedItems() {
      const selectedItems = this.items.filter((item) => item.selected);
      if (selectedItems.length === 0) {
        console.log('No items selected for checkout.');
        return;
      }

      this.isLoadingCart = true;
      this.cartError = null;
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated) {
          // For guest, simply remove selected items from localStorage
          let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          const selectedProductIds = new Set(selectedItems.map((i) => i.product_id));
          guestCart = guestCart.filter((item) => !selectedProductIds.has(item.product_id));
          localStorage.setItem('guestCart', JSON.stringify(guestCart));
          await this.fetchUserCart(); // Reload cart from localStorage
          console.log('Guest cart updated after checkout.');
        } else {
          // For logged-in users, call API to remove each item
          // (Or use a bulk delete API if available)
          for (const item of selectedItems) {
            await cartService.removeItem(item.product_id);
          }
          await this.fetchUserCart(); // Reload cart from backend
          console.log('User cart updated after checkout.');
        }
      } catch (error) {
        this.cartError = error.message;
        console.error('Error during checkout of selected items:', error);
        throw error;
      } finally {
        this.isLoadingCart = false;
      }
    }
  },
  persist: true
});
