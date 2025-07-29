<template>
  <div class="cart-summary-card-container">
    <div class="card-body-styled">
      <h5 class="card-title-styled">Tóm tắt đơn hàng</h5>
      
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
        :disabled="isEmpty || isLoadingCart"
      >
        <i class="fas fa-money-check-alt"></i>
        <span v-if="isLoadingCart">Đang xử lý...</span>
        <span v-else>Tiến hành thanh toán</span>
      </button>
    </div>

    <!-- Modal xác nhận thanh toán -->
    <div v-if="showConfirmation" class="modal-overlay">
      <div class="modal-content-styled">
        <h4 class="modal-title">Xác nhận thanh toán</h4>
        <p class="modal-text">Bạn có chắc chắn muốn tiến hành thanh toán các mặt hàng trong giỏ? Giỏ hàng sẽ được xóa sau khi thanh toán.</p>
        <div class="modal-actions">
          <button @click="cancelConfirmation" class="modal-btn cancel-modal-btn" :disabled="isLoadingCart">Hủy</button>
          <button @click="confirmCheckout" class="modal-btn confirm-modal-btn" :disabled="isLoadingCart">Xác nhận thanh toán</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useCartStore } from '@/store/cartStore';

const cartStore = useCartStore();

const successMessage = ref('');
const errorMessage = ref('');
const showConfirmation = ref(false);

const totalItemsInCart = computed(() => cartStore.totalItemsInCart);
const totalCartAmount = computed(() => cartStore.totalPrice); // Sử dụng totalPrice từ cartStore
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

const handleProceedToCheckout = () => {
  if (!isEmpty.value) {
    showConfirmation.value = true;
  }
};

const confirmCheckout = async () => {
  try {
    successMessage.value = '';
    errorMessage.value = '';
    await cartStore.clearCart(); 
    
    successMessage.value = 'Bạn đã thanh toán thành công! Giỏ hàng của bạn đã được xóa.';
    console.log('Checkout successful! Cart cleared.');
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

// Watch for changes in cartError from store
watch(cartError, (newVal) => {
    if (newVal) {
        errorMessage.value = newVal;
    } else {
        errorMessage.value = '';
    }
});
</script>

<style scoped>
/* Container chính của card tóm tắt */
.cart-summary-card-container {
  background: #ffffff;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); /* Bóng đổ mềm mại */
  padding: 30px; /* Tăng padding */
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.card-body-styled {
  display: flex;
  flex-direction: column;
  gap: 20px; /* Khoảng cách giữa các phần tử */
}

.card-title-styled {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 1.8em; /* Kích thước lớn hơn */
  font-weight: 700;
  position: relative;
  padding-bottom: 15px;
}

.card-title-styled::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px; /* Chiều rộng của đường kẻ dưới */
  height: 3px;
  background: linear-gradient(to right, #6C63FF, #A044FF); /* Gradient tím */
  border-radius: 2px;
}

/* Danh sách tóm tắt */
.summary-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border-top: 1px solid #f0f0f0; /* Đường kẻ trên */
  border-bottom: 1px solid #f0f0f0; /* Đường kẻ dưới */
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
  border-bottom: 1px dashed #e0e0e0; /* Đường kẻ đứt giữa các item */
}

.summary-list-item:last-child {
  border-bottom: none;
}

.item-badge {
  background-color: #6C63FF; /* Màu tím cho badge */
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
  font-size: 1.4em; /* Lớn hơn cho tổng cộng */
  font-weight: 700;
  color: #333;
  padding-top: 20px;
  padding-bottom: 20px;
  border-top: 2px solid #e0e0e0; /* Đường kẻ đậm hơn cho tổng cộng */
}

.final-total-amount {
  color: #A044FF; /* Màu tím đậm hơn cho tổng cuối cùng */
  font-size: 1.1em; /* Điều chỉnh kích thước font cho tổng cuối cùng */
}

/* Thông báo trạng thái */
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
  padding: 18px 25px; /* Tăng padding */
  border: none;
  border-radius: 12px; /* Bo góc nhiều hơn */
  font-size: 1.2em; /* Kích thước font lớn hơn */
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2); /* Bóng đổ mạnh hơn */
  
  background-image: linear-gradient(to right, #6C63FF, #A044FF); /* Gradient tím */
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.checkout-main-btn:hover:not(:disabled) {
  background-image: linear-gradient(to right, #5A54D9, #8C3CE5);
  transform: translateY(-5px); /* Hiệu ứng nổi mạnh hơn */
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.checkout-main-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
  opacity: 0.7;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7); /* Nền tối hơn */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px); /* Hiệu ứng làm mờ nền */
}

.modal-content-styled {
  background: white;
  padding: 40px; /* Tăng padding */
  border-radius: 15px; /* Bo góc nhiều hơn */
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3); /* Bóng đổ mạnh hơn */
  max-width: 550px; /* Tăng kích thước tối đa */
  width: 90%;
  text-align: center;
  animation: fadeIn 0.3s ease-out; /* Hiệu ứng fade-in */
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
  justify-content: center; /* Căn giữa các nút */
  gap: 15px; /* Khoảng cách giữa các nút */
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
  background-color: #9E9E9E; /* Xám */
  color: white;
}
.cancel-modal-btn:hover:not(:disabled) {
  background-color: #757575;
  transform: translateY(-2px);
}

.confirm-modal-btn {
  background-color: #4CAF50; /* Xanh lá */
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
@media (max-width: 768px) {
  .cart-summary-card-container {
    padding: 20px;
  }
  .card-title-styled {
    font-size: 1.6em;
    margin-bottom: 25px;
  }
  .summary-list-item {
    font-size: 1em;
    padding: 12px 0;
  }
  .total-row {
    font-size: 1.2em;
    padding-top: 15px;
    padding-bottom: 15px;
  }
  .checkout-main-btn {
    font-size: 1em;
    padding: 15px 20px;
  }
  .modal-content-styled {
    padding: 30px;
  }
  .modal-title {
    font-size: 1.6em;
  }
  .modal-text {
    font-size: 1em;
  }
  .modal-actions {
    flex-direction: column;
    gap: 10px;
  }
  .modal-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .cart-summary-card-container {
    padding: 15px;
  }
  .card-title-styled {
    font-size: 1.4em;
    margin-bottom: 20px;
  }
  .summary-list-item {
    font-size: 0.95em;
  }
  .total-row {
    font-size: 1.1em;
  }
  .checkout-main-btn {
    font-size: 0.95em;
    padding: 12px 15px;
  }
  .modal-content-styled {
    padding: 20px;
  }
}
</style>
