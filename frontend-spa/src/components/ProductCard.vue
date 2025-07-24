<template>
  <div 
    class="product-card" @click="goToProductDetails"
  >
    <div class="product-image-container">
      <img 
        :src="product.image_url || '/public/image/products/BLANK.jpg.png'" 
        :alt="product.name"
        class="product-image"
        onerror="this.onerror=null;this.src='/public/image/products/BLANK.jpg.png';"
      >
      
      <div v-if="isProductUnavailable" class="unavailable-overlay">
        <span class="unavailable-text">Hết hàng</span>
      </div>
      
      <div v-if="isAdmin" class="admin-actions">
        <button 
          @click.stop="editProduct" 
          class="admin-action-btn edit-product-btn"
          title="Edit Product"
        >
          Edit
        </button>

        <button 
          @click.stop="addProduct" 
          class="admin-action-btn add-product-btn"
          title="Add New Product"
        >
          Add
        </button>

        <button 
          @click.stop="confirmDeleteProduct" 
          class="admin-action-btn delete-product-btn"
          title="Delete Product"
        >
          Delete
        </button>
      </div>
    </div>
    
    <div class="product-info">
      <div class="product-details">
        <p class="product-type">{{ product.type }}</p>
        <h3 class="product-name">{{ product.name }}</h3>
      </div>

      <div class="product-footer">
        <div class="footer-info">
          <p class="product-price">{{ formatPrice(product.price) }}</p>
          <span class="stock-info" :class="stockClass">
            {{ product.stock > 0 && product.available ? `Còn hàng (${product.stock})` : 'Hết hàng' }}
          </span>
        </div>

        <div class="footer-actions">
          <button 
            @click.stop="emitAddToCart" 
            class="action-btn add-to-cart-btn"
            :disabled="isProductUnavailable"
          >
            <i class="fas fa-shopping-cart"></i>
            <span>Add to Cart</span>
          </button>
          <button 
            @click.stop="emitBuyNow" 
            class="action-btn buy-now-btn"
            :disabled="isProductUnavailable"
          >
            <i class="fas fa-bolt"></i>
            <span>View Cart</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore'; 
import productService from '@/services/product.service'; 

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  currentPage: { // THÊM PROP NÀY VÀO PRODUCTCARD.VUE
    type: Number,
    default: 1
  }
});

const emit = defineEmits(['add-to-cart', 'buy-now', 'delete-product']); 

const router = useRouter();
const authStore = useAuthStore(); 

const isAdmin = computed(() => {
  return authStore.user && authStore.user.role === 'admin';
});

const isProductUnavailable = computed(() => {
  return props.product.stock === 0 || !props.product.available;
});

const stockClass = computed(() => ({
  'in-stock': props.product.stock > 0 && props.product.available,
  'out-of-stock': props.product.stock === 0 || !props.product.available
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
  if (!isProductUnavailable.value) {
    emit('add-to-cart', props.product);
  }
};

const emitBuyNow = () => {
  if (!isProductUnavailable.value) {
    emit('buy-now', props.product);
  }
};

const editProduct = () => {
  if (props.product && props.product.id) {
    console.log('Attempting to navigate to Admin Edit Product:', props.product.id, 'from page:', props.currentPage);
    router.push({ 
      name: 'AdminEditProduct', 
      params: { id: props.product.id },
      query: { fromPage: props.currentPage } // TRUYỀN fromPage QUA QUERY PARAMETER
    }); 
  } else {
    console.warn('Product or product ID is missing for edit. Cannot navigate.');
  }
};

const addProduct = () => {
  console.log('Navigating to Add Product Page');
  router.push({ name: 'AddProduct' }); 
};

const confirmDeleteProduct = async () => {
  const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${props.product.name}" không?`);
  
  if (isConfirmed) {
    try {
      await productService.deleteProduct(props.product.id);
      alert('Sản phẩm đã được xóa thành công!');
      emit('delete-product', props.product.id); 
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      alert('Không thể xóa sản phẩm: ' + (error.message || 'Lỗi không xác định.'));
    }
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

.unavailable-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.unavailable-text {
  color: white;
  font-weight: bold;
  font-size: 1.5em;
  padding: 10px 20px;
  border: 2px solid white;
  border-radius: 5px;
  text-transform: uppercase;
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

.product-footer {
  position: relative;
  min-height: 52px; 
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
  pointer-events: none; 
}

.product-card-modern:hover .footer-info {
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
}

.product-card-modern:hover .footer-actions {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto; 
}

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

.admin-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex; 
  gap: 8px; 
  z-index: 10;
}

.admin-action-btn {
  border: none;
  border-radius: 50%; 
  width: 36px;
  height: 36px;
  
  background-size: 90%;
  background-repeat: no-repeat; 
  background-position: center; 

  display: flex; 
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  padding: 0; 
  color: transparent;
}

.admin-action-btn:hover {
  transform: scale(1.1);
}

.edit-product-btn {
  background-image: url('../assets/add-product1.png');
  background-color: white; 
}

.edit-product-btn:hover {
  background-color: #f0f0f0; 
}

.add-product-btn {
  background-image: url('../assets/textile-printing.png');
  background-color: white; 
}

.add-product-btn:hover {
  background-color: #f0f0f0; 
}

.delete-product-btn {
  background-image: url('../assets/delete-product.png');
  background-color: white; 
}

.delete-product-btn:hover {
  background-color: #f0f0f0; 
}
</style>
