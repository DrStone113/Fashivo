<template>
  <section class="brand-story-section py-5">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg-6">
          <div class="brand-content-wrapper">
            <h2 class="section-title-text">Our Story</h2>
            <p class="brand-description-text">
              Founded in 2020, Fashivo emerged from a simple belief: fashion should be accessible, 
              sustainable, and empowering. We started as a small boutique with big dreams, 
              and today we're proud to serve thousands of fashion-forward customers worldwide.
            </p>
            <div class="brand-values-list">
              <div class="value-item-styled">
                <div class="value-icon-circle">
                  <i class="bi bi-leaf"></i>
                </div>
                <div class="value-text-content">
                  <h4>Sustainable Fashion</h4>
                  <p>Eco-friendly materials and ethical production practices</p>
                </div>
              </div>
              <div class="value-item-styled">
                <div class="value-icon-circle">
                  <i class="bi bi-award"></i>
                </div>
                <div class="value-text-content">
                  <h4>Quality First</h4>
                  <p>Carefully curated collections with attention to detail</p>
                </div>
              </div>
              <div class="value-item-styled">
                <div class="value-icon-circle">
                  <i class="bi bi-heart"></i>
                </div>
                <div class="value-text-content">
                  <h4>Customer Love</h4>
                  <p>Dedicated to making every customer feel confident and beautiful</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-6 mt-4 mt-lg-0">
          <div class="brand-image-container">
            <div class="image-collage-grid">
              <div class="collage-item-styled main-image-styled">
                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop" alt="Store" class="img-fluid rounded-lg shadow-lg">
              </div>
              <div class="collage-item-styled small-image-1-styled">
                <img src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=300&auto=format&fit=crop" alt="Fashion" class="img-fluid rounded-lg shadow-lg">
              </div>
              <div class="collage-item-styled small-image-2-styled">
                <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=300&auto=format&fit=crop" alt="Fashion" class="img-fluid rounded-lg shadow-lg">
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
/* General Section Styling */
.brand-story-section {
  background: linear-gradient(to bottom, #f8f9fa, #f0f2f5); /* Light, subtle gradient background */
  padding-top: 6rem;
  padding-bottom: 6rem;
  font-family: 'Poppins', sans-serif; /* Poppins font for modern feel */
}

/* Section Titles */
.section-title-text {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 2rem;
  text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
  background: linear-gradient(45deg, #6a11cb, #2575fc); /* Blue-purple gradient */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  display: inline-block;
  animation: scaleIn 0.8s ease-out;
}

/* Keyframe Animations (Included here for self-containment, but consider global if issues persist) */
@keyframes scaleIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.brand-description-text {
  font-size: 1.25rem; /* Slightly larger description */
  color: #444; /* Darker text for better readability */
  line-height: 1.8;
  margin-bottom: 3rem; /* More space below description */
}

/* Brand Values List */
.brand-values-list {
  margin-top: 2rem;
}

.value-item-styled {
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem; /* More space between items */
  transition: transform 0.3s ease-out;
}

.value-item-styled:hover {
  transform: translateX(10px); /* Slight slide on hover */
}

.value-icon-circle {
  width: 70px; /* Larger icons */
  height: 70px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); /* Blue-purple gradient */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem; /* More space to text */
  flex-shrink: 0;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); /* Shadow for icon */
  transition: all 0.3s ease;
}

.value-item-styled:hover .value-icon-circle {
  transform: scale(1.1); /* Pop effect on hover */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.value-icon-circle i {
  font-size: 2rem; /* Larger icon size */
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
}

.value-text-content h4 {
  font-size: 1.5rem; /* Larger heading */
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
}

.value-text-content p {
  color: #666;
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
}

/* Brand Image Collage */
.brand-image-container {
  position: relative;
  min-height: 550px; /* Ensure enough space for collage */
  display: flex; /* Use flex to help position images */
  align-items: center;
  justify-content: center;
}

.image-collage-grid {
  position: relative;
  width: 100%; /* Take full width of parent */
  height: 550px; /* Fixed height for the collage area */
}

.collage-item-styled {
  position: absolute;
  border-radius: 20px; /* More rounded corners */
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2); /* Deeper shadow */
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); /* Smooth transition */
  border: 4px solid #fff; /* White border for pop effect */
}

.collage-item-styled img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block; /* Remove extra space below image */
}

.collage-item-styled:hover {
  transform: scale(1.05) rotate(2deg); /* Slight scale and rotate on hover */
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3); /* Even deeper shadow */
  z-index: 10; /* Bring hovered image to front */
}

/* Positioning for collage items */
.main-image-styled {
  top: 50px;
  left: 0;
  width: 70%; /* Larger main image */
  height: 70%;
  max-width: 450px; /* Max width for larger screens */
  max-height: 350px; /* Max height for larger screens */
  z-index: 3;
}

.small-image-1-styled {
  top: 0;
  right: 0;
  width: 40%; /* Adjust size */
  height: 40%;
  max-width: 250px;
  max-height: 200px;
  z-index: 2;
}

.small-image-2-styled {
  bottom: 0;
  right: 0;
  width: 50%; /* Adjust size */
  height: 50%;
  max-width: 300px;
  max-height: 250px;
  z-index: 4; /* Bring this image slightly forward */
}

/* Responsive adjustments */
@media (max-width: 991.98px) { /* Medium devices (md) */
  .section-title-text {
    font-size: 2.8rem;
  }
  .brand-description-text {
    font-size: 1.15rem;
  }
  .value-icon-circle {
    width: 60px;
    height: 60px;
  }
  .value-icon-circle i {
    font-size: 1.8rem;
  }
  .value-text-content h4 {
    font-size: 1.3rem;
  }
  .value-text-content p {
    font-size: 0.95rem;
  }
  .brand-image-container {
    min-height: 450px; /* Adjust min-height for smaller screens */
  }
  .image-collage-grid {
    height: 450px;
  }
  .main-image-styled {
    width: 60%;
    height: 60%;
    top: 40px;
    left: 10%;
  }
  .small-image-1-styled {
    width: 35%;
    height: 35%;
    top: 10px;
    right: 10%;
  }
  .small-image-2-styled {
    width: 45%;
    height: 45%;
    bottom: 10px;
    right: 10%;
  }
}

@media (max-width: 767.98px) { /* Small devices (sm) */
  .section-title-text {
    font-size: 2.2rem;
  }
  .brand-description-text {
    font-size: 1rem;
  }
  .value-item-styled {
    flex-direction: column; /* Stack icon and text vertically */
    align-items: center;
    text-align: center;
  }
  .value-icon-circle {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  .brand-image-container {
    min-height: auto; /* Allow height to adjust naturally */
    margin-top: 3rem;
  }
  .image-collage-grid {
    position: static; /* Remove absolute positioning for mobile collage */
    height: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem; /* Space between stacked images */
  }
  .collage-item-styled {
    position: static; /* Remove absolute positioning */
    width: 100% !important; /* Full width */
    height: auto; /* Auto height */
    max-width: none !important; /* Remove max-width */
    max-height: none !important; /* Remove max-height */
    transform: none !important; /* Remove transforms */
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); /* Lighter shadow for stacked images */
    border: 2px solid #fff; /* Lighter border */
  }
}

@media (max-width: 575.98px) { /* Extra small devices (xs) */
  .section-title-text {
    font-size: 2rem;
  }
  .brand-description-text {
    font-size: 0.95rem;
  }
}
</style>
