<template>
  <section class="instagram-feed-section py-5">
    <div class="container">
      <div class="text-center mb-5">
        <h2 class="section-title-text">Follow Us on Instagram</h2>
        <p class="section-subtitle-text">@fashivo_fashion - Join our community of style enthusiasts</p>
        <a href="https://instagram.com/fashivo_fashion" target="_blank" class="btn-follow-us">
          <i class="bi bi-instagram me-2"></i> Follow Us
        </a>
      </div>
      
      <div class="instagram-grid-styled">
        <div v-for="post in instagramPosts" :key="post.id" class="instagram-post-card">
          <div class="post-image-wrapper">
            <img :src="post.image" :alt="post.caption" class="img-fluid post-image-styled">
            <div class="post-overlay-styled">
              <div class="post-info-content">
                <div class="post-stats-list">
                  <span><i class="bi bi-heart me-1"></i> {{ post.likes }}</span>
                  <span><i class="bi bi-chat me-1"></i> {{ post.comments }}</span>
                </div>
                <p class="post-caption-text">{{ post.caption }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const instagramPosts = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=600&auto=format&fit=crop',
    caption: 'Summer vibes only ☀️ #OOTD',
    likes: 1234,
    comments: 89
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop',
    caption: 'Street style perfection 🖤',
    likes: 2156,
    comments: 156
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop',
    caption: 'Accessories that make the outfit ✨',
    likes: 987,
    comments: 45
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop',
    caption: 'Step up your shoe game 👟',
    likes: 3421,
    comments: 234
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=600&auto=format&fit=crop',
    caption: 'Cozy autumn essentials 🍂',
    likes: 1789,
    comments: 123
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop',
    caption: 'Weekend casual goals 👕',
    likes: 2567,
    comments: 198
  }
]
</script>

<style scoped>
/* General Section Styling */
.instagram-feed-section {
  background: linear-gradient(to bottom, #f8f9fa, #e0e2e5); /* Subtle gradient background */
  padding-top: 6rem;
  padding-bottom: 6rem;
  font-family: 'Poppins', sans-serif; /* Poppins font */
}

/* Section Titles */
.section-title-text {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
  background: linear-gradient(45deg, #a855f7, #ec4899); /* Vibrant Purple to Pink Gradient */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  display: inline-block;
  animation: scaleIn 0.8s ease-out;
}

.section-subtitle-text {
  font-size: 1.4rem;
  color: #555;
  margin-bottom: 2.5rem; /* Slightly less margin than other sections */
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

/* Follow Us Button */
.btn-follow-us {
  background: linear-gradient(45deg, #6a11cb, #2575fc); /* Blue-purple gradient */
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 35px; /* More rounded */
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: inline-flex; /* For icon alignment */
  align-items: center;
  justify-content: center;
  text-decoration: none; /* Remove underline */
}

.btn-follow-us:hover {
  background: linear-gradient(45deg, #2575fc, #6a11cb); /* Reverse gradient on hover */
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

/* Instagram Grid */
.instagram-grid-styled {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px; /* Increased gap */
  margin-top: 4rem; /* More space from button */
}

.instagram-post-card {
  position: relative;
  border-radius: 20px; /* More rounded corners */
  overflow: hidden;
  aspect-ratio: 1 / 1; /* Square aspect ratio */
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); /* Initial subtle shadow */
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); /* Smoother transition */
  background-color: #fff; /* Fallback background */
}

.instagram-post-card:hover {
  transform: translateY(-10px) scale(1.02); /* Lift and slight scale on hover */
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); /* Deeper shadow on hover */
  border: 3px solid #ec4899; /* Pink border on hover */
}

.post-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.post-image-styled {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.instagram-post-card:hover .post-image-styled {
  transform: scale(1.15); /* Zoom effect on hover */
}

.post-overlay-styled {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75); /* Darker overlay for better text contrast */
  display: flex;
  align-items: center; /* Center content vertically */
  justify-content: center; /* Center content horizontally */
  opacity: 0;
  transition: opacity 0.4s ease;
  padding: 20px;
  z-index: 1;
}

.instagram-post-card:hover .post-overlay-styled {
  opacity: 1;
}

.post-info-content {
  text-align: center;
  color: white;
  width: 100%; /* Ensure content takes full width */
}

.post-stats-list {
  display: flex;
  justify-content: center;
  gap: 25px; /* More space between stats */
  margin-bottom: 15px; /* More space to caption */
  font-size: 1.1rem; /* Larger stats text */
  font-weight: 600;
}

.post-stats-list span {
  display: flex;
  align-items: center;
  gap: 8px; /* More space between icon and number */
}

.post-caption-text {
  font-size: 1rem; /* Slightly larger caption */
  margin: 0;
  line-height: 1.5;
  opacity: 0.9;
}

/* Responsive adjustments */
@media (max-width: 991.98px) { /* Medium devices (md) */
  .section-title-text {
    font-size: 2.8rem;
  }
  .section-subtitle-text {
    font-size: 1.2rem;
  }
  .btn-follow-us {
    padding: 12px 30px;
    font-size: 1rem;
  }
  .instagram-grid-styled {
    gap: 20px;
  }
  .post-stats-list {
    font-size: 1rem;
  }
  .post-caption-text {
    font-size: 0.95rem;
  }
}

@media (max-width: 767.98px) { /* Small devices (sm) */
  .section-title-text {
    font-size: 2.2rem;
  }
  .section-subtitle-text {
    font-size: 1.1rem;
  }
  .instagram-grid-styled {
    grid-template-columns: 1fr; /* Single column on mobile */
    gap: 25px;
  }
  .instagram-post-card {
    height: 350px; /* Adjust height for single column */
  }
  .post-stats-list {
    font-size: 1.1rem;
  }
  .post-caption-text {
    font-size: 1rem;
  }
}

@media (max-width: 575.98px) { /* Extra small devices (xs) */
  .section-title-text {
    font-size: 2rem;
  }
  .section-subtitle-text {
    font-size: 1rem;
  }
  .btn-follow-us {
    padding: 10px 25px;
    font-size: 0.9rem;
  }
  .instagram-post-card {
    height: 300px; /* Further adjust height for very small screens */
  }
}
</style>
