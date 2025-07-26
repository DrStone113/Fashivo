<template>
  <div 
    class="product-card-styled"
    @click="goToProductDetails"
  >
    <div class="product-image-container-styled">
      <img 
        :src="product.image_url || '/public/image/products/BLANK.jpg.png'" 
        :alt="product.name"
        class="product-image-styled"
        onerror="this.onerror=null;this.src='/public/image/products/BLANK.jpg.png';"
      >
      <span class="stock-info-styled" :class="stockClass">
        {{ product.stock > 0 && product.available ? `In Stock (${product.stock})` : 'Out of Stock' }}
      </span>
      
      <div v-if="isProductUnavailable" class="unavailable-overlay-styled">
        <span class="unavailable-text-styled">Out of Stock</span>
      </div>
      
      <div v-if="isAdmin" class="admin-actions-styled">
        <button 
          @click.stop="editProduct" 
          class="admin-action-btn-styled edit-product-btn-styled"
          title="Edit Product"
        >
          <i class="fas fa-edit"></i> 
        </button>

        <button 
          @click.stop="addProduct" 
          class="admin-action-btn-styled add-product-btn-styled"
          title="Add New Product"
        >
          <i class="fas fa-plus"></i> 
        </button>

        <button 
          @click.stop="confirmDeleteProduct" 
          class="admin-action-btn-styled delete-product-btn-styled"
          title="Delete Product"
        >
          <i class="fas fa-trash-alt"></i> 
        </button>
      </div>
    </div>
    
    <div class="product-info-styled">
      <div class="product-details-styled">
        <p class="product-type-styled">{{ product.type }}</p>
        <h3 class="product-name-styled">{{ product.name }}</h3>
      </div>

      <div class="product-footer-styled">
        <div class="footer-info-styled">
          <p class="product-price-styled">{{ formatCurrency(product.price) }}</p>
        </div>

        <div class="footer-actions-styled">
          <button 
            @click.stop="emitAddToCart" 
            class="action-btn-styled add-to-cart-btn-styled"
            :disabled="isProductUnavailable"
          >
            <i class="fas fa-shopping-cart me-2"></i>
            <span>Add to Cart</span>
          </button>
          <button 
            @click.stop="emitBuyNow" 
            class="action-btn-styled buy-now-btn-styled"
            :disabled="isProductUnavailable"
          >
            <i class="fas fa-bolt me-2"></i>
            <span>Buy</span>
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
import { useQueryClient } from '@tanstack/vue-query'; 
import { formatCurrency } from '@/utils/formatters';

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  currentPage: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(['add-to-cart', 'buy-now', 'delete-product']); 

const router = useRouter();
const authStore = useAuthStore(); 
const queryClient = useQueryClient(); 

const isAdmin = computed(() => {
  return authStore.user && authStore.user.role === 'admin';
});

const isProductUnavailable = computed(() => {
  return props.product.stock === 0 || !props.product.available;
});

const stockClass = computed(() => ({
  'in-stock-styled': props.product.stock > 0 && props.product.available,
  'out-of-stock-styled': props.product.stock === 0 || !props.product.available
}));

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
      query: { fromPage: props.currentPage }
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
  // Replace window.confirm with a custom modal if possible
  const isConfirmed = window.confirm(`Are you sure you want to delete the product "${props.product.name}"?`);
  
  if (isConfirmed) {
    try {
      await productService.deleteProduct(props.product.id);
      alert('Product deleted successfully!'); // Replace with a notification modal
      
      queryClient.invalidateQueries(['products']); 

    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Could not delete product: ' + (error.message || 'Unknown error.')); // Replace with an error notification modal
    }
  }
};
</script>

<style scoped>
/* General Product Card Styling */
.product-card-styled {
  background: white;
  border-radius: 12px; /* Less rounded corners */
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); /* Lighter shadow */
  transition: all 0.3s ease; /* Faster transition */
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%; /* Ensure card fills its container height */
  font-family: 'Poppins', sans-serif; /* Poppins font */
}

.product-card-styled:hover {
  transform: translateY(-5px); /* Less lift */
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15); /* Less deep shadow */
  border: 2px solid #a855f7; /* Thinner border on hover */
}

/* Product Image Container */
.product-image-container-styled {
  position: relative;
  aspect-ratio: 1 / 1; /* Square aspect ratio */
  overflow: hidden;
  flex-shrink: 0; /* Prevent shrinking */
  border-bottom: 1px solid #eee; /* Subtle separator */
}

.product-image-styled {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.product-card-styled:hover .product-image-styled {
  transform: scale(1.1); /* Zoom effect on hover */
}

/* Unavailable Overlay */
.unavailable-overlay-styled {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Lighter overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  backdrop-filter: blur(4px); /* Less blur */
  -webkit-backdrop-filter: blur(4px);
}

.unavailable-text-styled {
  color: #333;
  font-weight: 700;
  font-size: 1.5em;
  padding: 12px 28px;
  border: 3px solid #333;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  background-color: rgba(255, 255, 255, 0.7);
}

/* Product Info Section */
.product-info-styled {
  padding: 15px; /* Less padding */
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-details-styled {
  margin-bottom: 15px; /* More space */
}

.product-type-styled {
  color: #888;
  font-size: 0.85rem; /* Slightly larger */
  margin-bottom: 6px; /* More space */
  text-transform: uppercase; /* Uppercase type */
  letter-spacing: 0.5px;
}

.product-name-styled {
  font-size: 0.9rem; /* Even smaller name */
  font-weight: 600; /* Less bold */
  color: #170f59;
  line-height: 1.2;
  margin: 0;
  text-overflow: ellipsis; /* Add ellipsis for long names */
  white-space: nowrap;
  overflow: hidden;
  text-align: center;
}

/* Product Footer (Price & Actions) */
.product-footer-styled {
  position: relative;
  min-height: 50px; /* Decreased height */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.footer-info-styled, .footer-actions-styled {
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.footer-info-styled {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-actions-styled {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  gap: 8px; /* Less space between buttons */
  opacity: 0;
  transform: translateY(10px); /* Start a bit lower */
  pointer-events: none; 
}

.product-card-styled:hover .footer-info-styled {
  opacity: 0;
  transform: translateY(-10px); /* Move up less */
  pointer-events: none;
}

.product-card-styled:hover .footer-actions-styled {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto; 
}

.product-price-styled {
  font-size: 1rem; /* Final price reduction */
  font-weight: 700; /* Less bold */
  color: #ec4899; /* Vibrant pink */
  margin: 0;
}

.stock-info-styled {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.75rem; /* Final stock info reduction */
  padding: 3px 8px;
  border-radius: 6px; /* Less rounded */
  font-weight: 600;
  text-transform: uppercase;
  z-index: 5;
  color: white;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}

.in-stock-styled {
  background-color: rgba(26, 94, 32, 0.8); /* Dark green with transparency */
}

.out-of-stock-styled {
  display: none;
}

/* Action Buttons (Add to Cart, Buy Now) */
.action-btn-styled {
  flex: 1;
  padding: 8px 6px; /* Even smaller padding */
  border: none;
  border-radius: 8px; /* Less rounded */
  font-size: 0.75rem; /* Even smaller font */
  font-weight: 600; /* Less bold */
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px; /* Less space between icon and text */
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.add-to-cart-btn-styled {
  background: linear-gradient(45deg, #f0f2ff, #e0e2ff); /* Light blue gradient */
  color: #6a11cb; /* Purple text */
  border: 1px solid #d9dfff;
}

.add-to-cart-btn-styled:hover:not(:disabled) {
  background: linear-gradient(45deg, #e0e2ff, #f0f2ff); /* Reverse gradient on hover */
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.2);
}

.buy-now-btn-styled {
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%); /* Purple to Blue Gradient */
  color: white;
  border: none;
}

.buy-now-btn-styled:hover:not(:disabled) {
  background: linear-gradient(45deg, #a855f7, #ec4899); /* Reverse gradient on hover */
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.2);
}

.action-btn-styled:disabled {
  background: #e9ecef;
  color: #adb5bd;
  cursor: not-allowed;
  border-color: #dee2e6;
  box-shadow: none;
}

/* Admin Actions */
.admin-actions-styled {
  position: absolute;
  top: 15px; /* More space from top */
  right: 15px; /* More space from right */
  display: flex; 
  gap: 10px; /* More space between buttons */
  z-index: 10;
}

.admin-action-btn-styled {
  border: none;
  border-radius: 50%; 
  width: 40px; /* Larger buttons */
  height: 40px;
  background-color: rgba(255, 255, 255, 0.9); /* Slightly transparent white background */
  display: flex; 
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2); /* Stronger shadow */
  transition: all 0.2s ease;
  padding: 0; 
  color: #6a11cb; /* Purple icon color */
  font-size: 1.1rem; /* Larger icon size */
}

.admin-action-btn-styled:hover {
  transform: scale(1.15); /* More pronounced scale on hover */
  background-color: #fff; /* Solid white on hover */
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.3);
}

/* Responsive adjustments */
@media (max-width: 1200px) { /* Adjust for larger screens if needed */
  .product-name-styled {
    font-size: 1.1rem;
  }
  .product-price-styled {
    font-size: 1.3rem;
  }
  .action-btn-styled {
    font-size: 0.85rem;
    padding: 10px 8px;
  }
}

@media (max-width: 991.98px) { /* Medium devices (md) */
  .product-card-styled {
    border-radius: 15px;
  }
  .product-image-container-styled {
    height: 250px; /* Adjust image height for md */
  }
  .product-info-styled {
    padding: 15px;
  }
  .product-name-styled {
    font-size: 1rem;
  }
  .product-price-styled {
    font-size: 1.2rem;
  }
  .action-btn-styled {
    font-size: 0.8rem;
    padding: 8px 5px;
  }
  .admin-action-btn-styled {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
}

@media (max-width: 767.98px) { /* Small devices (sm) */
  .product-card-styled {
    border-radius: 12px;
  }
  .product-image-container-styled {
    height: 220px; /* Adjust image height for sm */
  }
  .product-info-styled {
    padding: 12px;
  }
  .product-name-styled {
    font-size: 0.95rem;
  }
  .product-price-styled {
    font-size: 1.1rem;
  }
  .action-btn-styled {
    font-size: 0.75rem;
    padding: 6px 3px;
    gap: 4px;
  }
  .admin-action-btn-styled {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
    top: 10px;
    right: 10px;
    gap: 6px;
  }
  .unavailable-text-styled {
    font-size: 1.2em;
    padding: 8px 15px;
  }
}

@media (max-width: 575.98px) { /* Extra small devices (xs) */
  .product-image-container-styled {
    height: 280px; /* Taller for single column view */
  }
  .product-name-styled {
    font-size: 1.05rem;
  }
  .product-price-styled {
    font-size: 1.2rem;
  }
}
</style>
