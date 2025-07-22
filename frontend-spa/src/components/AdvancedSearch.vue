<template>
  <div class="advanced-search">
    <div class="search-header">
      <h3>Advanced Search</h3>
      <button @click="toggleFilters" class="toggle-btn">
        <i :class="showFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
        {{ showFilters ? 'Hide' : 'Show' }} Filters
      </button>
    </div>

    <transition name="slide">
      <div v-if="showFilters" class="filters-container">
        <!-- Search Input -->
        <div class="filter-group">
          <label>Search Products</label>
          <input 
            type="text" 
            v-model="filters.search" 
            placeholder="Search by name..."
            class="form-input"
          >
        </div>

        <!-- Categories -->
        <div class="filter-group">
          <label>Categories</label>
          <div class="category-chips">
            <button 
              v-for="category in categories" 
              :key="category"
              :class="['category-chip', { active: filters.categories.includes(category) }]"
              @click="toggleCategory(category)"
            >
              {{ category }}
            </button>
          </div>
        </div>

        <!-- Price Range -->
        <div class="filter-group">
          <label>Price Range</label>
          <div class="price-range">
            <div class="price-inputs">
              <input 
                type="number" 
                v-model.number="filters.minPrice" 
                placeholder="Min"
                min="0"
                class="price-input"
              >
              <span>-</span>
              <input 
                type="number" 
                v-model.number="filters.maxPrice" 
                placeholder="Max"
                min="0"
                class="price-input"
              >
            </div>
          </div>
        </div>

        <!-- Stock Filter -->
        <div class="filter-group">
          <label>Availability</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="filters.inStock"
              >
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        <!-- Sort Options -->
        <div class="filter-group">
          <label>Sort By</label>
          <select v-model="filters.sortBy" class="form-select">
            <option value="name">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-low">Price (Low to High)</option>
            <option value="price-high">Price (High to Low)</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        <!-- Action Buttons -->
        <div class="filter-actions">
          <button @click="clearFilters" class="btn-clear">
            <i class="fas fa-times"></i> Clear All
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import categoryService from '@/services/category.service';

const emit = defineEmits(['filter-change']);

const showFilters = ref(true);
const categories = ref([]);
const maxPrice = ref(1000000);

const filters = reactive({
  search: '',
  categories: [],
  minPrice: 0,
  maxPrice: 1000000,
  inStock: false,
  sortBy: 'name'
});

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const toggleCategory = (category) => {
  const index = filters.categories.indexOf(category);
  if (index > -1) {
    filters.categories.splice(index, 1);
  } else {
    filters.categories.push(category);
  }
};

const clearFilters = () => {
  filters.search = '';
  filters.categories = [];
  filters.minPrice = 0;
  filters.maxPrice = maxPrice.value;
  filters.inStock = false;
  filters.sortBy = 'name';
};

const loadCategories = async () => {
  try {
    const data = await categoryService.getAllCategories();
    categories.value = data.categories.map(cat => cat.name);
  } catch (error) {
    console.error('Error loading categories:', error);
    categories.value = ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories'];
  }
};

onMounted(() => {
  loadCategories();
});

// Watch for changes and emit
watch(filters, () => {
  emit('filter-change', { ...filters });
}, { deep: true });
</script>

<style scoped>
.advanced-search {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  margin-bottom: 30px;
  overflow: hidden;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.search-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.toggle-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.toggle-btn:hover {
  background: rgba(255,255,255,0.3);
}

.filters-container {
  padding: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-weight: 600;
  margin-bottom: 10px;
  color: #2c3e50;
}

.form-input, .form-select {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #667eea;
}

.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-chip {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.category-chip.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.category-chip:hover {
  border-color: #667eea;
}

.price-range {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-input {
  flex: 1;
  padding: 8px;
  border: 2px solid #e0e0e0;
  border-radius: 5px;
  text-align: center;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.filter-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.btn-clear {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-size: 14px;
}

.btn-clear:hover {
  background: #c0392b;
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .filters-container {
    grid-template-columns: 1fr;
    padding: 20px;
  }
}
</style>
