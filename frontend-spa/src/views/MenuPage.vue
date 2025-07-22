<template>
  <div class="menu-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Discover Our Collection</h1>
        <p class="hero-subtitle">Find the perfect style for every occasion</p>
      </div>
    </section>

    <!-- Search and Filter Section -->
    <section class="search-section">
      <div class="container">
        <div class="search-wrapper">
          <SearchBar v-model="searchText" @search="performSearch" />
        </div>
      </div>
    </section>

    <!-- Products Section -->
    <section class="products-section">
      <div class="container">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading amazing products...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="isError" class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error?.message || 'Failed to load products' }}</p>
          <button @click="reloadProducts" class="btn-retry">Try Again</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="!filteredProducts || filteredProducts.length === 0" class="empty-state">
          <i class="fas fa-search"></i>
          <h3>No products found</h3>
          <p>{{ searchText ? 'Try adjusting your search' : 'Check back later for new arrivals' }}</p>
        </div>

        <!-- Products Grid -->
        <div v-else class="products-grid">
          <div class="product-card" 
               v-for="(product, index) in filteredProducts" 
               :key="product.id"
               :class="{ 'selected': selectedIndex === index }"
               @click="selectProduct(index)">
            
            <div class="product-image">
              <img :src="product.image_url || '/public/image/BLANK.jpg'" 
                   :alt="product.name"
                   loading="lazy">
              <div class="product-overlay">
                <button @click.stop="addToCart(product)" 
                        class="add-to-cart-btn"
                        :disabled="product.stock === 0">
                  <i class="fas fa-shopping-cart"></i>
                </button>
              </div>
            </div>

            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-type">{{ product.type }}</p>
              <p class="product-price">{{ Number(product.price || 0).toLocaleString() }} VND</p>
              
              <div class="product-actions">
                <button @click.stop="addToCart(product)" 
                        class="btn-primary"
                        :disabled="product.stock === 0">
                  <i class="fas fa-shopping-cart"></i>
                  {{ product.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
                </button>
                <router-link :to="`/product/${product.id}`" 
                             class="btn-secondary">
                  <i class="fas fa-eye"></i>
                  View Details
                </router-link>
              </div>
            </div>

            <div v-if="product.stock === 0" class="out-of-stock-badge">
              Out of Stock
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination-wrapper">
          <MainPagination 
            :total-pages="totalPages" 
            :current-page="currentPage"
            @update:current-page="changeCurrentPage" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import SearchBar from '@/components/SearchBar.vue';
import MainPagination from '@/components/MainPagination.vue';
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useProduct from '@/composables/useProduct';
import { useCartStore } from '@/store/cartStore';

const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();

// Current page from query string
const currentPage = computed(() => {
  const page = Number(route.query?.page);
  if (Number.isNaN(page) || page < 1) return 1;
  return page;
});

const selectedIndex = ref(-1);
const searchText = ref('');

// Get products from composable
const { products, totalPages, isLoading, isError, error } = useProduct().fetchProducts(currentPage);

// Filter products based on search
const filteredProducts = computed(() => {
  if (!searchText.value) return products.value;
  return products.value.filter(product => 
    product.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
    product.type.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

const selectedProduct = computed(() => {
  if (selectedIndex.value < 0 || !filteredProducts.value.length) return null;
  return filteredProducts.value[selectedIndex.value];
});

function changeCurrentPage(page) {
  router.push({ name: 'MenuPage', query: { page } });
}

function performSearch(searchTerm) {
  searchText.value = searchTerm;
}

function reloadProducts() {
  window.location.reload();
}

function selectProduct(index) {
  selectedIndex.value = index;
}

function addToCart(product) {
  if (product.stock > 0) {
    cartStore.addItem(product, 1);
  }
}

// Reset selection when search or page changes
watch([searchText, currentPage], () => {
  selectedIndex.value = -1;
});

onMounted(() => {
  console.log('MenuPage mounted with beautiful design');
});
</script>

<style scoped>
.menu-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

/* Search Section */
.search-section {
  padding: 40px 0;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.search-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

/* Products Section */
.products-section {
  padding: 60px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 100px 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  text-align: center;
  padding: 100px 0;
  color: #e74c3c;
}

.error-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.btn-retry {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 1rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 100px 0;
  color: #7f8c8d;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  margin: 40px 0;
}

.product-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  position: relative;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.product-card.selected {
  border: 2px solid #667eea;
}

.product-image {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.add-to-cart-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s ease;
}

.add-to-cart-btn:hover {
  background: #5a6fd8;
}

.product-info {
  padding: 20px;
}

.product-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.product-type {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.product-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 1rem;
}

.product-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  text-decoration: none;
  text-align: center;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
}

.btn-secondary {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-secondary:hover {
  background: #bdc3c7;
}

.out-of-stock-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #e74c3c;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.8rem;
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 60px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .product-card {
    margin: 0 10px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 40px 20px;
  }
  
  .hero-title {
    font-size: 1.5rem;
  }
}
</style>
