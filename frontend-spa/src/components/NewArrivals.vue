<template>
  <section class="new-arrivals py-5">
    <div class="container">
      <div class="text-center mb-5">
        <h2 class="section-title">New Arrivals</h2>
        <p class="section-subtitle">Discover the latest trends and fresh styles</p>
      </div>

      <!-- Trạng thái đang tải -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Đang tải sản phẩm...</p>
      </div>

      <!-- Trạng thái lỗi -->
      <div v-else-if="isError" class="alert alert-danger text-center">
        <h4>Oops! Something went wrong.</h4>
        <p>Chúng tôi không thể tải được các sản phẩm mới. Vui lòng thử lại sau.</p>
        <p class="text-muted small">{{ error.message }}</p>
      </div>

      <!-- Trạng thái thành công và có sản phẩm -->
      <div v-else-if="products && products.length > 0">
        <div class="row g-4">
          <div v-for="product in products" :key="product.id" class="col-lg-3 col-md-6">
            <div class="product-card">
              <div class="product-image">
                <img :src="product.image_url" :alt="product.name" class="img-fluid" @error="setDefaultImage">
                <div class="product-overlay">
                  <!-- CẬP NHẬT: Các nút hành động rõ ràng hơn -->
                  <div class="product-actions">
                    <button @click="addToCart(product)" class="btn btn-primary btn-action">
                      <i class="bi bi-cart-plus"></i>
                      <span>Thêm vào giỏ</span>
                    </button>
                    <button @click="viewProduct(product.id)" class="btn btn-light btn-action">
                      <i class="bi bi-eye"></i>
                      <span>Xem chi tiết</span>
                    </button>
                    <button @click="toggleWishlist(product)" class="btn btn-light btn-action">
                      <i class="bi" :class="product.isWishlisted ? 'bi-heart-fill text-danger' : 'bi-heart'"></i>
                      <span>{{ product.isWishlisted ? 'Đã thích' : 'Yêu thích' }}</span>
                    </button>
                  </div>
                </div>
                <!-- Các badge này sẽ hiển thị nếu backend trả về dữ liệu tương ứng -->
                <div v-if="product.isNew" class="product-badge new">NEW</div>
                <div v-if="product.discount" class="product-badge discount">-{{ product.discount }}%</div>
              </div>
              <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                <p class="product-category">{{ product.category?.name || 'Uncategorized' }}</p>
                <div class="product-price">
                  <span class="current-price">{{ formatCurrency(product.price) }}</span>
                  <span v-if="product.originalPrice" class="original-price">{{ formatCurrency(product.originalPrice) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-5">
          <router-link to="/menu" class="btn btn-outline-primary btn-lg">
            Xem tất cả sản phẩm
            <i class="bi bi-arrow-right ms-2"></i>
          </router-link>
        </div>
      </div>

      <!-- Trạng thái không có sản phẩm -->
      <div v-else class="text-center py-5">
        <p class="text-muted">Chưa có sản phẩm mới nào. Vui lòng quay lại sau!</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/store/cartStore';
import useProduct from '@/composables/useProduct'; // Import composable để lấy dữ liệu
import { DEFAULT_IMAGE } from '@/constants'; // Import ảnh mặc định

const router = useRouter();
const cartStore = useCartStore();

// --- Lấy dữ liệu động bằng useProduct ---
const page = ref(1);
const filters = ref({
  // Lọc sản phẩm mới nhất, backend cần hỗ trợ sắp xếp theo 'created_at'
  sortBy: 'created_at',
  order: 'desc',
  // Chỉ lấy 4 sản phẩm cho trang chủ
  limit: 4 
}); 

const { products, isLoading, isError, error } = useProduct().fetchProducts(page, filters);

// --- Các hàm xử lý ---

/**
 * Định dạng số thành tiền tệ Việt Nam (VND).
 * @param {number | string} value Giá trị cần định dạng.
 * @returns {string} Chuỗi tiền tệ đã định dạng.
 */
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
  cartStore.addToCart({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image_url, // Sử dụng image_url từ dữ liệu API
    quantity: 1
  });
  // Có thể thêm thông báo "Đã thêm vào giỏ hàng" ở đây
};

const viewProduct = (productId) => {
  router.push(`/product/${productId}`);
};

const toggleWishlist = (product) => {
  // Lưu ý: Chức năng này hiện chỉ thay đổi ở phía client.
  // Để lưu trữ lâu dài, cần gọi API để cập nhật wishlist của người dùng.
  product.isWishlisted = !product.isWishlisted;
};

const setDefaultImage = (event) => {
  event.target.src = DEFAULT_IMAGE;
};
</script>

<style scoped>
/* Giữ nguyên các style đã có */
.new-arrivals {
  background: white;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.product-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.product-image {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.1);
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6); /* Tăng độ tối của lớp phủ để chữ nổi bật hơn */
  display: flex;
  align-items: flex-end; /* Đẩy các nút xuống dưới */
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 1rem;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

/* CẬP NHẬT: Style cho các nút hành động */
.product-actions {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.5rem; /* Khoảng cách giữa các nút */
}

.btn-action {
  width: 100%;
  border-radius: 50px; /* Bo tròn các góc */
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem; /* Khoảng cách giữa icon và text */
  border: 1px solid transparent;
  transition: all 0.2s ease-in-out;
}

.btn-action.btn-primary {
    background-color: #ff6b6b;
    border-color: #ff6b6b;
}

.btn-action.btn-light {
    background-color: rgba(255, 255, 255, 0.9);
    color: #333;
}

.btn-action:hover {
    transform: scale(1.05);
}

.product-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.product-badge.new {
  background: #ff6b6b;
}

.product-badge.discount {
  background: #4ecdc4;
}

.product-info {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
  flex-grow: 1;
}

.product-category {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
}

.current-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ff6b6b;
}

.original-price {
  font-size: 1rem;
  color: #999;
  text-decoration: line-through;
}

.bi-heart-fill.text-danger {
    color: #ff6b6b !important;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }
  
  .product-image {
    height: 250px;
  }
}
</style>
