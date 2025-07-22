<template>
  <div 
    class="card h-100 shadow-sm product-card" 
    @click="goToProductDetails"
    style="cursor: pointer;"
  >
    <img :src="product.image_url || '/public/image/BLANK.jpg'" class="card-img-top" alt="Product Image"
      style="height: 200px; object-fit: cover;">
    <div class="card-body d-flex flex-column">
      <h5 class="card-title">{{ product.name }}</h5>
      <p class="card-text text-muted mb-1">Type: {{ product.type }}</p>
      <p class="card-text text-muted mb-2">Stock: {{ product.stock }}</p>
      <p class="card-text fw-bold fs-5 mt-auto">{{ product.price }} VND</p>
      
      <!-- Buy button - stops click propagation -->
      <button 
        class="btn btn-success w-100 mt-2" 
        @click.stop="buyProduct(product)"
        :disabled="product.stock === 0"
      >
        <i class="fas fa-shopping-bag me-1"></i> Buy Now
      </button>
      
      <div v-if="product.stock === 0" class="text-danger mt-2">Out of Stock</div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useCartStore } from '@/store/cartStore';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const cartStore = useCartStore();

const goToProductDetails = () => {
  router.push(`/product/${props.product.id}`);
};

const buyProduct = async (product) => {
  if (product.stock > 0) {
    try {
      // Add product to cart with quantity 1
      await cartStore.addItem(product, 1);
      
      // Redirect to cart page for immediate checkout
      router.push('/cart');
    } catch (error) {
      alert('Error adding product to cart: ' + error.message);
    }
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

.product-card {
  transition: all 0.3s ease;
}

.product-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-3px);
}

.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: scale(1.02);
}
</style>
