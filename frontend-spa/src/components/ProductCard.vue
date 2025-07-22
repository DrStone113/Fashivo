//C:\DVWEB\mergre\ct313hm02-project-DrStone113\frontend-spa\src\components\ProductCard.vue
<template>
  <div class="card h-100 shadow-sm">
    <img :src="product.image_url || '/public/image/BLANK.jpg'" class="card-img-top" alt="Product Image"
      style="height: 200px; object-fit: cover;">
    <div class="card-body d-flex flex-column">
      <h5 class="card-title">{{ product.name }}</h5>
      <p class="card-text text-muted mb-1">Type: {{ product.type }}</p>
      <p class="card-text text-muted mb-2">Stock: {{ product.stock }}</p>
      <p class="card-text fw-bold fs-5 mt-auto">{{ product.price }} VND</p>
      <div class="d-flex justify-content-between align-items-center">
        <button class="btn btn-primary" @click="addToCart(product)" :disabled="product.stock === 0">
          <i class="fas fa-cart-plus me-1"></i> Add to Cart
        </button>
        <router-link :to="`/product/${product.id}`" class="btn btn-outline-secondary">
          Details
        </router-link>
      </div>
      <div v-if="product.stock === 0" class="text-danger mt-2">Out of Stock</div>
    </div>
  </div>
</template>

<script setup>
//import { defineProps } from 'vue';
import { useCartStore } from '@/store/cartStore';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const cartStore = useCartStore();

const addToCart = (product) => {
  if (product.stock > 0) {
    cartStore.addItem(product, 1);
    alert(`${product.name} added to cart!`);
  } else {
    alert('Product is out of stock!');
  }
};
</script>

<style scoped>
.card {
  border: none;
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-5px);
}
</style>