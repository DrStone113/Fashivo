<script setup>
import { computed, ref, onMounted } from 'vue';
import { useCartStore } from '@/store/cartStore'; // Đảm bảo đường dẫn đúng
import { useAuthStore } from '@/store/authStore'; // Import auth store
import { useRouter } from 'vue-router'; // Import useRouter để chuyển hướng

const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();

const successMessage = ref('');
const errorMessage = ref('');
const showConfirmation = ref(false); // Biến để kiểm soát hiển thị popup xác nhận

// Computed properties để hiển thị thông tin giỏ hàng
const cartItems = computed(() => cartStore.items);
const subtotal = computed(() => cartStore.subtotal);
const totalQuantity = computed(() => cartStore.totalQuantity);
const isEmpty = computed(() => cartItems.value.length === 0);

// Load giỏ hàng khi component được mount
onMounted(() => {
  cartStore.fetchUserCart();
});

// Hàm cập nhật số lượng sản phẩm
const updateQuantity = async (productId, newQuantity) => {
  if (newQuantity <= 0) {
    // Nếu số lượng là 0 hoặc âm, coi như xóa sản phẩm
    removeItem(productId);
  } else {
    try {
      successMessage.value = '';
      errorMessage.value = '';
      await cartStore.updateCartItem(productId, newQuantity);
    } catch (error) {
      errorMessage.value = error.message || 'Failed to update quantity.';
      console.error('Error updating quantity:', error);
    }
  }
};

// Hàm xóa sản phẩm khỏi giỏ hàng
const removeItem = async (productId) => {
  try {
    successMessage.value = '';
    errorMessage.value = '';
    await cartStore.removeCartItem(productId);
  } catch (error) {
    errorMessage.value = error.message || 'Failed to remove item.';
    console.error('Error removing item:', error);
  }
};

// Hàm xử lý khi nhấn "Proceed to Checkout"
// Kiểm tra đăng nhập trước khi cho phép thanh toán
const handleProceedToCheckout = async () => {
  // Kiểm tra trạng thái đăng nhập
  if (!authStore.isAuthenticated) {
    // Lưu đường dẫn hiện tại để quay lại sau khi đăng nhập
        router.push({
          path: '/login',
          query: { redirect: router.currentRoute.value.fullPath }
        });
    return;
  }
  
  // Nếu đã đăng nhập, hiển thị popup xác nhận
  showConfirmation.value = true;
};

// Hàm xác nhận xóa giỏ hàng (sau khi người dùng đồng ý trong popup)
const confirmCheckout = async () => {
  try {
    successMessage.value = '';
    errorMessage.value = '';
    await cartStore.clearCart(); // Gọi API để xóa giỏ hàng trên backend
    
    successMessage.value = 'Bạn đã thanh toán thành công! Giỏ hàng của bạn đã được xóa.';
    // Tùy chọn: Chuyển hướng người dùng đến trang chủ hoặc trang xác nhận đơn giản
    // router.push('/'); // Ví dụ: chuyển về trang chủ
    console.log('Checkout successful! Cart cleared.');
    showConfirmation.value = false; // Đóng popup
    // Sau khi thanh toán, có thể muốn reset cartStore hoặc fetch lại để cập nhật giao diện
    await cartStore.fetchUserCart(); // Cập nhật lại giỏ hàng (sẽ trống)
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

// Hàm xử lý khi nhấn "Clear Cart" (xóa toàn bộ giỏ hàng)
const handleClearCart = async () => {
  // Có thể thêm một xác nhận nhỏ trước khi xóa nếu muốn
  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
    try {
      successMessage.value = '';
      errorMessage.value = '';
      await cartStore.clearCart(); // Gọi API để xóa giỏ hàng trên backend
      successMessage.value = 'Giỏ hàng của bạn đã được xóa sạch.';
      console.log('Cart cleared via "Clear Cart" button.');
    } catch (error) {
      errorMessage.value = error.message || 'Failed to clear cart.';
      console.error('Error clearing cart:', error);
    }
  }
};
</script>

<template>
  <div class="cart-page container my-5">
    <h2 class="text-center mb-4">Giỏ hàng của bạn</h2>

    <div v-if="successMessage" class="alert alert-success" role="alert">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>

    <div v-if="isEmpty" class="alert alert-info text-center">
      Giỏ hàng của bạn trống. <router-link to="/menu">Tiếp tục mua sắm</router-link>.
    </div>

    <div v-else>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Sản phẩm</th>
              <th scope="col">Ảnh</th>
              <th scope="col">Giá</th>
              <th scope="col">Số lượng</th>
              <th scope="col">Tổng</th>
              <th scope="col">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in cartItems" :key="item.product_id">
              <th scope="row">{{ index + 1 }}</th>
              <td>{{ item.product.name }}</td>
              <td>
                <img :src="item.product.image_url" alt="Product Image" class="img-fluid rounded" style="width: 80px; height: 80px; object-fit: cover;">
              </td>
              <td>{{ item.product.price }} VND</td>
              <td>
                <input
                  type="number"
                  class="form-control"
                  style="width: 80px;"
                  v-model.number="item.quantity"
                  @change="updateQuantity(item.product_id, item.quantity)"
                  min="1"
                  :max="item.product.stock || 999"
                >
              </td>
              <td>{{ item.quantity * item.product.price }} VND</td>
              <td>
                <button @click="removeItem(item.product_id)" class="btn btn-danger btn-sm">
                  <i class="fas fa-trash-alt"></i> Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="d-flex justify-content-end align-items-center mt-4">
        <h4 class="me-3">Tổng số lượng: {{ totalQuantity }}</h4>
        <h3 class="me-3">Tổng cộng: {{ subtotal }} VND</h3>
        <button @click="handleClearCart" class="btn btn-outline-danger me-2">
          <i class="fas fa-trash-alt"></i> Xóa giỏ hàng
        </button>
        <button @click="handleProceedToCheckout" class="btn btn-primary" :disabled="isEmpty">
          <i class="fas fa-money-check-alt"></i> 
          {{ authStore.isAuthenticated ? 'Tiến hành thanh toán' : 'Đăng nhập để thanh toán' }}
        </button>
      </div>
      
      <!-- Thông báo yêu cầu đăng nhập -->
      <div v-if="!authStore.isAuthenticated && !isEmpty" class="alert alert-warning mt-3 text-end">
        <i class="fas fa-info-circle"></i> 
        Vui lòng <router-link :to="{ path: '/login', query: { redirect: router.currentRoute.value.fullPath } }" class="alert-link">đăng nhập</router-link> 
        để tiến hành thanh toán.
      </div>
    </div>

    <div v-if="showConfirmation" class="modal-overlay">
      <div class="modal-content">
        <h4>Xác nhận thanh toán</h4>
        <p>Bạn có chắc chắn muốn tiến hành thanh toán các mặt hàng trong giỏ? Giỏ hàng sẽ được xóa sau khi thanh toán.</p>
        <div class="d-flex justify-content-end">
          <button @click="cancelConfirmation" class="btn btn-secondary me-2">Hủy</button>
          <button @click="confirmCheckout" class="btn btn-success">Xác nhận thanh toán</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Modal Overlay Styles */
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
