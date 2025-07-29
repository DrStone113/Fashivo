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
        <div class="carousel-caption">
          <h5 class="animated-text">Big Fashion Sale!</h5>
          <p class="animated-text">Up to 50% off on all items.</p>
        </div>
      </div>
      <div class="carousel-item">
        <img src="../assets/so0lavfi.png" class="d-block w-100"
          alt="New Arrivals">
        <div class="carousel-caption">
          <h5 class="animated-text">Discover Our New Collection</h5>
          <p class="animated-text">Fresh styles for every season.</p>
        </div>
      </div>
      <div class="carousel-item">
        <img src="../assets/a6kkdttw.png" class="d-block w-100"
          alt="Winter Collection">
        <div class="carousel-caption">
          <h5 class="animated-text">Stay Warm in Style</h5>
          <p class="animated-text">Explore our cozy winter collection.</p>
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
/* CẢI TIẾN: Đảm bảo carousel có chiều cao cố định để tránh bị giật */
.carousel-item {
  height: 80vh; /* Chiều cao tương đối so với màn hình */
  min-height: 400px; /* Chiều cao tối thiểu */
  max-height: 600px; /* Chiều cao tối đa */
  background-color: #777; /* Màu nền cho trường hợp ảnh chưa tải kịp */
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Đảm bảo ảnh lấp đầy khung mà không bị méo */
  object-position: center; /* Căn giữa ảnh */
}

/* CẢI TIẾN: Làm nổi bật phần chữ (caption) */
.carousel-caption {
  /* Bỏ class d-none d-md-block để caption luôn hiển thị */
  display: block !important; 
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 1rem;
  text-align: center;
  /* Lớp phủ gradient từ đen mờ đến trong suốt để làm nổi bật chữ */
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 20%, rgba(0, 0, 0, 0) 100%);
  color: #fff;
}

.carousel-caption h5 {
  font-size: 2.5rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Đổ bóng cho chữ */
}

.carousel-caption p {
  font-size: 1.2rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

/* Thêm hiệu ứng animation cho chữ khi slide xuất hiện */
.carousel-item.active .animated-text {
  animation: fadeInBottom 0.6s ease-in-out 0.3s both;
}

@keyframes fadeInBottom {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Điều chỉnh cho màn hình nhỏ hơn */
@media (max-width: 768px) {
  .carousel-item {
    height: 50vh;
  }
  .carousel-caption h5 {
    font-size: 1.8rem;
  }
  .carousel-caption p {
    font-size: 1rem;
  }
}
</style>
