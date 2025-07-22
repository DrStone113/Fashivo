<template>
  <div class="advanced-search">
    <div class="search-header" @click="toggleFilters">
      <h3>
        <i class="fas fa-filter"></i>
        Search Filters
      </h3>
      <button class="toggle-btn">
        <i :class="showFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
      </button>
    </div>

    <transition name="slide">
      <div v-if="showFilters" class="filters-container">
        <!-- Search Input -->
        <div class="filter-group">
          <label>Product Name</label>
          <input 
            type="text" 
            v-model.lazy="filters.search" 
            placeholder="Enter name..."
            class="form-input"
          >
        </div>

        <!-- Categories -->
        <div class="filter-group">
          <label>Categories</label>
          <div v-if="categories.length > 0" class="category-chips">
            <button 
              v-for="category in categories" 
              :key="category.id"
              :class="['category-chip', { active: filters.categories.includes(category.id) }]"
              @click="toggleCategory(category.id)"
            >
              {{ category.name }}
            </button>
          </div>
           <div v-else class="text-muted small">Loading categories...</div>
        </div>

        <!-- Price Range -->
        <div class="filter-group">
          <label>Price Range</label>
          <div class="price-inputs">
            <input 
              type="number" 
              v-model.number.lazy="filters.minPrice" 
              placeholder="Lowest"
              min="0"
              class="price-input"
            >
            <input 
              type="number" 
              v-model.number.lazy="filters.maxPrice" 
              placeholder="Highest"
              min="0"
              class="price-input"
            >
          </div>
        </div>

        <!-- Stock Filter -->
        <div class="filter-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="filters.inStock"
            >
            <span>In Stock</span>
          </label>
        </div>

        <!-- Sort Options -->
        <div class="filter-group">
          <label>Sort By</label>
          <select v-model="filters.sortBy" class="form-select">
            <option value="name,asc">Name: A-Z</option>
            <option value="name,desc">Name: Z-A</option>
            <option value="price,asc">Price: Low to High</option>
            <option value="price,desc">Price: High to Low</option>
            <option value="createdAt,desc">Newest</option>
          </select>
        </div>

        <!-- Action Buttons -->
        <div class="filter-actions">
          <button @click="clearFilters" class="btn-clear">
            Clear Filters
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { reactive, watch, ref, onMounted } from 'vue';
import categoryService from '@/services/category.service';

const emit = defineEmits(['filter-change']);

const props = defineProps({
  initialFilters: {
    type: Object,
    required: true,
  }
});

const showFilters = ref(true);
const categories = ref([]);
const defaultMaxPrice = 10000000;

// Khởi tạo một đối tượng reactive rỗng ban đầu
const filters = reactive({
  search: '',
  categories: [],
  minPrice: 0,
  maxPrice: defaultMaxPrice,
  inStock: false,
  sortBy: 'name,asc'
});

// SỬA LỖI: Sử dụng watch với `immediate: true` để đảm bảo
// trạng thái local (`filters`) luôn được đồng bộ với prop (`initialFilters`)
// ngay khi component được tạo và mỗi khi prop thay đổi.
watch(() => props.initialFilters, (newFilters) => {
  if (newFilters) {
    Object.assign(filters, newFilters);
  }
}, { deep: true, immediate: true });


const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const toggleCategory = (categoryId) => {
  const index = filters.categories.indexOf(categoryId);
  if (index > -1) {
    filters.categories.splice(index, 1);
  } else {
    filters.categories.push(categoryId);
  }
};

const clearFilters = () => {
  filters.search = '';
  filters.categories = [];
  filters.minPrice = 0;
  filters.maxPrice = defaultMaxPrice;
  filters.inStock = false;
  filters.sortBy = 'name,asc';
};

const loadCategories = async () => {
  try {
    const data = await categoryService.fetchCategories(1, 100);
    categories.value = data.categories;
  } catch (error) {
    console.error('Error loading categories:', error);
    categories.value = [];
  }
};

onMounted(() => {
  loadCategories();
});

// Gửi sự kiện 'filter-change' lên component cha khi người dùng thay đổi bộ lọc
watch(filters, (newFilters) => {
  emit('filter-change', newFilters);
}, { deep: true });
</script>

<style scoped>
/* Giữ nguyên các style đã có */
.advanced-search {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}
.advanced-search:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
}
.search-header h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #343a40;
  display: flex;
  align-items: center;
  gap: 8px;
}
.toggle-btn {
  background: transparent;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
}

.filters-container {
  padding: 0 16px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.filter-group label {
  font-weight: 500;
  color: #495057;
  font-size: 0.8rem;
}

.form-input, .form-select, .price-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.85rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background-color: #f8f9fa;
}
.form-input:focus, .form-select:focus, .price-input:focus {
  outline: none;
  border-color: #80bdff;
  background-color: white;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.category-chip {
  padding: 4px 10px;
  border: 1px solid #dee2e6;
  border-radius: 15px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  color: #495057;
}
.category-chip.active {
  background: var(--primary-color, #667eea);
  color: white;
  border-color: var(--primary-color, #667eea);
}

.price-inputs {
  display: flex;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: #495057;
}
.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--primary-color, #667eea);
}

.filter-actions {
  margin-top: 4px;
}
.btn-clear {
  width: 100%;
  background: #f1f3f5;
  color: #6c757d;
  border: 1px solid #dee2e6;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;
}
.btn-clear:hover {
  background: var(--danger-color, #e74c3c);
  color: white;
  border-color: var(--danger-color, #e74c3c);
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.25s ease-out;
  overflow: hidden;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
}
</style>
