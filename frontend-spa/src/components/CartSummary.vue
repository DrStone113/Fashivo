<template>
  <div class="cart-summary-card card shadow-sm">
    <div class="card-body">
      <h5 class="card-title mb-4">Tóm tắt đơn hàng</h5>
      <ul class="list-group list-group-flush mb-4">
        <li class="list-group-item d-flex justify-content-between align-items-center">
          Tổng số lượng:
          <span class="badge bg-primary rounded-pill">{{ totalItemsInCart }}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
          Tổng phụ:
          <span class="fw-bold">{{ Number(totalCartAmount || 0).toFixed(2) }} VND</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center fs-5 fw-bold">
          Tổng cộng:
          <span>{{ Number(totalCartAmount || 0).toFixed(2) }} VND</span>
        </li>
      </ul>

      <div v-if="successMessage" class="alert alert-success mt-3" role="alert">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">
        {{ errorMessage }}
      </div>

      <button
        @click="handleProceedToCheckout"
        class="btn btn-primary w-100 mt-3"
        :disabled="isEmpty || isLoadingCart"
      >
        <i class="fas fa-money-check-alt"></i>
        <span v-if="isLoadingCart">Đang xử lý...</span>
        <span v-else>Tiến hành thanh toán</span>
      </button>
    </div>

    <div v-if="showConfirmation" class="modal-overlay">
      <div class="modal-content">
        <h4>Xác nhận thanh toán</h4>
        <p>Bạn có chắc chắn muốn tiến hành thanh toán các mặt hàng trong giỏ? Giỏ hàng sẽ được xóa sau khi thanh toán.</p>
        <div class="d-flex justify-content-end">
          <button @click="cancelConfirmation" class="btn btn-secondary me-2" :disabled="isLoadingCart">Hủy</button>
          <button @click="confirmCheckout" class="btn btn-success" :disabled="isLoadingCart">Xác nhận thanh toán</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'; // Import onMounted
import { useCartStore } from '@/store/cartStore'; // Đảm bảo đường dẫn đúng
// import { useRouter } from 'vue-router'; // Uncomment if you want to redirect after checkout

const cartStore = useCartStore();
// const router = useRouter(); // Uncomment if you want to redirect after checkout

const successMessage = ref('');
const errorMessage = ref('');
const showConfirmation = ref(false);

// Computed properties từ cartStore
// Sử dụng các getter mà bạn đã định nghĩa trong cartStore.js
const totalItemsInCart = computed(() => cartStore.totalItemsInCart); // Tên getter trong store của bạn
const totalCartAmount = computed(() => cartStore.totalCartAmount); // Tên getter trong store của bạn
const isEmpty = computed(() => cartStore.isEmpty); // Tên getter trong store của bạn
const isLoadingCart = computed(() => cartStore.isLoadingCart); // Trạng thái loading từ store
const cartError = computed(() => cartStore.cartError); // Trạng thái lỗi từ store

// Đảm bảo dữ liệu giỏ hàng được fetch khi component được mount
onMounted(() => {
  cartStore.fetchUserCart();
});

// Hàm xử lý khi nhấn "Proceed to Checkout"
const handleProceedToCheckout = () => {
  if (!isEmpty.value) {
    showConfirmation.value = true;
  }
};

// Hàm xác nhận xóa giỏ hàng (sau khi người dùng đồng ý trong popup)
const confirmCheckout = async () => {
  try {
    successMessage.value = '';
    errorMessage.value = '';
    await cartStore.clearCart(); // Gọi action clearCart từ store
    
    successMessage.value = 'Bạn đã thanh toán thành công! Giỏ hàng của bạn đã được xóa.';
    // Tùy chọn: Chuyển hướng người dùng đến trang chủ hoặc trang xác nhận đơn giản
    // router.push('/'); 
    console.log('Checkout successful! Cart cleared.');
    showConfirmation.value = false; // Đóng popup
  } catch (error) {
    errorMessage.value = error.message || 'Failed to complete checkout.';
    console.error('Error during checkout:', error);
    showConfirmation.value = false; // Đóng popup
  }
};

// Hàm hủy xác nhận
const cancelConfirmation = () => {
  showConfirmation.value = false;
};

// Watch for changes in cartError from store
// Nếu có lỗi từ cartStore, hiển thị nó lên errorMessage cục bộ
watch(cartError, (newVal) => {
    if (newVal) {
        errorMessage.value = newVal;
    } else {
        errorMessage.value = '';
    }
});
</script>

<style scoped>
.cart-summary-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}
.list-group-item {
  border-left: none;
  border-right: none;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  text-align: center;
}

.modal-content h4 {
  margin-bottom: 20px;
  color: #333;
}

.modal-content p {
  margin-bottom: 30px;
  color: #555;
}

.modal-content .btn {
  padding: 10px 20px;
  font-size: 1rem;
}
</style>