<template>
  <nav aria-label="Page navigation" class="pagination-nav-styled">
    <ul class="pagination-list-styled">
      <li class="page-item-styled" :class="{ disabled: currentPage === 1 }">
        <a class="page-link-styled prev-next-btn" href="#" @click.prevent="changePage(currentPage - 1)">
          Previous
        </a>
      </li>
      <li class="page-item-styled" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
        <a class="page-link-styled page-number-btn" href="#" @click.prevent="changePage(page)">
          {{ page }}
        </a>
      </li>
      <li class="page-item-styled" :class="{ disabled: currentPage === totalPages }">
        <a class="page-link-styled prev-next-btn" href="#" @click.prevent="changePage(currentPage + 1)">
          Next
        </a>
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

const emit = defineEmits(['update:currentPage']);

const changePage = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page);
  }
};
</script>

<style scoped>
/* General Pagination Styling */
.pagination-nav-styled {
  font-family: 'Poppins', sans-serif; /* Poppins font */
  display: flex;
  justify-content: center; /* Center the pagination */
  margin-top: 30px; /* Adjust margin as needed */
}

.pagination-list-styled {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: white; /* White background for the pagination block */
  border-radius: 15px; /* More rounded overall block */
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1); /* Subtle shadow */
}

.page-item-styled {
  margin: 0 4px; /* Small space between items */
}

.page-link-styled {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 45px; /* Minimum width for buttons */
  height: 45px; /* Fixed height for buttons */
  padding: 0 15px; /* Adjust padding for text */
  border-radius: 10px; /* Rounded buttons */
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); /* Smooth transition */
  border: 1px solid #e0e0e0; /* Light border */
  color: #667eea; /* Default link color */
  background-color: transparent;
}

/* Page Number Buttons */
.page-number-btn {
  color: #555; /* Darker text for numbers */
}

/* Active Page Styling */
.page-item-styled.active .page-link-styled {
  background: linear-gradient(45deg, #6a11cb, #2575fc); /* Blue-purple gradient */
  border-color: transparent; /* No border for active */
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); /* Shadow for active button */
  transform: translateY(-2px); /* Slight lift for active */
}

/* Hover Effect for all links */
.page-link-styled:hover:not(.disabled) {
  background-color: #f0f2f5; /* Light grey background on hover */
  color: #6a11cb; /* Purple text on hover */
  transform: translateY(-2px); /* Slight lift on hover */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-item-styled.active .page-link-styled:hover {
  background: linear-gradient(45deg, #ec4899, #a855f7); /* Reverse gradient on hover for active */
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

/* Disabled Page Styling */
.page-item-styled.disabled .page-link-styled {
  color: #adb5bd; /* Lighter grey for disabled */
  cursor: not-allowed;
  background-color: #f8f9fa; /* Light background for disabled */
  border-color: #e9ecef;
  box-shadow: none;
  transform: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pagination-list-styled {
    flex-wrap: wrap; /* Allow items to wrap */
    justify-content: center;
    padding: 10px;
  }
  .page-item-styled {
    margin: 5px; /* More margin when wrapped */
  }
  .page-link-styled {
    min-width: 40px;
    height: 40px;
    font-size: 0.9rem;
    padding: 0 12px;
  }
}

@media (max-width: 576px) {
  .page-link-styled {
    min-width: 35px;
    height: 35px;
    font-size: 0.85rem;
    padding: 0 10px;
  }
}
</style>
