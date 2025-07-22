<template>
  <div class="product-detail-page container my-5">
    <div v-if="isLoading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading product details...</p>
    </div>
    <div v-else-if="isError" class="alert alert-danger text-center my-5">
      Error loading product details: {{ error?.message || 'Unknown error' }}
      <p v-if="error?.message?.includes('Invalid product ID')">Please ensure the URL contains a valid product ID (e.g., /product/1).</p>
    </div>
    <div v-else-if="product" class="row">
      <div class="col-md-6 mb-4">
        <img :src="product.image_url || '/public/image/BLANK.jpg'" class="img-fluid rounded shadow-sm"
          alt="Product Image">
      </div>
      <div class="col-md-6">
        <h1 class="display-5 fw-bold mb-3">{{ product.name }}</h1>
        <p class="lead text-muted">{{ product.description }}</p>
        <hr>
        <div class="mb-3">
          <span class="badge bg-secondary me-2">Type: {{ product.type }}</span>
          <span class="badge bg-info text-dark">Category: {{ product.category_name }}</span>
        </div>
        <div class="mb-3">
          <p class="fs-4 fw-bold">Price: {{ product.price }} VND</p>
          <p class="fs-5">Availability:
            <span :class="{ 'text-success': product.stock > 0, 'text-danger': product.stock === 0 }">
              {{ product.stock > 0 ? `In Stock (${product.stock} items)` : 'Out of Stock' }}
            </span>
          </p>
        </div>
        <div class="d-flex align-items-center mb-4">
          <label for="quantity" class="form-label me-2 mb-0">Quantity:</label>
          <input type="number" id="quantity" class="form-control me-2" style="width: 120px;" v-model.number="quantity"
            min="1" :max="product.stock">
          <button class="btn btn-primary btn-lg" @click="addToCart" :disabled="product.stock === 0">
            <i class="fas fa-cart-plus me-2"></i>Add to Cart
          </button>
        </div>
        <div v-if="successMessage" class="alert alert-success mt-3" role="alert">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">
          {{ errorMessage }}
        </div>
        <router-link to="/menu" class="btn btn-outline-secondary mt-3">Back to Products</router-link>
      </div>
    </div>
    <div v-else class="alert alert-warning text-center my-5">
      Product not found or invalid ID.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import useProduct from '@/composables/useProduct';
import { useCartStore } from '@/store/cartStore';

const route = useRoute();
const cartStore = useCartStore();

// Create a computed property for the product ID from the route params
const productIdFromRoute = computed(() => {
  const id = route.params.id;
  if (id && typeof id === 'string' && id.trim() !== '') {
    const numId = Number(id);
    return isNaN(numId) ? null : numId;
  }
  return null;
});

const { product, isLoading, isError, error } = useProduct().fetchProduct(productIdFromRoute);

const quantity = ref(1);
const successMessage = ref('');
const errorMessage = ref('');

// Watch for product changes to reset quantity and messages
watch(product, (newProduct) => {
  if (newProduct) {
    quantity.value = 1;
    successMessage.value = '';
    errorMessage.value = '';
  }
}, { immediate: true });

const addToCart = async () => {
  if (!product.value) {
    errorMessage.value = 'Cannot add to cart: Product data not loaded.';
    return;
  }

  if (quantity.value <= 0 || quantity.value > product.value.stock) {
    errorMessage.value = `Please enter a quantity between 1 and ${product.value.stock}.`;
    successMessage.value = '';
    return;
  }

  try {
    // Pass the actual product object with quantity
    await cartStore.addItem(product.value, quantity.value);
    successMessage.value = `${quantity.value} x ${product.value.name} added to cart!`;
    errorMessage.value = '';
  } catch (err) {
    console.error('Failed to add to cart:', err);
    errorMessage.value = err.message || 'Failed to add product to cart.';
    successMessage.value = '';
  }
};
</script>

<style scoped>
.img-fluid {
  max-width: 100%;
  height: auto;
}
</style>
