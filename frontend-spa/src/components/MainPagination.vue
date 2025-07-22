<template>
  <nav aria-label="Page navigation">
    <ul class="pagination justify-content-center">
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Previous</a>
      </li>
      <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
        <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
      </li>
      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
        <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Next</a>
      </li>
    </ul>
  </nav>
</template>

<script setup>
const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
});

// Sử dụng 'update:currentPage' để tương thích với v-model
const emit = defineEmits(['update:currentPage']);

const changePage = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    // Gửi sự kiện đã được cập nhật
    emit('update:currentPage', page);
  }
};
</script>

<style scoped>
/* Thêm kiểu dáng tùy chỉnh cho phân trang tại đây */
.page-link {
  color: #667eea;
}
.page-item.active .page-link {
  background-color: #667eea;
  border-color: #667eea;
  color: white;
}
.page-item.disabled .page-link {
  color: #6c757d;
}
</style>