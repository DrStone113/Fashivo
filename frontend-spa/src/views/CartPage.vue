<template>
  <div class="cart-page-wrapper">
    <div class="cart-container">
      <h2 class="cart-title">Your Cart</h2>

      <!-- Status Messages -->
      <div v-if="cartError" class="status-message error-message">
        <i class="fas fa-exclamation-circle"></i> {{ cartError }}
      </div>
      <div v-if="isLoadingCart" class="status-message loading-message">
        <i class="fas fa-spinner fa-spin"></i> Loading your cart...
      </div>
      <div v-else-if="isEmpty" class="status-message empty-cart-message">
        <i class="fas fa-shopping-basket"></i> Your cart is empty.
        <router-link to="/menu" class="continue-shopping-link">Continue shopping</router-link>.
      </div>

      <!-- Cart Content -->
      <div v-else class="cart-content-layout">
        <div class="cart-items-section">
          <!-- Cart Header -->
          <div class="cart-item-header">
            <div class="header-col select-col">
              <input 
                type="checkbox" 
                class="select-all-checkbox"
                :checked="isAllSelected"
                @change="cartStore.setSelectAll($event.target.checked)"
                :disabled="isEmpty"
              />
            </div>
            <div class="header-col product-col">Product</div>
            <div class="header-col price-col">Price</div>
            <div class="header-col quantity-col">Quantity</div>
            <div class="header-col total-col">Total</div>
            <div class="header-col actions-col"></div>
          </div>

          <!-- Cart Items -->
          <CartItemCard
            v-for="item in cartItems"
            :key="item.product_id"
            :item="item"
            :is-loading="isLoadingCart"
            @update:quantity="updateQuantity"
            @remove="removeItem"
            @update:selection="cartStore.setItemSelection"
          />
          
          <div class="cart-actions-bottom">
            <button @click="handleClearCart" class="clear-cart-btn" :disabled="isLoadingCart">
              <i class="fas fa-trash-alt"></i> Clear Cart
            </button>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="cart-summary-section">
          <h5 class="summary-title">Order Summary</h5>
          <ul class="summary-list">
            <li class="summary-list-item">
              <span>Total items:</span>
              <span class="item-badge">{{ totalItemsInCart }}</span>
            </li>
            <li class="summary-list-item">
              <span>Subtotal:</span>
              <span class="subtotal-amount">{{ formatPrice(totalCartAmount || 0) }}</span>
            </li>
            <li class="summary-list-item total-row">
              <span>Total:</span>
              <span class="final-total-amount">{{ formatPrice(totalCartAmount || 0) }}</span>
            </li>
          </ul>

          <div v-if="successMessage" class="status-message success-message">
            <i class="fas fa-check-circle"></i> {{ successMessage }}
          </div>
          <div v-if="errorMessage" class="status-message error-message">
            <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
          </div>
          
          <button
            @click="handleProceedToCheckout"
            class="checkout-main-btn"
            :disabled="isEmpty || isLoadingCart || !authStore.isAuthenticated || selectedItemsCount === 0"
          >
            <i class="fas fa-money-check-alt"></i>
            <span v-if="isLoadingCart">Processing...</span>
            <span v-else-if="!authStore.isAuthenticated">Login to checkout</span>
            <span v-else-if="selectedItemsCount === 0">Select items to checkout</span>
            <span v-else>Checkout ({{ selectedItemsCount }} items)</span>
          </button>

          <!-- Login Prompt -->
          <div v-if="!authStore.isAuthenticated && !isEmpty" class="login-prompt-message">
            <i class="fas fa-info-circle"></i> 
            Please <router-link :to="{ path: '/login', query: { redirect: router.currentRoute.value.fullPath } }" class="alert-link">login</router-link> 
            to proceed to checkout.
          </div>
        </div>
      </div>
    </div>

    <!-- Checkout Confirmation Modal -->
    <div v-if="showConfirmation" class="modal-overlay">
      <div class="modal-content-styled">
        <h4 class="modal-title">Confirm Checkout</h4>
        <p class="modal-text">Are you sure you want to checkout with {{ selectedItemsCount }} selected items? These items will be removed from your cart after checkout.</p>
        <div class="modal-actions">
          <button @click="cancelConfirmation" class="modal-btn cancel-modal-btn" :disabled="isLoadingCart">Cancel</button>
          <button @click="confirmCheckout" class="modal-btn confirm-modal-btn" :disabled="isLoadingCart">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import CartItemCard from '@/components/CartItemCard.vue';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore'; 
import { useRouter } from 'vue-router'; 
import { storeToRefs } from 'pinia';
import { formatCurrency } from '@/utils/formatters';

const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();

const { 
  items: cartItems, 
  totalItemsInCart, 
  totalCartAmount, 
  isEmpty, 
  isLoadingCart, 
  cartError,
  isAllSelected,
  selectedItemsCount
} = storeToRefs(cartStore);

const successMessage = ref('');
const errorMessage = ref('');
const showConfirmation = ref(false);

onMounted(() => {
  cartStore.fetchUserCart();
});

const formatPrice = (price) => {
  return formatCurrency(price);
};

const updateQuantity = async (productId, newQuantity) => {
  if (newQuantity <= 0) {
    removeItem(productId);
    return;
  }
  const item = cartItems.value.find(i => i.product_id === productId);
  if (item && newQuantity > (item.product?.stock || 999)) {
    alert(`The quantity of "${item.product?.name}" cannot exceed ${item.product?.stock} in stock.`);
    newQuantity = item.product?.stock || 999; 
  }
  try {
    await cartStore.updateCartItem(productId, newQuantity); 
  } catch (error) {
    console.error('Error updating quantity:', error);
  }
};

const removeItem = async (productId) => {
  const isConfirmed = window.confirm('Are you sure you want to remove this item from your cart?');
  if (isConfirmed) {
    try {
      await cartStore.removeCartItem(productId); 
    }
    catch (error) {
      console.error('Error removing item:', error);
    }
  }
};

const handleClearCart = async () => {
  const isConfirmed = window.confirm('Are you sure you want to clear your entire cart?');
  if (isConfirmed) {
    try {
      await cartStore.clearCart(); 
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }
};

const handleProceedToCheckout = async () => {
  if (!authStore.isAuthenticated) {
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    });
    return;
  }
  
  if (!isEmpty.value) {
    showConfirmation.value = true;
  }
};

const confirmCheckout = async () => {
  try {
    successMessage.value = '';
    errorMessage.value = '';
    await cartStore.checkoutSelectedItems(); 
    
    successMessage.value = 'Checkout successful! Your selected items have been removed from the cart.';
    console.log('Checkout successful! Selected items cleared.');
    showConfirmation.value = false; 
  } catch (error) {
    errorMessage.value = error.message || 'Failed to complete checkout.';
    console.error('Error during checkout:', error);
    showConfirmation.value = false; 
  }
};

const cancelConfirmation = () => {
  showConfirmation.value = false;
};

watch(cartError, (newVal) => {
    if (newVal) {
        errorMessage.value = newVal;
    } else {
        errorMessage.value = '';
    }
});
</script>

<style scoped>
/* Cart Page Wrapper */
.cart-page-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f0f4f8, #e0e7ee);
  font-family: 'Poppins', 'Segoe UI', 'Roboto', sans-serif;

}

.cart-container {
  max-width: 1200px;
  width: 100%;
  background: #ffffff;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 40px;
  box-sizing: border-box;
}

.cart-title {
  text-align: center;
  color: #311994;
  margin-bottom: 40px;
  font-size: 2.5em;
  font-weight: 700;
  position: relative;
  padding-bottom: 15px;
  font-family: 'Poppins', 'Segoe UI', 'Roboto', sans-serif;
}

.cart-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(to right, #6C63FF, #A044FF);
  border-radius: 2px;
}

/* Status Messages */
.status-message {
  padding: 15px 20px;
  border-radius: 10px;
  margin-bottom: 25px;
  font-size: 1.1em;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.loading-message {
  background-color: #e3f2fd;
  color: #1976D2;
}
.error-message {
  background-color: #ffebee;
  color: #D32F2F;
}
.empty-cart-message {
  background-color: #e8f5e9;
  color: #388E3C;
  flex-direction: column;
  text-align: center;
  padding: 30px;
}
.empty-cart-message i {
  font-size: 3em;
  margin-bottom: 15px;
  color: #66BB6A;
}
.continue-shopping-link {
  color: #1976D2;
  text-decoration: none;
  font-weight: 600;
  margin-top: 10px;
  transition: color 0.2s;
}
.continue-shopping-link:hover {
  color: #0d47a1;
  text-decoration: underline;
}

/* Checkbox Styling */
.select-col, .item-select-col {
  display: flex;
  align-items: center;
  justify-content: center;
}
.select-all-checkbox, .item-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #6C63FF;
}


/* Cart Content Layout */
.cart-content-layout {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.cart-items-section {
  flex: 3;
  min-width: 500px;
  background: #fdfdfd;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  overflow: hidden;
  padding-bottom: 20px;
}

.cart-summary-section {
  flex: 1;
  min-width: 320px;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 25px;
  box-sizing: border-box;
  border: 1px solid #e5e5e5;
}

/* Cart Item Header */
.cart-item-header {
  display: grid;
  grid-template-columns: 0.3fr 2.7fr 1fr 1fr 1fr 0.5fr;
  gap: 15px;
  padding: 15px 25px;
  background-color: #4b3bff;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  color: #ffffff;
  font-size: 0.95em;
  text-transform: uppercase;
  text-align: center;
  font-family: 'Poppins', 'Segoe UI', 'Roboto', sans-serif; 
}
.cart-item-header .price-col,
.cart-item-header .total-col {
  text-align: center;
}
.cart-item-header .quantity-col,
.cart-item-header .actions-col {
  text-align: center;
}



.cart-actions-bottom {
  display: flex;
  justify-content: flex-end;
  padding: 20px 25px 0; 
}

.clear-cart-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background-color: #FFC107; 
  color: #333;
}

.clear-cart-btn:hover:not(:disabled) {
  background-color: #FFA000;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.clear-cart-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

/* Order Summary */
.summary-title {
  text-align: center;
  color: #2b229e;
  margin-bottom: 30px;
  font-size: 1.8em; 
  font-weight: 700;
  position: relative;
  padding-bottom: 15px;
  font-family: 'Poppins', 'Segoe UI', 'Roboto', sans-serif;
}

.summary-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px; 
  height: 3px;
  background: linear-gradient(to right, #6C63FF, #A044FF); 
  border-radius: 2px;
}

.summary-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border-top: 1px solid #3325a0; 
  border-bottom: 1px solid #f0f0f0; 
  margin-bottom: 25px;
}

.summary-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  color: #555;
  font-size: 1.1em;
  font-weight: 500;
  border-bottom: 1px dashed #29279a; 
}

.summary-list-item:last-child {
  border-bottom: none;
}

.item-badge {
  background-color: #6C63FF; 
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 600;
}

.subtotal-amount {
  font-weight: 600;
  color: #333;
}

.total-row {
  font-size: 1.2em;
  font-weight: 700;
  color: #333;
  padding-top: 15px;
  margin-top: 10px;
  border-top: 2px solid #e5e5e5;
}

.final-total-amount {
  color: #6C63FF;
  font-size: 1.1em;
}

/* Status Messages (in summary) */
.status-message {
  padding: 12px 15px;
  border-radius: 8px;
  margin-top: 15px;
  font-size: 0.95em;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.05);
}

.success-message {
  background-color: #e8f5e9;
  color: #388E3C;
}
.error-message {
  background-color: #ffebee;
  color: #D32F2F;
}

/* Checkout Button */
.checkout-main-btn {
  width: 100%;
  padding: 16px 25px;
  border: none;
  border-radius: 10px;
  font-size: 1.1em;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 5px 15px rgba(108, 99, 255, 0.3);
  background-color: #6C63FF;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.checkout-main-btn:hover:not(:disabled) {
  background-color: #5a54d9;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(108, 99, 255, 0.4);
}

.checkout-main-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
  opacity: 0.7;
}

.login-prompt-message {
  background-color: #fff3e0;
  color: #f57c00;
  padding: 15px;
  border-radius: 10px;
  margin-top: 20px;
  font-size: 0.95em;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.login-prompt-message .alert-link {
  color: #e65100;
  font-weight: 600;
  text-decoration: underline;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7); 
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px); 
}

.modal-content-styled {
  background: white;
  padding: 40px; 
  border-radius: 15px; 
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3); 
  max-width: 550px; 
  width: 90%;
  text-align: center;
  animation: fadeIn 0.3s ease-out; 
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-title {
  margin-bottom: 25px;
  color: #333;
  font-size: 1.8em;
  font-weight: 700;
}

.modal-text {
  margin-bottom: 35px;
  color: #555;
  font-size: 1.1em;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  justify-content: center; 
  gap: 15px; 
}

.modal-btn {
  padding: 12px 25px;
  font-size: 1.05em;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.cancel-modal-btn {
  background-color: #9E9E9E; 
  color: white;
}
.cancel-modal-btn:hover:not(:disabled) {
  background-color: #757575;
  transform: translateY(-2px);
}

.confirm-modal-btn {
  background-color: #4CAF50; 
  color: white;
}
.confirm-modal-btn:hover:not(:disabled) {
  background-color: #388E3C;
  transform: translateY(-2px);
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

/* Responsive */
@media (max-width: 992px) {
  .cart-content-layout {
    flex-direction: column;
  }
  .cart-items-section,
  .cart-summary-section {
    min-width: unset;
    width: 100%;
  }
  .cart-item-header {
    display: none;
  }

  .cart-container {
    padding: 30px;
  }
  .cart-title {
    font-size: 2em;
    margin-bottom: 30px;
  }
  .clear-cart-btn, .checkout-main-btn {
    width: 100%;
    font-size: 1em;
    padding: 15px 20px;
  }
}

@media (max-width: 576px) {
  .cart-container {
    padding: 20px;
  }
  .cart-title {
    font-size: 1.8em;
    margin-bottom: 25px;
  }
  .status-message {
    font-size: 0.9em;
  }
  .empty-cart-message i {
    font-size: 2.5em;
  }
  .summary-title {
    font-size: 1.6em;
  }
  .summary-list-item {
    font-size: 1em;
  }
  .total-row {
    font-size: 1.1em;
  }
  .checkout-main-btn {
    font-size: 0.95em;
    padding: 12px 15px;
  }
  .modal-content-styled {
    padding: 25px;
  }
  .modal-title {
    font-size: 1.6em;
  }
  .modal-text {
    font-size: 1em;
  }
}
</style>
