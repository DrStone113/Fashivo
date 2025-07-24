<template>
  <section class="new-arrivals-section py-5">
    <div class="container">
      <div class="text-center mb-5">
        <h2 class="section-title-text">New Arrivals</h2>
        <p class="section-subtitle-text">Discover the latest trends and fresh styles</p>
      </div>

      <!-- Trạng thái đang tải -->
      <div v-if="isLoading" class="state-container loading-state">
        <div class="spinner-styled"></div>
        <p class="loading-text">Loading amazing products...</p>
      </div>

      <!-- Trạng thái lỗi -->
      <div v-else-if="isError" class="state-container error-state">
        <i class="fas fa-exclamation-triangle error-icon animate-shake-css"></i>
        <p class="error-message-text">{{ error?.message || 'Failed to load products' }}</p>
      </div>

      <!-- Trạng thái thành công và có sản phẩm -->
      <div v-else-if="products && products.length > 0">
        <div class="row g-4 justify-content-center">
          <div v-for="product in products" :key="product.id" class="col-lg-3 col-md-6 col-sm-10">
            <div class="product-card-styled">
              <div class="product-image-wrapper">
                <img :src="product.image_url" :alt="product.name" class="img-fluid product-image-styled" @error="setDefaultImage">
                <div class="product-overlay-styled">
                  <div class="product-actions-styled">
                    <button @click="addToCart(product)" class="btn-action-styled btn-primary-styled">
                      <i class="bi bi-cart-plus"></i>
                      <span>Thêm vào giỏ</span>
                    </button>
                    <button @click="viewProduct(product.id)" class="btn-action-styled btn-light-styled">
                      <i class="bi bi-eye"></i>
                      <span>Xem chi tiết</span>
                    </button>
                    <button @click="toggleWishlist(product)" class="btn-action-styled btn-light-styled">
                      <i class="bi" :class="product.isWishlisted ? 'bi-heart-fill text-danger' : 'bi-heart'"></i>
                      <span>{{ product.isWishlisted ? 'Đã thích' : 'Yêu thích' }}</span>
                    </button>
                  </div>
                </div>
                <!-- Các badge này sẽ hiển thị nếu backend trả về dữ liệu tương ứng -->
                <div v-if="product.isNew" class="product-badge-styled new-badge">NEW</div>
                <div v-if="product.discount" class="product-badge-styled discount-badge">-{{ product.discount }}%</div>
              </div>
              <div class="product-info-styled">
                <h3 class="product-name-styled">{{ product.name }}</h3>
                <p class="product-category-styled">{{ product.category?.name || 'Uncategorized' }}</p>
                <div class="product-price-styled">
                  <span class="current-price-styled">{{ formatCurrency(product.price) }}</span>
                  <span v-if="product.originalPrice" class="original-price-styled">{{ formatCurrency(product.originalPrice) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-5">
          <router-link to="/menu" class="btn-view-all">
            Xem tất cả sản phẩm
            <i class="bi bi-arrow-right ms-2"></i>
          </router-link>
        </div>
      </div>

      <!-- Trạng thái không có sản phẩm -->
      <div v-else class="state-container empty-state">
        <i class="fas fa-box-open empty-icon animate-pulse-slow-css"></i>
        <p class="empty-message-text">Chưa có sản phẩm mới nào. Vui lòng quay lại sau!</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/store/cartStore';
import useProduct from '@/composables/useProduct'; 
import { DEFAULT_IMAGE } from '@/constants'; 

const router = useRouter();
const cartStore = useCartStore();

const page = ref(1);
const filters = ref({
  sortBy: 'created_at',
  order: 'desc',
  limit: 4 
}); 

const { products, isLoading, isError, error } = useProduct().fetchProducts(page, filters);

const formatCurrency = (value) => {
  const numericValue = Number(value);
  if (isNaN(numericValue)) {
    return value;
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(numericValue);
};

const addToCart = (product) => {
  cartStore.addItem({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image_url, 
    quantity: 1
  });
};

const viewProduct = (productId) => {
  router.push(`/product/${productId}`);
};

const toggleWishlist = (product) => {
  product.isWishlisted = !product.isWishlisted;
};

const setDefaultImage = (event) => {
  event.target.src = DEFAULT_IMAGE;
};
</script>

<style scoped>
/* General Section Styling */
.new-arrivals-section {
  background: #f8f9fa; /* Light background */
  padding-top: 6rem;
  padding-bottom: 6rem;
  font-family: 'Poppins', sans-serif; /* Poppins font */
}

/* Section Titles */
.section-title-text {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
  background: linear-gradient(45deg, #6a11cb, #2575fc); /* Blue-purple gradient */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  display: inline-block;
  animation: scaleIn 0.8s ease-out;
}

.section-subtitle-text {
  font-size: 1.4rem;
  color: #555;
  margin-bottom: 4rem;
  opacity: 0.9;
  animation: fadeIn 1s ease-out 0.2s forwards;
  opacity: 0; /* Start hidden for animation */
}

/* Keyframe Animations (Included here for self-containment, but consider global if issues persist) */
@keyframes scaleIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

/* Product Card Styling */
.product-card-styled {
  background: white;
  border-radius: 20px; /* More rounded corners */
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); /* More prominent initial shadow */
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); /* Smoother transition */
  height: 100%; /* Ensure cards fill their column height */
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.product-card-styled:hover {
  transform: translateY(-15px) scale(1.02); /* Lift and slight scale on hover */
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3); /* Deeper shadow on hover */
  border: 3px solid #6a11cb; /* Purple border on hover */
}

.product-image-wrapper {
  position: relative;
  height: 300px; /* Fixed height for image area */
  overflow: hidden;
  flex-shrink: 0; /* Prevent image wrapper from shrinking */
}

.product-image-styled {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.product-card-styled:hover .product-image-styled {
  transform: scale(1.15); /* Zoom effect on hover */
}

.product-overlay-styled {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.9) 100%); /* Darker gradient overlay */
  display: flex;
  align-items: flex-end; /* Align content to the bottom */
  justify-content: center; /* Center horizontally */
  opacity: 0;
  transition: opacity 0.4s ease;
  padding: 20px;
  z-index: 1;
}

.product-card-styled:hover .product-overlay-styled {
  opacity: 1;
}

/* Product Actions (Buttons) */
.product-actions-styled {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px; /* Space between buttons */
}

.btn-action-styled {
  width: 100%;
  border-radius: 30px; /* Rounded buttons */
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px; /* Space between icon and text */
  border: none;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.btn-primary-styled {
  background: linear-gradient(45deg, #ec4899, #a855f7); /* Pink to Purple Gradient */
  color: white;
}

.btn-primary-styled:hover {
  background: linear-gradient(45deg, #a855f7, #ec4899); /* Reverse gradient on hover */
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.btn-light-styled {
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
}

.btn-light-styled:hover {
  background-color: #f0f2f5; /* Lighter background on hover */
  color: #6a11cb; /* Purple text on hover */
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

/* Product Badges (NEW, DISCOUNT) */
.product-badge-styled {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 6px 12px;
  border-radius: 25px; /* More rounded */
  font-size: 0.85rem;
  font-weight: 700;
  color: white;
  z-index: 2; /* Ensure badges are on top */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.new-badge {
  background: linear-gradient(45deg, #ff6b6b, #ff4c4c); /* Red gradient for NEW */
}

.discount-badge {
  background: linear-gradient(45deg, #4ecdc4, #20b2aa); /* Teal gradient for DISCOUNT */
}

/* Product Info */
.product-info-styled {
  padding: 20px;
  flex-grow: 1; /* Allow info section to grow */
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Space out name/category and price */
}

.product-name-styled {
  font-size: 1.35rem; /* Slightly larger name */
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #333;
  line-height: 1.3;
}

.product-category-styled {
  font-size: 0.95rem; /* Slightly larger category */
  color: #666;
  margin-bottom: 1rem;
}

.product-price-styled {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto; /* Push price to the bottom */
}

.current-price-styled {
  font-size: 1.5rem; /* Larger current price */
  font-weight: 800;
  color: #ec4899; /* Pink color for current price */
}

.original-price-styled {
  font-size: 1.1rem; /* Larger original price */
  color: #999;
  text-decoration: line-through;
}

.bi-heart-fill.text-danger {
  color: #ec4899 !important; /* Ensure heart color is pink */
}

/* State Containers (Loading, Error, Empty) */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 30px;
  text-align: center;
  background: linear-gradient(45deg, #e0f7fa, #e8f5e9); /* Light gradient background */
  border-radius: 20px;
  min-height: 500px;
  color: #555;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.state-container.loading-state {
  background: linear-gradient(45deg, #6a11cb, #2575fc); /* Darker gradient for loading */
  color: white;
}

.loading-text {
  font-size: 1.125rem;
  color: #fff;
  margin-top: 1rem;
}

.spinner-styled {
  width: 70px;
  height: 70px;
  border: 7px solid rgba(255, 255, 255, 0.3);
  border-top: 7px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 30px;
}

/* @keyframes spin (defined in global CSS or here) */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.state-container.error-state {
  color: #dc3545;
}

.error-icon {
  font-size: 5rem;
  color: #dc3545;
  margin-bottom: 1rem;
  animation: animate-shake-css 0.8s ease-in-out;
}

/* @keyframes animate-shake-css (defined in global CSS or here) */
@keyframes animate-shake-css {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.error-message-text {
  font-size: 1.25rem;
  color: #dc3545;
  font-weight: bold;
}

.state-container.empty-state {
  color: #6c757d;
}

.empty-icon {
  font-size: 5rem;
  color: #6c757d;
  margin-bottom: 1rem;
  animation: animate-pulse-slow-css 2s infinite ease-in-out;
}

/* @keyframes animate-pulse-slow-css (defined in global CSS or here) */
@keyframes animate-pulse-slow-css {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.empty-message-text {
  font-size: 1rem;
  color: #6c757d;
  margin-top: 0.5rem;
}

/* View All Products Button */
.btn-view-all {
  background: linear-gradient(45deg, #6a11cb, #2575fc); /* Blue-purple gradient */
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 35px;
  font-weight: 700;
  font-size: 1.2rem;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: inline-flex; /* Use flex for icon alignment */
  align-items: center;
  justify-content: center;
  text-decoration: none; /* Remove underline for router-link */
}

.btn-view-all:hover {
  background: linear-gradient(45deg, #ec4899, #a855f7); /* Reverse gradient on hover */
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

/* Responsive adjustments */
@media (max-width: 991.98px) { /* Medium devices (md) */
  .section-title-text {
    font-size: 2.8rem;
  }
  .section-subtitle-text {
    font-size: 1.2rem;
  }
  .product-image-wrapper {
    height: 250px; /* Adjust image height for md */
  }
  .product-name-styled {
    font-size: 1.2rem;
  }
  .current-price-styled {
    font-size: 1.3rem;
  }
  .btn-action-styled {
    padding: 10px 15px;
    font-size: 0.9rem;
  }
  .product-badge-styled {
    font-size: 0.8rem;
    padding: 5px 10px;
  }
}

@media (max-width: 767.98px) { /* Small devices (sm) */
  .section-title-text {
    font-size: 2.2rem;
  }
  .section-subtitle-text {
    font-size: 1.1rem;
  }
  .product-image-wrapper {
    height: 220px; /* Adjust image height for sm */
  }
  .product-name-styled {
    font-size: 1.1rem;
  }
  .current-price-styled {
    font-size: 1.2rem;
  }
  .btn-action-styled {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
  .product-info-styled {
    padding: 15px;
  }
}

@media (max-width: 575.98px) { /* Extra small devices (xs) */
  .product-image-wrapper {
    height: 280px; /* Taller for single column view */
  }
  .section-title-text {
    font-size: 2rem;
  }
  .section-subtitle-text {
    font-size: 1rem;
  }
  .btn-view-all {
    padding: 12px 30px;
    font-size: 1rem;
  }
}
</style>
