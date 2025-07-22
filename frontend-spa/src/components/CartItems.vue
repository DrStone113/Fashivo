<template>
  <div class="cart-items-list">
    <div v-if="cartError" class="alert alert-danger" role="alert">
      {{ cartError }}
    </div>
    <div v-if="isLoadingCart" class="alert alert-info text-center">Đang tải giỏ hàng...</div>
    <div v-else-if="isEmpty" class="alert alert-info text-center">
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
              <td>{{ item.product?.name || 'Sản phẩm không rõ' }}</td>
              <td>
                <img :src="item.product?.image_url || '/public/image/BLANK.jpg'" alt="Product Image" class="img-fluid rounded" style="width: 80px; height: 80px; object-fit: cover;">
              </td>
              <td>{{ Number(item.product?.price || 0).toFixed(2) }} VND</td>
              <td>
                <input
                  type="number"
                  class="form-control"
                  style="width: 80px;"
                  v-model.number="item.quantity"
                  @change="updateQuantity(item.product_id, item.quantity)"
                  min="1"
                  :max="item.product?.stock || 999"
                >
              </td>
              <td>{{ Number(item.quantity * (item.product?.price || 0)).toFixed(2) }} VND</td>
              <td>
                <button @click="removeItem(item.product_id)" class="btn btn-danger btn-sm" :disabled="isLoadingCart">
                  <i class="fas fa-trash-alt"></i> Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="d-flex justify-content-end mt-3">
        <button @click="handleClearCart" class="btn btn-outline-danger" :disabled="isLoadingCart">
          <i class="fas fa-trash-alt"></i> Xóa toàn bộ giỏ hàng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'; // Import watch
import { useCartStore } from '@/store/cartStore';

const cartStore = useCartStore();

const successMessage = ref('');
const errorMessage = ref('');

const cartItems = computed(() => cartStore.items);
const isEmpty = computed(() => cartStore.isEmpty);
const isLoadingCart = computed(() => cartStore.isLoadingCart); // Trạng thái loading từ store
const cartError = computed(() => cartStore.cartError); // Trạng thái lỗi từ store

onMounted(() => {
  cartStore.fetchUserCart(); // Gọi fetchUserCart khi component được mount
});

const updateQuantity = async (productId, newQuantity) => {
  if (newQuantity <= 0) {
    removeItem(productId);
    return;
  }
  try {
    successMessage.value = '';
    errorMessage.value = '';
    await cartStore.updateCartItem(productId, newQuantity); // Sử dụng updateCartItem
  } catch (error) {
    errorMessage.value = error.message || 'Failed to update quantity.';
    console.error('Error updating quantity:', error);
  }
};

const removeItem = async (productId) => {
  try {
    successMessage.value = '';
    errorMessage.value = '';
    await cartStore.removeCartItem(productId); // Sử dụng removeCartItem
  } catch (error) {
    errorMessage.value = error.message || 'Failed to remove item.';
    console.error('Error removing item:', error);
  }
};

const handleClearCart = async () => {
  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
    try {
      successMessage.value = '';
      errorMessage.value = '';
      await cartStore.clearCart(); // Sử dụng clearCart
      successMessage.value = 'Giỏ hàng của bạn đã được xóa sạch.';
    } catch (error) {
      errorMessage.value = error.message || 'Failed to clear cart.';
      console.error('Error clearing cart:', error);
    }
  }
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
/* Specific styles for CartItems.vue */
</style>