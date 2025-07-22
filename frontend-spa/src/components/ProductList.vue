<template>
  <div class="product-list-container">
    <h4 class="mb-4">Our Products</h4>
    <div v-if="products.length === 0" class="alert alert-warning text-center my-5">
      No products found.
    </div>
    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
      <div class="col" v-for="(product, index) in products" :key="product.id">
        <ProductCard :product="product" @click="selectProduct(index)" />
      </div>
    </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'; // Import tường minh
import ProductCard from './ProductCard.vue';
// Xóa các import và logic không cần thiết cho ProductList:
// import MainPagination from './MainPagination.vue'; // Không dùng ở đây
// import useProduct from '@/composables/useProduct'; // Không dùng ở đây

const props = defineProps({
  products: {
    type: Array,
    required: true // products là prop bắt buộc
  },
  // Dành cho v-model:selected-index từ component cha (MenuPage.vue)
  selectedIndex: {
    type: Number,
    default: -1
  }
});

// Định nghĩa emit cho v-model:selected-index
const emit = defineEmits(['update:selectedIndex']);

// Hàm để cập nhật selectedIndex khi một sản phẩm được chọn
const selectProduct = (index) => {
  emit('update:selectedIndex', index);
};
</script>

<style scoped>
/* Giữ nguyên các style hiện có */
/* Add any specific styles for product list here */
</style>