<template>
  <section class="instagram-feed py-5">
    <div class="container">
      <div class="text-center mb-5">
        <h2 class="section-title">Follow Us on Instagram</h2>
        <p class="section-subtitle">@fashivo_fashion - Join our community of style enthusiasts</p>
        <a href="https://instagram.com/fashivo_fashion" target="_blank" class="btn btn-outline-primary">
          <i class="bi bi-instagram"></i> Follow Us
        </a>
      </div>
      
      <div class="instagram-grid">
        <div v-for="post in instagramPosts" :key="post.id" class="instagram-post">
          <div class="post-image">
            <img :src="post.image" :alt="post.caption" class="img-fluid">
            <div class="post-overlay">
              <div class="post-info">
                <div class="post-stats">
                  <span><i class="bi bi-heart"></i> {{ post.likes }}</span>
                  <span><i class="bi bi-chat"></i> {{ post.comments }}</span>
                </div>
                <p class="post-caption">{{ post.caption }}</p>
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
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400',
    caption: 'Summer vibes only ☀️ #OOTD',
    likes: 1234,
    comments: 89
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400',
    caption: 'Street style perfection 🖤',
    likes: 2156,
    comments: 156
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400',
    caption: 'Accessories that make the outfit ✨',
    likes: 987,
    comments: 45
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
    caption: 'Step up your shoe game 👟',
    likes: 3421,
    comments: 234
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400',
    caption: 'Cozy autumn essentials 🍂',
    likes: 1789,
    comments: 123
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
    caption: 'Weekend casual goals 👕',
    likes: 2567,
    comments: 198
  }
]
</script>

<style scoped>
.instagram-feed {
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

.instagram-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 3rem;
}

.instagram-post {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  aspect-ratio: 1;
  cursor: pointer;
  transition: all 0.3s ease;
}

.instagram-post:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.post-image {
  position: relative;
  width: 100%;
  height: 100%;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.instagram-post:hover .post-image img {
  transform: scale(1.1);
}

.post-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.instagram-post:hover .post-overlay {
  opacity: 1;
}

.post-info {
  text-align: center;
  color: white;
  padding: 20px;
}

.post-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 10px;
}

.post-stats span {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
}

.post-caption {
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
}

.btn-outline-primary {
  border: 2px solid #667eea;
  color: #667eea;
  padding: 12px 30px;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-outline-primary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }
  
  .instagram-grid {
    grid-template-columns: 1fr;
  }
}
</style>
