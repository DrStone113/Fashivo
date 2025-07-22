<template>
  <div id="mainCarousel" class="carousel slide" data-bs-ride="carousel">
    <div class="carousel-indicators">
      <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="0" class="active" aria-current="true"
        aria-label="Slide 1"></button>
      <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
      <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
    </div>
    <div class="carousel-inner">
      <div class="carousel-item active">
        <img src="../assets/8gu5u79u.png" class="d-block w-100"
          alt="Fashion Sale">
        <div class="carousel-caption d-none d-md-block">
          <h5>Big Fashion Sale!</h5>
          <p>Up to 50% off on all items.</p>
        </div>
      </div>
      <div class="carousel-item">
        <img src="../assets/so0lavfi.png" class="d-block w-100"
          alt="New Arrivals">
        <div class="carousel-caption d-none d-md-block">
          <h5>Discover Our New Collection</h5>
          <p>Fresh styles for every season.</p>
        </div>
      </div>
      <div class="carousel-item">
        <img src="../assets/a6kkdttw.png" class="d-block w-100"
          alt="Winter Collection">
        <div class="carousel-caption d-none d-md-block">
          <h5>Stay Warm in Style</h5>
          <p>Explore our cozy winter collection.</p>
        </div>
      </div>
    </div>
    <button class="carousel-control-prev" type="button" data-bs-target="#mainCarousel" data-bs-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button class="carousel-control-next" type="button" data-bs-target="#mainCarousel" data-bs-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>
</template>

<script setup>
// No specific logic needed for a static carousel
</script>

<style scoped>
/* Add any specific styles for the carousel here */
</style>