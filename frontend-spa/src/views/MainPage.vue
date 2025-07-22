<script setup>
import { ref, onMounted } from 'vue'
import HeroSection from '@/components/HeroSection.vue'
import FeaturedCategories from '@/components/FeaturedCategories.vue'
import NewArrivals from '@/components/NewArrivals.vue'
import BrandStory from '@/components/BrandStory.vue'
import NewsletterSignup from '@/components/NewsletterSignup.vue'
import InstagramFeed from '@/components/InstagramFeed.vue'

const isLoading = ref(true)

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})
</script>

<template>
  <div class="main-page">
    <!-- Loading Screen -->
    <div v-if="isLoading" class="loading-screen">
      <div class="spinner"></div>
    </div>

    <!-- Hero Section -->
    <HeroSection />

    <!-- Featured Categories -->
    <FeaturedCategories />

    <!-- New Arrivals -->
    <NewArrivals />

    <!-- Brand Story -->
    <BrandStory />

    <!-- Instagram Feed -->
    <InstagramFeed />

    <!-- Newsletter Signup -->
    <NewsletterSignup />
  </div>
</template>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #ff6b6b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.main-page {
  min-height: 100vh;
}
</style>
