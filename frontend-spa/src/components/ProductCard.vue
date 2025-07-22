<template>
  <div 
    class="product-card-modern"
    @click="goToProductDetails"
  >
    <div class="product-image-container">
      <img 
        :src="product.image_url || '/public/image/products/BLANK.jpg.png'" 
        :alt="product.name"
        class="product-image"
        onerror="this.onerror=null;this.src='/public/image/products/BLANK.jpg.png';"
      >
      <div v-if="product.stock === 0" class="out-of-stock-badge">
        Out of Stock
      </div>
    </div>
    
    <div class="product-info">
      <div class="product-details">
        <p class="product-type">{{ product.type }}</p>
        <h3 class="product-name">{{ product.name }}</h3>
      </div>

      <!-- This footer section now contains both info and actions, which swap on hover -->
      <div class="product-footer">
        <!-- Default Info (Price & Stock) -->
        <div class="footer-info">
          <p class="product-price">{{ formatPrice(product.price) }}</p>
          <span class="stock-info" :class="stockClass">
            {{ product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock' }}
          </span>
        </div>

        <!-- Hover Actions (Buttons) -->
        <div class="footer-actions">
          <button 
            @click.stop="emitAddToCart" 
            class="action-btn add-to-cart-btn"
            :disabled="product.stock === 0"
          >
            <i class="fas fa-shopping-cart"></i>
            <span>Add to Cart</span>
          </button>
          <button 
            @click.stop="emitBuyNow" 
            class="action-btn buy-now-btn"
            :disabled="product.stock === 0"
          >
            <i class="fas fa-bolt"></i>
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['add-to-cart', 'buy-now']);

const router = useRouter();

const stockClass = computed(() => ({
  'in-stock': props.product.stock > 0,
  'out-of-stock': props.product.stock === 0
}));

const formatPrice = (price) => {
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) {
    return '';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(numericPrice);
};

const goToProductDetails = () => {
  if (props.product && props.product.id) {
    router.push(`/product/${props.product.id}`);
  }
};

const emitAddToCart = () => {
  if (props.product.stock > 0) {
    emit('add-to-cart', props.product);
  }
};

const emitBuyNow = () => {
  if (props.product.stock > 0) {
    emit('buy-now', props.product);
  }
};
</script>

<style scoped>
.product-card-modern {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
}

.product-card-modern:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.product-image-container {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card-modern:hover .product-image {
  transform: scale(1.05);
}

.product-info {
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-details {
  margin-bottom: 12px;
}

.product-type {
  color: #888;
  font-size: 0.8rem;
  margin-bottom: 4px;
  text-transform: capitalize;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  margin: 0;
}

/* --- HOVER EFFECT LOGIC --- */
.product-footer {
  position: relative;
  min-height: 52px; /* Set a minimum height to prevent layout shifts */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.footer-info, .footer-actions {
  transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
}

.footer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  gap: 8px;
  opacity: 0;
  transform: translateY(10px);
  pointer-events: none; /* Prevent interaction when hidden */
}

.product-card-modern:hover .footer-info {
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
}

.product-card-modern:hover .footer-actions {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto; /* Allow interaction when visible */
}
/* --- END HOVER EFFECT LOGIC --- */

.product-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #667eea;
  margin: 0;
}

.stock-info {
  font-size: 0.8rem;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.in-stock {
  background-color: #e6f7f0;
  color: #0d8a4d;
}

.out-of-stock {
  background-color: #fde2e4;
  color: #e11d48;
}

.out-of-stock-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(225, 29, 72, 0.8);
  backdrop-filter: blur(5px);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.action-btn {
  flex: 1;
  padding: 10px 5px;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.add-to-cart-btn {
  background: #f0f2ff;
  color: #667eea;
  border: 1px solid #d9dfff;
}

.buy-now-btn {
  background: #667eea;
  color: white;
  border: 1px solid #667eea;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.action-btn:disabled {
  background: #e9ecef;
  color: #adb5bd;
  cursor: not-allowed;
  border-color: #dee2e6;
}
</style>
