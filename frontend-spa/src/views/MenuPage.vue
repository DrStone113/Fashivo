<template>
  <div class="menu-page">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Discover Our Collection</h1>
        <p class="hero-subtitle">Find the perfect style for every occasion</p>
      </div>
    </section>

    <div class="container main-content">
      <aside class="filters-column">
        <AdvancedSearch 
          :initial-filters="filters"
          @filter-change="updateFilters" 
        />
      </aside>

      <main class="products-column">
        <div v-if="isLoading" class="state-container">
          <div class="spinner"></div>
          <p>Loading amazing products...</p>
        </div>

        <div v-else-if="isError" class="state-container error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error?.message || 'Failed to load products' }}</p>
          <button @click="reloadPage" class="btn-retry">Try Again</button>
        </div>

        <div v-else-if="!products || products.length === 0" class="state-container empty-state">
          <i class="fas fa-tshirt"></i>
          <h3>No Products Found</h3>
          <p>Try adjusting your filters or check back later for new arrivals!</p>
        </div>

        <div v-else class="products-grid">
          <ProductCard 
            v-for="product in products" 
            :key="product.id" 
            :product="product"
            :current-page="currentPage"  
            @add-to-cart="handleAddToCart"
            @buy-now="handleBuyNow"
          />
        </div>

        <div v-if="totalPages > 1" class="pagination-wrapper">
          <MainPagination 
            :total-pages="totalPages" 
            :current-page="currentPage"
            @update:current-page="changeCurrentPage" 
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import AdvancedSearch from '@/components/AdvancedSearch.vue';
import ProductCard from '@/components/ProductCard.vue'; // Đảm bảo đúng component này
import MainPagination from '@/components/MainPagination.vue';
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useProduct from '@/composables/useProduct';
import { useCartStore } from '@/store/cartStore';

const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();

const filters = ref({
  search: route.query.search || '',
  categories: (route.query.category_id || '').split(',').filter(Boolean).map(id => parseInt(id.trim())),
  minPrice: Number(route.query.minPrice) || 0,
  maxPrice: Number(route.query.maxPrice) || 10000000,
  inStock: route.query.inStock === 'true',
  sortBy: route.query.sortBy || 'name,asc'
});

const currentPage = computed(() => {
  const page = Number(route.query?.page);
  return !Number.isNaN(page) && page > 0 ? page : 1;
});

const { fetchProducts } = useProduct();
const { products, totalPages, isLoading, isError, error } = fetchProducts(currentPage, filters);

function updateFilters(newFilters) {
  Object.assign(filters.value, newFilters);
  changeCurrentPage(1);
}

function changeCurrentPage(page) {
  const query = {
    page: page > 1 ? page : undefined,
    search: filters.value.search || undefined,
    category_id: filters.value.categories.length > 0 ? filters.value.categories.join(',') : undefined,
    minPrice: filters.value.minPrice > 0 ? filters.value.minPrice : undefined,
    maxPrice: filters.value.maxPrice < 10000000 ? filters.value.maxPrice : undefined,
    inStock: filters.value.inStock ? 'true' : undefined,
    sortBy: filters.value.sortBy !== 'name,asc' ? filters.value.sortBy : undefined,
  };

  Object.keys(query).forEach(key => query[key] === undefined && delete query[key]);
  
  router.push({ query });
}

function handleAddToCart(product) {
  if (product.stock > 0) {
    cartStore.addItem(product, 1);
  }
}

function handleBuyNow(product) {
  if (product.stock > 0) {
    cartStore.addItem(product, 1);
    router.push('/cart');
  }
}

function reloadPage() {
  window.location.reload();
}
</script>

<style scoped>
/* Giữ nguyên các style đã có */
.menu-page {
  background: #f8f9fa;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;
  margin-bottom: 40px;
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 700;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.2);
}

.hero-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 10px auto 0;
}

/* Main Content Layout */
.container.main-content {
  max-width: 1400px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 30px;
  align-items: flex-start;
  padding: 0 20px;
}

.filters-column {
  flex: 0 0 250px;
  position: sticky;
  top: 20px;
}

.products-column {
  flex: 1 1 auto;
  min-width: 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background: white;
  border-radius: 15px;
  min-height: 400px;
  color: #555;
}

.state-container i {
  font-size: 4rem;
  color: #764ba2;
  margin-bottom: 1.5rem;
}

.error-state i {
  color: #e74c3c;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-retry {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.3s ease;
}

.btn-retry:hover {
  background: #5a6fd8;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin: 50px 0;
}

@media (max-width: 992px) {
  .container.main-content {
    flex-direction: column;
  }
  .filters-column {
    width: 100%;
    position: static;
    flex-basis: auto;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem;
  }
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
</style>
