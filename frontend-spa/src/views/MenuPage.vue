//ct313hm02-project-DrStone113/frontend-spa/src/views/MenuPage.vue
<script setup>
import SearchBar from '@/components/SearchBar.vue';
import ProductList from '@/components/ProductList.vue';
import ProductCard from '@/components/ProductCard.vue';
import MainPagination from '@/components/MainPagination.vue';
import CartItems from '@/components/CartItems.vue';

import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useProduct from '@/composables/useProduct';

const router = useRouter();
const route = useRoute();

// Current page is from the query string (?page=1)
const currentPage = computed(() => {
  const page = Number(route.query?.page);
  if (Number.isNaN(page) || page < 1) return 1;
  return page;
});

const selectedIndex = ref(-1);
const searchText = ref('');

// Cập nhật cách lấy các thuộc tính reactive từ useProduct
// Lấy trực tiếp các ref/computed ref được trả về
const { products, totalPages, isLoading, isError, error } = useProduct().fetchProducts(currentPage);

// Map each product to a string for searching
const searchableProducts = computed(() =>
  products.value.map((product) => { // Truy cập .value của products
    const { name, type, price } = product;
    return [name, type, price].join('');
  })
);

// Products filtered by searchText
const filteredProducts = computed(() => {
  if (!searchText.value) return products.value; // Truy cập .value của products
  return products.value.filter((product, index) => // Truy cập .value của products
    searchableProducts.value[index].toLowerCase().includes(searchText.value.toLowerCase())
  );
});

const selectedProduct = computed(() => {
  if (selectedIndex.value < 0 || !filteredProducts.value || filteredProducts.value.length === 0) {
    return null;
  }
  return filteredProducts.value[selectedIndex.value]; // Truy cập .value của filteredProducts
});

function changeCurrentPage(page) {
  router.push({ name: 'MenuPage', query: { page } });
}

// Whenever searchText & currentPage changes, reset selectedIndex
watch(searchText, () => (selectedIndex.value = -1));
watch(currentPage, () => (selectedIndex.value = -1));

// --- DEBUG LOGS (Đã thêm lại để bạn kiểm tra) ---
watch(products, (newProducts) => {
  console.log('MenuPage: products (from useProduct, reactive):', newProducts);
  if (newProducts && newProducts.length > 0) {
    console.log('MenuPage: First reactive product:', newProducts[0]);
  }
}, { immediate: true });

watch(filteredProducts, (newFilteredProducts) => {
  console.log('MenuPage: filteredProducts (after search/filter):', newFilteredProducts);
  console.log('MenuPage: filteredProducts length:', newFilteredProducts ? newFilteredProducts.length : 0);
}, { immediate: true });

watch(isLoading, (newLoadingState) => {
  console.log('MenuPage: isLoading:', newLoadingState);
});

watch(isError, (newErrorState) => {
  console.log('MenuPage: isError:', newErrorState);
});

watch(error, (newError) => {
  if (newError) {
    console.error('MenuPage: Error fetching products:', newError);
  }
});

onMounted(() => {
  console.log('MenuPage mounted.');
});
</script>

<template>
  <div class="page row">
    <div class="mt-3 col-md-7">
      <div class="my-2">
        <SearchBar v-model="searchText" />
      </div>

      <!-- Thêm trạng thái loading và error để hiển thị phản hồi cho người dùng -->
      <div v-if="isLoading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading products...</p>
      </div>
      <div v-else-if="isError" class="alert alert-danger text-center my-5">
        Error loading products: {{ error?.message || 'Unknown error' }}
      </div>
      <ProductList v-else-if="filteredProducts && filteredProducts.length > 0" :products="filteredProducts"
        v-model:selected-index="selectedIndex" />
      <p v-else class="alert alert-warning text-center my-5">
        No product yet.
      </p>
      <div class=" d-flex flex-wrap justify-content-round align-items-center mx-auto">
        <MainPagination :total-pages="totalPages" :current-page="currentPage"
          @update:current-page="changeCurrentPage" />
        <div class="w-100"></div>
      </div>
    </div>
    <div class="mt-2 product-info col-md-3">
      <div v-if="selectedProduct">
        <h4 class="mt-3 mb-3 text-center"> Product Information </h4>
        <ProductCard :product="selectedProduct" />
      </div>
    </div>
    <div class="mt-3 col-md-6 bg-dark custom-position text-light">
      <CartItems></CartItems>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 1600px;
  margin-left: -120px;
  margin-right: 0px;
}

.product-info {
  width: 22%;
  margin-left: -5px;
  padding-top: 3%;
}

.custom-position {
  position: absolute;
  right: 10px;
  height: 648px;
  width: 400px;
  border-color: darkred;
  border-width: 4px;
  border-style: groove;
  border-radius: 4%;
}
</style>
