<template>
  <section class="brand-story py-5">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg-6">
          <div class="brand-content">
            <h2 class="section-title">Our Story</h2>
            <p class="brand-description">
              Founded in 2020, Fashivo emerged from a simple belief: fashion should be accessible, 
              sustainable, and empowering. We started as a small boutique with big dreams, 
              and today we're proud to serve thousands of fashion-forward customers worldwide.
            </p>
            <div class="brand-values">
              <div class="value-item">
                <div class="value-icon">
                  <i class="bi bi-leaf"></i>
                </div>
                <div class="value-content">
                  <h4>Sustainable Fashion</h4>
                  <p>Eco-friendly materials and ethical production practices</p>
                </div>
              </div>
              <div class="value-item">
                <div class="value-icon">
                  <i class="bi bi-award"></i>
                </div>
                <div class="value-content">
                  <h4>Quality First</h4>
                  <p>Carefully curated collections with attention to detail</p>
                </div>
              </div>
              <div class="value-item">
                <div class="value-icon">
                  <i class="bi bi-heart"></i>
                </div>
                <div class="value-content">
                  <h4>Customer Love</h4>
                  <p>Dedicated to making every customer feel confident and beautiful</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="brand-image">
            <div class="image-collage">
              <div class="collage-item main-image">
                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600" alt="Store" class="img-fluid rounded">
              </div>
              <div class="collage-item small-image-1">
                <img src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=300" alt="Fashion" class="img-fluid rounded">
              </div>
              <div class="collage-item small-image-2">
                <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300" alt="Fashion" class="img-fluid rounded">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// No additional script needed for this component
</script>

<style scoped>
.brand-story {
  background: #f8f9fa;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 2rem;
}

.brand-description {
  font-size: 1.2rem;
  color: #666;
  line-height: 1.8;
  margin-bottom: 2rem;
}

.brand-values {
  margin-top: 2rem;
}

.value-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.value-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.value-icon i {
  font-size: 1.5rem;
  color: white;
}

.value-content h4 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.value-content p {
  color: #666;
  margin: 0;
}

.brand-image {
  position: relative;
}

.image-collage {
  position: relative;
  height: 500px;
}

.collage-item {
  position: absolute;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.main-image {
  top: 50px;
  left: 0;
  width: 400px;
  height: 300px;
}

.small-image-1 {
  top: 0;
  right: 50px;
  width: 200px;
  height: 150px;
}

.small-image-2 {
  bottom: 50px;
  right: 0;
  width: 250px;
  height: 180px;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }
  
  .image-collage {
    height: auto;
    margin-top: 2rem;
  }
  
  .collage-item {
    position: relative;
    width: 100%;
    height: 200px;
    margin-bottom: 1rem;
  }
}
</style>
