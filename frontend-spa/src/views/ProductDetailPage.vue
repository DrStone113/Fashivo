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
        <!-- Fixed size image container -->
        <div class="product-image-container">
          <div v-if="!product.image_url || imageError" class="no-image-placeholder">
            <span>NO IMAGE</span>
          </div>
          <img 
            v-else
            :src="product.image_url" 
            :alt="product.name"
            class="product-image-styled"
            @load="onImageLoad"
            @error="onImageError"
          >
          <div v-if="imageLoading && !imageError" class="image-loading-overlay">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading image...</span>
            </div>
          </div>
        </div>
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
          <p class="fs-4 fw-bold">Price: {{ formatCurrency(product.price) }}</p>
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
import { formatCurrency } from '@/utils/formatters';

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
const imageLoading = ref(true);
const imageError = ref(false);

// Watch for product changes to reset quantity and messages
watch(product, (newProduct) => {
  if (newProduct) {
    quantity.value = 1;
    successMessage.value = '';
    errorMessage.value = '';
    imageLoading.value = true;
    imageError.value = false;
  }
}, { immediate: true });

const onImageLoad = () => {
  imageLoading.value = false;
  imageError.value = false;
};

const onImageError = () => {
  imageLoading.value = false;
  imageError.value = true;
  console.error('Failed to load product image');
};

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
.product-image-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  height: 500px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background-color: #f8f9fa;
}

.product-image-styled {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

.product-image-styled:hover {
  transform: scale(1.05);
}

.image-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.no-image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  color: #a0a0a0;
  font-size: 1.5rem;
  font-weight: 600;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .product-image-container {
    max-width: 400px;
    height: 400px;
  }
}

@media (max-width: 576px) {
  .product-image-container {
    max-width: 100%;
    height: 350px;
  }
}

@media (max-width: 480px) {
  .product-image-container {
    height: 300px;
  }
}
</style>
