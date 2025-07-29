<template>
  <section class="featured-categories-styled py-5">
    <div class="container">
      <div class="text-center mb-5">
        <h2 class="section-title-styled">Shop by Category</h2>
        <p class="section-subtitle-styled">Find your perfect style from our curated collections</p>
      </div>
      
      <div class="row g-4 justify-content-center">
        <div v-for="category in categories" :key="category.id" class="col-lg-3 col-md-6 col-sm-10">
          <div class="category-card-styled" @click="navigateToCategory(category.slug)">
            <div class="category-image-wrapper">
              <img :src="category.image" :alt="category.name" class="img-fluid category-image-styled">
              <div class="category-overlay-styled">
                <div class="category-content-styled">
                  <h3 class="category-name-styled">{{ category.name }}</h3>
                  <p class="category-count-styled">{{ category.count }} items</p>
                  <button class="btn-shop-now">Shop Now</button>
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
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=600&auto=format&fit=crop',
    count: 150
  },
  {
    id: 2,
    name: 'Men\'s Collection',
    slug: 'men',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop',
    count: 120
  },
  {
    id: 3,
    name: 'Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop',
    count: 80
  },
  {
    id: 4,
    name: 'Shoes',
    slug: 'shoes',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop',
    count: 95
  }
]

const navigateToCategory = (slug) => {
  router.push(`/menu?category=${slug}`)
}
</script>

<style scoped>
/* General Section Styling */
.featured-categories-styled {
  background: linear-gradient(to bottom, #f0f2f5, #e0e2e5); /* Subtle gradient background */
  padding-top: 6rem;
  padding-bottom: 6rem;
  font-family: 'Poppins', sans-serif; /* Changed font to Poppins for modern feel */
}

/* Section Titles */
.section-title-styled {
  font-size: 3.5rem; /* Larger title */
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2); /* Stronger text shadow */
  background: linear-gradient(45deg, #6a11cb, #2575fc); /* Blue-purple gradient */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text; /* Standard property */
  color: transparent; /* Standard property */
  display: inline-block; /* Essential for background-clip */
  animation: scaleIn 0.8s ease-out;
}

.section-subtitle-styled {
  font-size: 1.4rem; /* Slightly larger subtitle */
  color: #555; /* Darker grey for better contrast */
  margin-bottom: 4rem; /* More space below subtitle */
  opacity: 0.9;
  animation: fadeIn 1s ease-out 0.2s forwards;
  opacity: 0; /* Start hidden for animation */
}

/* Keyframe Animations (Included here for self-containment, but consider global if issues persist) */
@keyframes scaleIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

/* Category Card Styling */
.category-card-styled {
  position: relative;
  border-radius: 25px; /* Even more rounded corners */
  overflow: hidden;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1); /* Slower, smoother transition */
  height: 350px; /* Taller cards for better visual impact */
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); /* More prominent initial shadow */
  background-color: #fff;
  display: flex; /* Use flex to ensure content fills card */
  flex-direction: column;
}

.category-card-styled:hover {
  transform: translateY(-20px) scale(1.03); /* More dramatic lift and scale */
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35); /* Very strong, dramatic shadow */
  border: 3px solid #6a11cb; /* Stronger border color on hover */
}

.category-image-wrapper {
  position: relative;
  height: 100%; /* Take full height of parent */
  overflow: hidden;
  flex-grow: 1; /* Allow image wrapper to grow and fill space */
}

.category-image-styled {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensure image covers the area */
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.category-card-styled:hover .category-image-styled {
  transform: scale(1.2); /* Even more zoom on hover */
}

.category-overlay-styled {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.9) 100%); /* Even darker gradient */
  display: flex;
  align-items: flex-end; /* Align content to the bottom */
  padding: 30px; /* More padding */
  opacity: 0; /* Start hidden */
  transition: opacity 0.5s ease;
  z-index: 2; /* Ensure overlay is above image and other elements */
}

.category-card-styled:hover .category-overlay-styled {
  opacity: 1; /* Show on hover */
}

.category-content-styled {
  color: white;
  text-align: left;
  width: 100%; /* Take full width of overlay */
}

.category-name-styled {
  font-size: 2rem; /* Even larger name */
  font-weight: 800; /* Bolder */
  margin-bottom: 0.8rem;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.6); /* Stronger text shadow */
}

.category-count-styled {
  font-size: 1.1rem; /* Slightly larger count */
  margin-bottom: 1.5rem; /* More space above button */
  opacity: 0.95;
}

/* Shop Now Button */
.btn-shop-now {
  background: linear-gradient(45deg, #6a11cb, #2575fc); /* Blue-purple gradient */
  color: white;
  border: none;
  padding: 14px 35px; /* Larger padding */
  border-radius: 35px; /* Even more rounded button */
  font-weight: 700;
  font-size: 1.1rem; /* Larger font */
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3); /* Stronger shadow */
  transition: all 0.3s ease;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px; /* More letter spacing */
  display: inline-block;
  position: relative;
  z-index: 3; /* Ensure button is on top */
}

.btn-shop-now:hover {
  background: linear-gradient(45deg, #6a11cb, #2575fc); /* Blue-purple gradient */
  transform: translateY(-5px) scale(1.05); /* More dramatic lift and scale */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
}

/* Responsive adjustments */
@media (max-width: 991.98px) { /* Medium devices (md) */
  .section-title-styled {
    font-size: 2.8rem;
  }
  .section-subtitle-styled {
    font-size: 1.2rem;
  }
  .category-card-styled {
    height: 300px;
  }
  .category-name-styled {
    font-size: 1.8rem;
  }
  .btn-shop-now {
    padding: 12px 30px;
    font-size: 1rem;
  }
}

@media (max-width: 767.98px) { /* Small devices (sm) */
  .section-title-styled {
    font-size: 2.2rem;
  }
  .section-subtitle-styled {
    font-size: 1.1rem;
  }
  .category-card-styled {
    height: 280px;
  }
  .category-name-styled {
    font-size: 1.6rem;
  }
  .btn-shop-now {
    padding: 10px 25px;
    font-size: 0.95rem;
  }
}

@media (max-width: 575.98px) { /* Extra small devices (xs) */
  .category-card-styled {
    height: 320px; /* Adjust for single column view */
  }
  .section-title-styled {
    font-size: 2rem;
  }
  .section-subtitle-styled {
    font-size: 1rem;
  }
}
</style>
