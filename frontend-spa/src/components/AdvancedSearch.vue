<template>
  <div class="advanced-search-styled">
    <div class="search-header-styled" @click="toggleFilters">
      <h3>
        <i class="fas fa-filter me-2"></i>
        Search Filters
      </h3>
      <button class="toggle-btn-styled">
        <i :class="showFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
      </button>
    </div>

    <transition name="slide-filters">
      <div v-if="showFilters" class="filters-container-styled">
        <!-- Search Input -->
        <div class="filter-group-styled">
          <label class="filter-label">Product Name</label>
          <input 
            type="text" 
            v-model.lazy="filters.search" 
            placeholder="Enter name..."
            class="form-input-styled"
          >
        </div>

        <!-- Categories -->
        <div class="filter-group-styled">
          <label class="filter-label">Categories</label>
          <div v-if="categories.length > 0" class="category-chips-list">
            <button 
              v-for="category in categories" 
              :key="category.id"
              :class="['category-chip-item', { active: filters.categories.includes(category.id) }]"
              @click="toggleCategory(category.id)"
            >
              {{ category.name }}
            </button>
          </div>
            <div v-else class="text-muted small">Loading categories...</div>
        </div>

        <!-- Price Range -->
        <div class="filter-group-styled">
          <label class="filter-label">Price Range</label>
          <div class="price-inputs-group">
            <input 
              type="number" 
              v-model.number.lazy="filters.minPrice" 
              placeholder="Lowest"
              min="0"
              class="price-input-styled"
            >
            <span class="price-input-separator">-</span>
            <input 
              type="number" 
              v-model.number.lazy="filters.maxPrice" 
              placeholder="Highest"
              min="0"
              class="price-input-styled"
            >
          </div>
        </div>

        <!-- Stock Filter -->
        <div class="filter-group-styled">
          <label class="checkbox-label-styled">
            <input 
              type="checkbox" 
              v-model="filters.inStock"
              class="checkbox-input-styled"
            >
            <span>In Stock</span>
          </label>
        </div>

        <!-- Sort Options -->
        <div class="filter-group-styled">
          <label class="filter-label">Sort By</label>
          <select v-model="filters.sortBy" class="form-select-styled">
            <option value="name,asc">Name: A-Z</option>
            <option value="name,desc">Name: Z-A</option>
            <option value="price,asc">Price: Low to High</option>
            <option value="price,desc">Price: High to Low</option>
            <option value="createdAt,desc">Newest</option>
          </select>
        </div>

        <!-- Action Buttons -->
        <div class="filter-actions-group">
          <button @click="clearFilters" class="btn-clear-filters">
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

const filters = reactive({
  search: '',
  categories: [],
  minPrice: 0,
  maxPrice: defaultMaxPrice,
  inStock: false,
  sortBy: 'name,asc'
});

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

watch(filters, (newFilters) => {
  emit('filter-change', newFilters);
}, { deep: true });
</script>

<style scoped>
/* General Advanced Search Styling */
/* General Advanced Search Styling */
.advanced-search-styled {
  background: white;
  border: 1px solid #e0e0e0; /* Lighter border */
  border-radius: 12px; /* Less rounded */
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); /* Lighter shadow */
  transition: box-shadow 0.3s ease;
  font-family: 'Poppins', sans-serif; /* Poppins font */
  width: 100%; /* Full width */
}

.advanced-search-styled:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); /* Less deep shadow on hover */
}

/* Search Header */
.search-header-styled {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px; /* Less padding */
  cursor: pointer;
  user-select: none;
  background: #f8f9fa; /* Light background */
  color: #333; /* Dark text */
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.3s ease;
}

.search-header-styled:hover {
  background: #e9ecef; /* Slightly darker on hover */
}

.search-header-styled h3 {
  margin: 0;
  font-size: 1rem; /* Smaller font */
  font-weight: 600; /* Less bold */
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px; /* Less space */
}

.toggle-btn-styled {
  background: transparent;
  border: none;
  color: #333; /* Dark icon */
  cursor: pointer;
  padding: 6px; /* Smaller click area */
  font-size: 1rem; /* Smaller icon */
  transition: transform 0.2s ease;
}

.toggle-btn-styled i {
  transition: transform 0.2s ease;
}

/* Filters Container */
.filters-container-styled {
  padding: 15px; /* Less padding */
  display: flex;
  flex-direction: column;
  gap: 15px; /* Less space between filter groups */
}

.filter-group-styled {
  display: flex;
  flex-direction: column;
  gap: 8px; /* Less space between label and input */
}

.filter-label {
  font-weight: 600; /* Bolder label */
  color: #495057;
  font-size: 0.8rem; /* Smaller label */
  text-transform: uppercase; /* Uppercase label */
  letter-spacing: 0.5px;
}

.form-input-styled, .form-select-styled, .price-input-styled {
  width: 100%;
  padding: 4px 4px; /* Smaller padding */
  border: 1px solid #ced4da;
  border-radius: 8px; /* Less rounded */
  font-size: 0.9rem; /* Smaller font */
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  background-color: #f8f9fa;
  color: #333;
}

.form-input-styled::placeholder, .price-input-styled::placeholder {
  color: #aaa;
}

.form-input-styled:focus, .form-select-styled:focus, .price-input-styled:focus {
  outline: none;
  border-color: #a855f7; /* Purple focus border */
  background-color: white;
  box-shadow: 0 0 0 0.25rem rgba(168, 85, 247, 0.25); /* Purple shadow */
}

/* Category Chips */
.category-chips-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px; /* More space between chips */
}

.category-chip-item {
  padding: 6px 12px; /* Smaller padding */
  border: 1px solid #e0e0e0;
  border-radius: 16px; /* Less rounded */
  background: #f0f2f5; /* Light grey background */
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem; /* Smaller font */
  color: #495057;
  font-weight: 500;
}

.category-chip-item:hover {
  background: #e0e2e5; /* Darker grey on hover */
  color: #333;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.category-chip-item.active {
  background: linear-gradient(45deg, #a855f7, #ec4899); /* Vibrant Purple to Pink Gradient */
  color: white;
  border-color: transparent; /* No border for active */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* Price Inputs */
.price-inputs-group {
  display: flex;
  gap: 10px; /* More space */
}

/* Checkbox */
.checkbox-label-styled {
  display: flex;
  align-items: center;
  gap: 8px; /* Less space */
  cursor: pointer;
  font-size: 0.9rem; /* Smaller font */
  font-weight: 500;
  color: #495057;
}

.checkbox-input-styled {
  width: 18px; /* Smaller checkbox */
  height: 18px;
  accent-color: #a855f7; /* Purple accent color */
  border: 2px solid #a855f7; /* Purple border */
  border-radius: 4px; /* Slightly rounded */
  flex-shrink: 0;
}

/* Action Buttons */
.filter-actions-group {
  margin-top: 10px; /* More space */
}

.btn-clear-filters {
  width: 100%;
  background: linear-gradient(45deg, #f1f3f5, #e0e2e5); /* Light grey gradient */
  color: #6c757d;
  border: none; /* Removed border */
  padding: 10px; /* Smaller padding */
  border-radius: 8px; /* Less rounded */
  cursor: pointer;
  font-size: 0.9rem; /* Smaller font */
  font-weight: 600; /* Less bold */
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.btn-clear-filters:hover {
  background: linear-gradient(45deg, #ec4899, #a855f7); /* Vibrant Pink to Purple Gradient on hover */
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

/* Transition for filters container */
.slide-filters-enter-active, .slide-filters-leave-active {
  transition: all 0.3s ease-out;
  overflow: hidden;
}
.slide-filters-enter-from, .slide-filters-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
}

/* Responsive adjustments */
@media (max-width: 991.98px) { /* Medium devices (md) */
  .search-header-styled {
    padding: 14px 18px;
  }
  .search-header-styled h3 {
    font-size: 1rem;
  }
  .toggle-btn-styled {
    font-size: 1.1rem;
  }
  .filters-container-styled {
    padding: 18px;
    gap: 18px;
  }
  .filter-label {
    font-size: 0.85rem;
  }
  .form-input-styled, .form-select-styled, .price-input-styled {
    padding: 10px 12px;
    font-size: 0.9rem;
  }
  .category-chip-item {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
  .checkbox-label-styled {
    font-size: 0.9rem;
  }
  .btn-clear-filters {
    padding: 10px;
    font-size: 0.9rem;
  }
}

@media (max-width: 767.98px) { /* Small devices (sm) */
  .advanced-search-styled {
    border-radius: 15px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  }
  .search-header-styled {
    padding: 12px 15px;
  }
  .search-header-styled h3 {
    font-size: 0.9rem;
  }
  .toggle-btn-styled {
    font-size: 1rem;
  }
  .filters-container-styled {
    padding: 15px;
    gap: 15px;
  }
  .filter-label {
    font-size: 0.8rem;
  }
  .form-input-styled, .form-select-styled, .price-input-styled {
    padding: 8px 10px;
    font-size: 0.85rem;
  }
  .category-chip-item {
    padding: 5px 10px;
    font-size: 0.75rem;
  }
  .checkbox-label-styled {
    font-size: 0.8rem;
  }
  .btn-clear-filters {
    padding: 8px;
    font-size: 0.8rem;
  }
}
</style>
