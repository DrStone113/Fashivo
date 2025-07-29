<template>
  <div class="input-group mb-3">
    <input type="text" class="form-control" placeholder="Search products..." v-model="searchTerm"
      @keyup.enter="performSearch">
    <button class="btn btn-outline-secondary" type="button" @click="performSearch">
      <i class="fas fa-search"></i> Search
    </button>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

const searchTerm = ref('');
const emit = defineEmits(['search']);

const performSearch = () => {
  emit('search', searchTerm.value);
};
</script>

<style scoped>
/* Add any specific styles for search bar here */
</style>