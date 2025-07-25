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
      <div v-else class="cart-content">
        <div class="cart-items-display">
          <!-- Header cho danh sách sản phẩm -->
          <div class="cart-item-header">
            <div class="header-col product-name-col">Sản phẩm</div>
            <div class="header-col product-price-col">Giá</div>
            <div class="header-col product-quantity-col">Số lượng</div>
            <div class="header-col product-total-col">Tổng</div>
            <div class="header-col product-actions-col"></div>
          </div>

          <!-- Danh sách sản phẩm trong giỏ hàng -->
          <div v-for="(item) in cartItems" :key="item.product_id" class="cart-item-card">
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
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Tổng tiền và các nút hành động cuối cùng -->
        <div class="cart-summary">
          <div class="summary-row">
            <span>Tổng cộng:</span>
            <span class="total-amount">{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>
          <div class="summary-actions">
            <button @click="handleClearCart" class="clear-cart-btn" :disabled="isLoadingCart">
              <i class="fas fa-trash-alt"></i> Xóa toàn bộ giỏ hàng
            </button>
            <button @click="handleCheckout" class="checkout-btn" :disabled="isLoadingCart">
              <i class="fas fa-money-check-alt"></i> Tiến hành Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useCartStore } from '@/store/cartStore';

const cartStore = useCartStore();

// Không cần successMessage và errorMessage riêng ở đây nữa, dùng cartStore.cartError
// const successMessage = ref(''); 
// const errorMessage = ref('');

const cartItems = computed(() => cartStore.items);
const isEmpty = computed(() => cartStore.isEmpty);
const isLoadingCart = computed(() => cartStore.isLoadingCart); 
const cartError = computed(() => cartStore.cartError); 

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
  // Đảm bảo số lượng không vượt quá số lượng tồn kho
  const item = cartItems.value.find(i => i.product_id === productId);
  if (item && newQuantity > (item.product?.stock || 999)) {
    alert(`Số lượng sản phẩm "${item.product?.name}" không thể vượt quá ${item.product?.stock} trong kho.`);
    newQuantity = item.product?.stock || 999; // Đặt lại về max
  }
  try {
    await cartStore.updateCartItem(productId, newQuantity); 
  } catch (error) {
    // Lỗi sẽ được hiển thị qua cartError của store
    console.error('Error updating quantity:', error);
  }
};

const removeItem = async (productId) => {
  const isConfirmed = window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?');
  if (isConfirmed) {
    try {
      await cartStore.removeCartItem(productId); 
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }
};

const handleClearCart = async () => {
  const isConfirmed = window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?');
  if (isConfirmed) {
    try {
      await cartStore.clearCart(); 
      // successMessage.value = 'Giỏ hàng của bạn đã được xóa sạch.'; // Không cần nữa, store sẽ quản lý
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }
};

// NEW: Hàm xử lý khi nhấn nút "Tiến hành Thanh toán"
const handleCheckout = () => {
  // Đây là nơi bạn sẽ triển khai logic thanh toán thực tế
  // Hiện tại, vì chưa có bảng order, chúng ta sẽ mô phỏng:
  alert('Chức năng thanh toán đang được phát triển! Cảm ơn bạn đã mua sắm.');
  // Bạn có thể chuyển hướng người dùng đến một trang xác nhận đơn hàng giả định
  // router.push('/checkout-confirmation'); 
};

// Watch for changes in cartError from store (đã có)
// watch(cartError, (newVal) => {
//     if (newVal) {
//         errorMessage.value = newVal;
//     } else {
//         errorMessage.value = '';
//     }
// });
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
  max-width: 1000px;
  width: 100%;
  background: #ffffff;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 40px;
  box-sizing: border-box;
}

.cart-title {
  text-align: center;
  color: #333;
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

/* Nội dung giỏ hàng */
.cart-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.cart-items-display {
  background: #fdfdfd;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  overflow: hidden; /* Để bo góc cho shadow */
}

/* Header cho danh sách sản phẩm */
.cart-item-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1.2fr 1fr 0.5fr; /* Điều chỉnh cột */
  gap: 15px;
  padding: 15px 25px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  color: #555;
  font-size: 0.95em;
  text-transform: uppercase;
}

.header-col {
  text-align: left;
}
.header-col.product-name-col { grid-column: span 1; } /* Sản phẩm và ảnh */
.header-col.product-price-col { text-align: right; }
.header-col.product-quantity-col { text-align: center; }
.header-col.product-total-col { text-align: right; }
.header-col.product-actions-col { text-align: center; }


/* Card sản phẩm trong giỏ hàng */
.cart-item-card {
  display: grid;
  grid-template-columns: 2fr 1fr 1.2fr 1fr 0.5fr; /* Phải khớp với header */
  gap: 15px;
  padding: 15px 25px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  transition: background-color 0.2s ease;
}

.cart-item-card:last-child {
  border-bottom: none;
}

.cart-item-card:hover {
  background-color: #f9f9f9;
}

.item-image-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  flex-shrink: 0; /* Ngăn ảnh bị co lại */
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
  text-align: left;
}

.item-name {
  font-weight: 600;
  color: #333;
  font-size: 1.05em;
  margin-bottom: 5px;
}

.item-type {
  color: #777;
  font-size: 0.9em;
  text-transform: capitalize;
}

.item-price, .item-total {
  font-weight: 600;
  color: #555;
  font-size: 1em;
  text-align: right;
}

.item-quantity-control {
  display: flex;
  align-items: center;
  justify-content: center;
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
  -moz-appearance: textfield; /* Loại bỏ mũi tên trên Firefox */
}
.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none; /* Loại bỏ mũi tên trên Chrome/Safari */
  margin: 0;
}


.remove-item-btn {
  background-color: #FF5252;
  color: white;
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-item-btn:hover:not(:disabled) {
  background-color: #D32F2F;
  transform: scale(1.1);
}

.remove-item-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Tổng tiền và các nút hành động */
.cart-summary {
  background: #fdfdfd;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.3em;
  font-weight: 600;
  color: #333;
}

.total-amount {
  font-size: 1.6em;
  color: #6C63FF; /* Màu tím */
  font-weight: 700;
}

.summary-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  flex-wrap: wrap; /* Cho phép xuống dòng trên màn hình nhỏ */
}

.clear-cart-btn, .checkout-btn {
  padding: 15px 25px;
  border: none;
  border-radius: 10px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.clear-cart-btn {
  background-color: #FFC107; /* Màu vàng */
  color: #333;
}

.clear-cart-btn:hover:not(:disabled) {
  background-color: #FFA000;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.checkout-btn {
  background-image: linear-gradient(to right, #6C63FF, #A044FF); /* Gradient tím */
  color: white;
}

.checkout-btn:hover:not(:disabled) {
  background-image: linear-gradient(to right, #5A54D9, #8C3CE5);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.clear-cart-btn:disabled, .checkout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

/* Responsive */
@media (max-width: 768px) {
  .cart-container {
    padding: 25px;
  }
  .cart-title {
    font-size: 2em;
    margin-bottom: 30px;
  }
  .cart-item-header, .cart-item-card {
    grid-template-columns: 1fr 1fr; /* 2 cột trên mobile */
    gap: 10px;
    padding: 15px;
  }
  .cart-item-header .header-col, .cart-item-card > div {
    text-align: left !important; /* Căn trái tất cả trên mobile */
  }
  
  .item-image-wrapper {
    width: 60px;
    height: 60px;
  }
  .item-name {
    font-size: 1em;
  }
  .item-price, .item-total {
    font-size: 0.9em;
  }
  .item-quantity-control {
    justify-content: flex-start; /* Căn trái control số lượng */
  }
  .summary-actions {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .clear-cart-btn, .checkout-btn {
    width: 100%;
    font-size: 1em;
    padding: 12px 20px;
  }
}

@media (max-width: 480px) {
  .cart-container {
    padding: 15px;
  }
  .cart-title {
    font-size: 1.8em;
  }
  .status-message {
    font-size: 0.9em;
  }
  .empty-cart-message i {
    font-size: 2.5em;
  }
}
</style>
