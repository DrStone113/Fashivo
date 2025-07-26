<template>
  <div class="cart-page-wrapper">
    <div class="cart-container">
      <h2 class="cart-title">GIỎ HÀNG CỦA BẠN</h2>

      <!-- Thông báo trạng thái -->
      <div v-if="cartError" class="status-message error-message">
        <i class="fas fa-exclamation-circle"></i> {{ cartError }}
      </div>
      <div v-if="isLoadingCart" class="status-message loading-message">
        <i class="fas fa-spinner fa-spin"></i> Đang tải giỏ hàng...
      </div>
      <div v-else-if="isEmpty" class="status-message empty-cart-message">
        <i class="fas fa-shopping-basket"></i> Giỏ hàng của bạn trống.
        <router-link to="/menu" class="continue-shopping-link">Tiếp tục mua sắm</router-link>.
      </div>

      <!-- Nội dung giỏ hàng khi có sản phẩm -->
      <div v-else class="cart-content-layout">
        <div class="cart-items-section">
          <!-- Header cho danh sách sản phẩm -->
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
            <div class="header-col product-col">Sản phẩm</div>
            <div class="header-col price-col">Giá</div>
            <div class="header-col quantity-col">Số lượng</div>
            <div class="header-col total-col">Tổng</div>
            <div class="header-col actions-col"></div>
          </div>

          <!-- Danh sách sản phẩm trong giỏ hàng (dạng card) -->
          <div v-for="(item) in cartItems" :key="item.product_id" class="cart-item-card">
            <div class="item-select-col">
              <input 
                type="checkbox" 
                class="item-checkbox"
                v-model="item.selected"
                @change="cartStore.setItemSelection(item.product_id, item.selected)"
              />
            </div>
            <div class="item-product-info">
              <div class="item-image-wrapper">
                <img 
                  :src="item.product?.image_url || '/public/image/products/BLANK.jpg.png'" 
                  :alt="item.product?.name" 
                  class="item-image"
                  onerror="this.onerror=null;this.src='/public/image/products/BLANK.jpg.png';"
                >
              </div>
              <div class="item-details">
                <div class="item-name">{{ item.product?.name || 'Sản phẩm không rõ' }}</div>
                <div class="item-type">{{ item.product?.type || 'Loại không rõ' }}</div>
              </div>
            </div>
            
            <!-- Các cột thông tin được căn chỉnh trực tiếp dưới header -->
            <div class="item-price">{{ formatPrice(item.product?.price || 0) }}</div>
            
            <div class="item-quantity-control">
              <button @click="updateQuantity(item.product_id, item.quantity - 1)" :disabled="item.quantity <= 1 || isLoadingCart" class="quantity-btn minus-btn">-</button>
              <input
                type="number"
                class="quantity-input"
                v-model.number="item.quantity"
                @change="updateQuantity(item.product_id, item.quantity)"
                min="1"
                :max="item.product?.stock || 999"
                :disabled="isLoadingCart"
              >
              <button @click="updateQuantity(item.product_id, item.quantity + 1)" :disabled="item.quantity >= (item.product?.stock || 999) || isLoadingCart" class="quantity-btn plus-btn">+</button>
            </div>
            
            <div class="item-total">{{ formatPrice(item.quantity * (item.product?.price || 0)) }}</div>
            
            <div class="item-actions">
              <button @click="removeItem(item.product_id)" class="remove-item-btn" :disabled="isLoadingCart">
                <!-- Icon hoặc background-image cho nút xóa -->
              </button>
            </div>
          </div>
          
          <!--
          <div class="cart-actions-bottom">
            <button @click="handleClearCart" class="clear-cart-btn" :disabled="isLoadingCart">
              <i class="fas fa-trash-alt"></i> Xóa toàn bộ giỏ hàng
            </button>
          </div>
          -->
        </div>

        <!-- Tóm tắt đơn hàng -->
        <div class="cart-summary-section">
          <h5 class="summary-title">Tóm tắt đơn hàng</h5>
          <ul class="summary-list">
            <li class="summary-list-item">
              <span>Tổng số lượng:</span>
              <span class="item-badge">{{ totalItemsInCart }}</span>
            </li>
            <li class="summary-list-item">
              <span>Tổng phụ:</span>
              <span class="subtotal-amount">{{ formatPrice(totalCartAmount || 0) }}</span>
            </li>
            <li class="summary-list-item total-row">
              <span>Tổng cộng:</span>
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
            <span v-if="isLoadingCart">Đang xử lý...</span>
            <span v-else-if="!authStore.isAuthenticated">Đăng nhập để thanh toán</span>
            <span v-else-if="selectedItemsCount === 0">Chọn sản phẩm để thanh toán</span>
            <span v-else>Thanh toán ({{ selectedItemsCount }} sản phẩm)</span>
          </button>

          <!-- Thông báo yêu cầu đăng nhập -->
          <div v-if="!authStore.isAuthenticated && !isEmpty" class="login-prompt-message">
            <i class="fas fa-info-circle"></i> 
            Vui lòng <router-link :to="{ path: '/login', query: { redirect: router.currentRoute.value.fullPath } }" class="alert-link">đăng nhập</router-link> 
            để tiến hành thanh toán.
          </div>
        </div>
      </div>
    </div>

    <!-- Modal xác nhận thanh toán -->
    <div v-if="showConfirmation" class="modal-overlay">
      <div class="modal-content-styled">
        <h4 class="modal-title">Xác nhận Thanh toán</h4>
        <p class="modal-text">Bạn có chắc chắn muốn thanh toán cho {{ selectedItemsCount }} sản phẩm đã chọn? Các sản phẩm này sẽ được xóa khỏi giỏ hàng sau khi thanh toán.</p>
        <div class="modal-actions">
          <button @click="cancelConfirmation" class="modal-btn cancel-modal-btn" :disabled="isLoadingCart">Hủy</button>
          <button @click="confirmCheckout" class="modal-btn confirm-modal-btn" :disabled="isLoadingCart">Xác nhận</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore'; 
import { useRouter } from 'vue-router'; 
import { storeToRefs } from 'pinia';

const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();

// Sử dụng storeToRefs để các getters và state trở nên reactive
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
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) {
    return '0 VND';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(numericPrice);
};

const updateQuantity = async (productId, newQuantity) => {
  if (newQuantity <= 0) {
    removeItem(productId);
    return;
  }
  const item = cartItems.value.find(i => i.product_id === productId);
  if (item && newQuantity > (item.product?.stock || 999)) {
    alert(`Số lượng sản phẩm "${item.product?.name}" không thể vượt quá ${item.product?.stock} trong kho.`);
    newQuantity = item.product?.stock || 999; 
  }
  try {
    await cartStore.updateCartItem(productId, newQuantity); 
  } catch (error) {
    console.error('Error updating quantity:', error);
  }
};

const removeItem = async (productId) => {
  // Thay thế window.confirm bằng modal tùy chỉnh nếu bạn muốn
  const isConfirmed = window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?');
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
  // Thay thế window.confirm bằng modal tùy chỉnh nếu bạn muốn
  const isConfirmed = window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?');
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
    // Sử dụng action mới để checkout các sản phẩm đã chọn
    await cartStore.checkoutSelectedItems(); 
    
    successMessage.value = 'Bạn đã thanh toán thành công! Các sản phẩm đã chọn đã được xóa khỏi giỏ hàng.';
    console.log('Checkout successful! Selected items cleared.');
    showConfirmation.value = false; 
    // fetchUserCart đã được gọi bên trong checkoutSelectedItems, không cần gọi lại ở đây.
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
/* Tổng thể trang giỏ hàng */
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
  max-width: 1200px; /* Tăng max-width để chứa cả 2 cột */
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

/* Thông báo trạng thái */
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

/* CSS cho checkbox */
.select-col, .item-select-col {
  display: flex;
  align-items: center;
  justify-content: center;
}
.select-all-checkbox, .item-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #6C63FF; /* Tùy chỉnh màu của checkbox */
}


/* Layout 2 cột cho nội dung giỏ hàng */
.cart-content-layout {
  display: flex;
  gap: 30px;
  flex-wrap: wrap; /* Cho phép xuống dòng trên màn hình nhỏ */
}

.cart-items-section {
  flex: 3; /* Chiếm 3 phần */
  min-width: 500px; /* Đảm bảo đủ rộng */
  background: #fdfdfd;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  overflow: hidden;
  padding-bottom: 20px; /* Thêm padding dưới để nút không bị dính */
}

.cart-summary-section {
  flex: 1; /* Chiếm 1 phần */
  min-width: 300px; /* Đảm bảo đủ rộng */
  background: #a79adc;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
}

/* Header cho danh sách sản phẩm */
.cart-item-header {
  display: grid;
  /* Thêm cột cho checkbox, giảm chiều rộng cột sản phẩm một chút */
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
  text-align: center; /* Căn phải cho header Giá và Tổng */
}
.cart-item-header .quantity-col,
.cart-item-header .actions-col {
  text-align: center;
}


/* Card sản phẩm trong giỏ hàng */
.cart-item-card {
  display: grid;
  /* Phải khớp với header để căn chỉnh */
  grid-template-columns: 0.3fr 2.7fr 1fr 1fr 1fr 0.5fr;
  gap: 15px;
  background: #bebbdb;
  padding: 15px 25px;
  border-bottom: 2px solid #2631ab;
  align-items: center; /* Căn giữa các item theo chiều dọc */
  transition: background-color 0.2s ease;
}

.cart-item-card:last-child {
  border-bottom: none;
}

.cart-item-card:hover {
  background-color: #f9f9f9;
}

.item-product-info {
  display: flex;
  align-items: center;
  gap: 15px;
  /* Không cần flex: 1 1 250px; ở đây nữa vì đã dùng grid */
}

.item-image-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-name {
  font-weight: 600;
  color: #241a6d;
  font-size: 1.05em;
  margin-bottom: 5px;
}

.item-type {
  color: #777777;
  font-size: 0.9em;
  text-transform: capitalize;
}

/* Căn chỉnh cho Giá */
.item-price {
  font-weight: 600;
  color: #555;
  font-size: 1em;
  text-align: right; /* Căn phải để khớp với header */
}

/* Căn chỉnh cho Số lượng */
.item-quantity-control {
  display: flex;
  align-items: center;
  justify-content: center; /* Căn giữa để khớp với header */
  gap: 5px;
}

.quantity-btn {
  background-color: #e0e0e0;
  border: none;
  border-radius: 5px;
  width: 30px;
  height: 30px;
  font-size: 1.1em;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  color: #555;
  flex-shrink: 0;
}

.quantity-btn:hover:not(:disabled) {
  background-color: #d0d0d0;
  transform: scale(1.05);
}

.quantity-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quantity-input {
  width: 50px;
  padding: 5px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  -moz-appearance: textfield; 
  flex-grow: 1; /* Cho phép input giãn ra */
}
.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none; 
  margin: 0;
}

/* Căn chỉnh cho Tổng */
.item-total {
  font-weight: 600;
  color: #555;
  font-size: 1em;
  text-align: center; /* Căn phải để khớp với header */
}

/* Căn chỉnh cho Hành động */
.item-actions {
  display: flex; /* Dùng flex để căn giữa nút xóa */
  justify-content: center; /* Căn giữa để khớp với header */
  align-items: center; /* Căn giữa theo chiều dọc */
  height: 100%; /* Đảm bảo chiếm hết chiều cao ô grid */
}

/* Style cho nút xóa sử dụng background-image */
.remove-item-btn {
  background-color: white; 
  border: 1px solid #FF5252; 
  border-radius: 50%;
  width: 40px; 
  height: 40px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;

  background-image: url('../assets/delete-product.png'); /* Placeholder image for delete */
  background-size: 70%; 
  background-repeat: no-repeat;
  background-position: center;
  color: transparent; 
}

.remove-item-btn:hover:not(:disabled) {
  background-color: #FFEBEE; 
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.remove-item-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
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

/* Tóm tắt đơn hàng (summary card) */
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
  font-size: 1.4em; 
  font-weight: 700;
  color: #333;
  padding-top: 20px;
  padding-bottom: 20px;
  border-top: 2px solid #e0e0e0; 
}

.final-total-amount {
  color: #A044FF; 
  font-size: 1.1em; 
}

/* Thông báo trạng thái (trong summary) */
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

/* Nút thanh toán chính */
.checkout-main-btn {
  width: 100%;
  padding: 18px 25px; 
  border: none;
  border-radius: 12px; 
  font-size: 1.2em; 
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2); 
  
  background-image: linear-gradient(to right, #6C63FF, #A044FF); 
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.checkout-main-btn:hover:not(:disabled) {
  background-image: linear-gradient(to right, #5A54D9, #8C3CE5);
  transform: translateY(-5px); 
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.checkout-main-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
  opacity: 0.7;
}

.login-prompt-message {
  background-color: #fff3e0; /* Màu vàng nhạt */
  color: #f57c00; /* Màu cam đậm */
  padding: 15px;
  border-radius: 10px;
  margin-top: 20px;
  font-size: 0.95em;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.login-prompt-message .alert-link {
  color: #e65100; /* Màu cam đậm hơn cho link */
  font-weight: 600;
  text-decoration: underline;
}

/* Modal Overlay */
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
@media (max-width: 992px) { /* Cho tablet */
  .cart-content-layout {
    flex-direction: column;
  }
  .cart-items-section,
  .cart-summary-section {
    min-width: unset;
    width: 100%;
  }
  .cart-item-header {
    display: none; /* Ẩn header trên tablet và mobile */
  }

  .item-select-col {
    order: -1; /* Hiển thị checkbox đầu tiên */
    margin-bottom: 15px;
  }

  .cart-item-card {
    /* Thay đổi từ grid sang flex để các phần tử có thể xếp chồng hoặc dàn hàng tùy ý */
    display: flex; 
    flex-direction: column; /* Xếp chồng các phần tử trên mobile */
    align-items: flex-start; /* Căn trái các item */
    padding: 20px;
    border: 1px solid #e0e0e0;
    margin-bottom: 20px;
  }
  .item-product-info {
    width: 100%;
    margin-bottom: 15px;
  }
  /* Các cột thông tin sẽ hiển thị dạng khối trên mobile */
  .item-price,
  .item-quantity-control,
  .item-total {
    width: 100%; /* Chiếm toàn bộ chiều rộng */
    text-align: left; /* Căn trái */
    margin-bottom: 10px; /* Khoảng cách giữa các khối */
    padding: 8px 10px; /* Thêm padding cho các khối */
    background-color: #f8f8f8;
    border: 1px solid #eee;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    display: flex; /* Dùng flex để căn chỉnh label và value */
    justify-content: space-between; /* Đẩy label và value ra hai bên */
    align-items: center;
  }

  .item-price::before { content: "Giá:"; font-weight: 600; color: #777; margin-right: 10px; }
  .item-total::before { content: "Tổng:"; font-weight: 600; color: #777; margin-right: 10px; }
  .item-quantity-control::before { content: "Số lượng:"; font-weight: 600; color: #777; margin-right: 10px; }

  .item-actions {
    width: 100%;
    margin-top: 15px;
    margin-left: 0;
    display: flex;
    justify-content: flex-end; /* Căn phải nút xóa */
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

@media (max-width: 576px) { /* Cho mobile nhỏ hơn */
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
  .item-image-wrapper {
    width: 60px;
    height: 60px;
  }
  .item-name {
    font-size: 1em;
  }
  .item-type {
    font-size: 0.85em;
  }
  /* Căn chỉnh lại cho mobile rất nhỏ */
  .item-price,
  .item-quantity-control,
  .item-total {
    padding: 6px 8px; /* Giảm padding */
    font-size: 0.9em; /* Giảm font size */
  }
  .quantity-btn {
    width: 28px;
    height: 28px;
    font-size: 1em;
  }
  .quantity-input {
    width: 45px;
    padding: 4px;
    font-size: 0.95em;
  }
  .remove-item-btn {
    width: 35px;
    height: 35px;
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
