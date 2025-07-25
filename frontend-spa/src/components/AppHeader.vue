<template>
  <nav class="navbar navbar-expand-lg custom-navbar-bg shadow-lg py-3">
    <div class="container-fluid max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Logo và Tên Shop -->
      <router-link class="navbar-brand d-flex align-items-center text-white" to="/">
        <img src="../assets/a3rkgo5r.png" alt="Logo" height="40" class="d-inline-block align-text-top rounded-full shadow-md me-2">
        <span class="fw-bold fs-4 text-shadow-custom">Clothing Shop</span>
      </router-link>

      <!-- Nút Toggle cho Mobile -->
      <button class="navbar-toggler custom-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Menu Chính -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link custom-nav-link" to="/">
              <i class="fas fa-home me-2"></i> Home
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link custom-nav-link" to="/menu">
              <i class="fas fa-tshirt me-2"></i> Products
            </router-link>
          </li>
          <!-- Có thể thêm link đến trang lịch sử đơn hàng nếu có -->
          <!-- <li class="nav-item">
            <router-link class="nav-link custom-nav-link" to="/orders-history">
              <i class="fas fa-history me-2"></i> My Orders
            </router-link>
          </li> -->
        </ul>

        <!-- Account và Cart -->
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link custom-nav-link" to="/info">
              <i class="fas fa-user-circle me-2"></i> Account
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link custom-nav-link position-relative" to="/cart">
              <i class="fas fa-shopping-cart me-2"></i> Cart
              <!-- ĐÃ SỬA: Điều chỉnh vị trí của badge -->
              <span v-if="totalItems > 0" class="badge bg-danger rounded-pill cart-badge-position animate-bounce-once-bs">
                {{ totalItems }}
              </span>
            </router-link>
          </li>
          
          <!-- Dropdown cho User/Guest -->
          <li class="nav-item dropdown">
            <a class="nav-link custom-nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
              aria-expanded="false">
              <span v-if="authStore.isAuthenticated">{{ authStore.user?.name || 'User' }}</span>
              <span v-else>Guest</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end custom-dropdown-menu" aria-labelledby="navbarDropdown">
              <li v-if="!authStore.isAuthenticated">
                <router-link class="dropdown-item custom-dropdown-item" to="/login">Login</router-link>
              </li>
              <li v-if="!authStore.isAuthenticated">
                <router-link class="dropdown-item custom-dropdown-item" to="/register">Register</router-link>
              </li>
              <li v-if="authStore.isAuthenticated">
                <a class="dropdown-item custom-dropdown-item" href="#" @click.prevent="handleLogout">Logout</a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

const totalItems = computed(() => {
  const count = cartStore.totalItems;
  console.log('[TheHeader] Cart total items:', count);
  return count;
});

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login'); 
  } catch (error) {
    console.error('Logout failed:', error);
    alert('Logout failed. Please try again.');
  }
};

onMounted(() => {
  cartStore.fetchUserCart();
});
</script>

<style scoped>
/* Custom Navbar Styling */
.custom-navbar-bg {
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%); /* Purple to Blue Gradient */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Modern Font */
}

.navbar-brand {
  color: #fff !important;
  font-weight: bold;
  font-size: 1.8rem;
  transition: transform 0.3s ease;
}

.navbar-brand:hover {
  transform: scale(1.05);
}

.text-shadow-custom {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}

.custom-toggler {
  border-color: rgba(255, 255, 255, 0.5) !important;
}

.custom-toggler .navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 0.8%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e") !important;
}

.custom-nav-link {
  color: #fff !important;
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  margin: 0 0.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.custom-nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.custom-nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
  transform: translateX(-100%);
  transition: transform 0.3s ease-out;
  z-index: -1;
}

.custom-nav-link:hover::before {
  transform: translateX(0%);
}

.custom-nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  border-bottom: 3px solid #ff69b4; /* Hot pink for active link */
}

/* Cart Badge Styling */
.cart-badge-position {
  position: absolute;
  top: -2px; /* Dịch lên trên một chút */
  right: -2px; /* Dịch sang phải một chút */
  transform: none; /* Bỏ translate-middle để kiểm soát vị trí bằng top/right */
  font-size: 0.75em; /* Kích thước chữ nhỏ hơn */
  padding: 0.2em 0.5em; /* Đệm nhỏ hơn */
}

/* Cart Badge Animation */
@keyframes bounce-once-bs {
  0%, 100% {
    transform: translateY(0);
  }
  20%, 80% {
    transform: translateY(-5px);
  }
  40%, 60% {
    transform: translateY(-2px);
  }
}

.animate-bounce-once-bs {
  animation: bounce-once-bs 1s ease-in-out;
}

/* Dropdown Menu */
.custom-dropdown-menu {
  background-color: #fff;
  border: none;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  padding: 0.5rem 0;
}

.custom-dropdown-item {
  color: #333;
  padding: 0.75rem 1.5rem;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.custom-dropdown-item:hover {
  background-color: #e0f2f7; /* Light blue hover */
  color: #0d47a1; /* Dark blue text */
}

/* Responsive adjustments for smaller screens */
@media (max-width: 991.98px) { /* Corresponds to Bootstrap's lg breakpoint */
  .navbar-nav {
    text-align: center;
  }
  .custom-nav-link {
    margin: 0.5rem auto;
    width: fit-content;
    display: flex;
    justify-content: center;
  }
  .navbar-collapse {
    background: linear-gradient(180deg, #6a11cb 0%, #2575fc 100%); /* Gradient for collapsed menu */
    border-radius: 0 0 10px 10px;
    padding-bottom: 1rem;
    margin-top: 0.5rem;
  }
  .custom-dropdown-menu {
    position: static; /* Make dropdown static in mobile view */
    width: 100%;
    box-shadow: none;
    background: none;
  }
  .custom-dropdown-item {
    text-align: center;
  }
}
</style>