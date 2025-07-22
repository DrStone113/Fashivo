<template>
  <section class="featured-categories py-5">
    <div class="container">
      <div class="text-center mb-5">
        <h2 class="section-title">Shop by Category</h2>
        <p class="section-subtitle">Find your perfect style from our curated collections</p>
      </div>
      
      <div class="row g-4">
        <div v-for="category in categories" :key="category.id" class="col-lg-3 col-md-6">
          <div class="category-card" @click="navigateToCategory(category.slug)">
            <div class="category-image">
              <img :src="category.image" :alt="category.name" class="img-fluid">
              <div class="category-overlay">
                <div class="category-content">
                  <h3 class="category-name">{{ category.name }}</h3>
                  <p class="category-count">{{ category.count }} items</p>
                  <button class="btn btn-light btn-sm">Shop Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const categories = [
  {
    id: 1,
    name: 'Women\'s Fashion',
    slug: 'women',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400',
    count: 150
  },
  {
    id: 2,
    name: 'Men\'s Collection',
    slug: 'men',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400',
    count: 120
  },
  {
    id: 3,
    name: 'Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400',
    count: 80
  },
  {
    id: 4,
    name: 'Shoes',
    slug: 'shoes',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
    count: 95
  }
]

const navigateToCategory = (slug) => {
  router.push(`/menu?category=${slug}`)
}
</script>

<style scoped>
.featured-categories {
  background: #f8f9fa;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.category-card {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 300px;
}

.category-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.category-image {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.category-card:hover .category-image img {
  transform: scale(1.1);
}

.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
  display: flex;
  align-items: flex-end;
  padding: 20px;
}

.category-content {
  color: white;
}

.category-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.category-count {
  font-size: 0.9rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.btn-light {
  background: white;
  color: #333;
  border: none;
  padding: 8px 20px;
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-light:hover {
  background: #ff6b6b;
  color: white;
  transform: translateX(5px);
}

@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }
  
  .category-card {
    height: 250px;
  }
}
</style>
