<template>
  <section class="newsletter-signup-section py-5">
    <div class="container">
      <div class="newsletter-content-wrapper">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <div class="newsletter-text-content">
              <h2 class="section-title-text">Stay in Style</h2>
              <p class="section-subtitle-text">
                Subscribe to our newsletter and get 15% off your first order! 
                Be the first to know about new arrivals, exclusive offers, and fashion tips.
              </p>
              <div class="newsletter-stats-list">
                <div class="stat-item">
                  <span class="stat-number-text">50K+</span>
                  <span class="stat-label-text">Subscribers</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number-text">Weekly</span>
                  <span class="stat-label-text">Updates</span>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6 mt-4 mt-lg-0">
            <div class="newsletter-form-container">
              <form @submit.prevent="handleSubmit" class="form-styled">
                <div class="form-group-styled">
                  <input 
                    v-model="email" 
                    type="email" 
                    class="form-control-styled" 
                    placeholder="Enter your email address"
                    required
                  >
                  <button type="submit" class="btn-subscribe-styled" :disabled="isSubmitting">
                    <span v-if="!isSubmitting">Subscribe</span>
                    <span v-else>
                      <i class="bi bi-arrow-clockwise spin-animation"></i> Subscribing...
                    </span>
                  </button>
                </div>
                <div class="form-check-styled mt-3">
                  <input 
                    v-model="agreedToTerms" 
                    type="checkbox" 
                    class="form-check-input-styled" 
                    id="termsCheck"
                    required
                  >
                  <label class="form-check-label-styled" for="termsCheck">
                    I agree to receive promotional emails and accept the privacy policy
                  </label>
                </div>
                <div v-if="message" class="alert-styled mt-3" :class="messageType">
                  {{ message }}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const agreedToTerms = ref(false)
const isSubmitting = ref(false)
const message = ref('')
const messageType = ref('')

const handleSubmit = async () => {
  if (!email.value || !agreedToTerms.value) {
    message.value = 'Please fill in all fields and agree to the terms'
    messageType.value = 'alert-danger-styled' // Changed to styled class
    return
  }

  isSubmitting.value = true
  
  // Simulate API call
  setTimeout(() => {
    message.value = 'Welcome to Fashivo! Check your email for 15% off coupon.'
    messageType.value = 'alert-success-styled' // Changed to styled class
    email.value = ''
    agreedToTerms.value = false
    isSubmitting.value = false
    
    setTimeout(() => {
      message.value = ''
    }, 5000)
  }, 1500)
}
</script>

<style scoped>
/* General Section Styling */
.newsletter-signup-section {
  background: linear-gradient(45deg, #6a11cb, #2575fc); /* Blue-purple gradient */
  color: white;
  padding-top: 6rem;
  padding-bottom: 6rem;
  font-family: 'Poppins', sans-serif; /* Poppins font */
}

/* Newsletter Content Wrapper (Glassmorphism Effect) */
.newsletter-content-wrapper {
  background: rgba(255, 255, 255, 0.15); /* Slightly more opaque for better glass effect */
  border-radius: 30px; /* More rounded */
  padding: 60px;
  backdrop-filter: blur(15px); /* Stronger blur */
  -webkit-backdrop-filter: blur(15px); /* For Safari */
  border: 1px solid rgba(255, 255, 255, 0.2); /* Subtle white border */
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2); /* Deeper shadow */
}

/* Section Titles */
.section-title-text {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.3); /* Stronger text shadow */
  background: linear-gradient(45deg, #fff, #f0f0f0); /* White to light grey gradient for text */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  display: inline-block;
  animation: scaleIn 0.8s ease-out;
}

.section-subtitle-text {
  font-size: 1.35rem; /* Slightly larger subtitle */
  opacity: 0.95; /* More opaque */
  margin-bottom: 2.5rem; /* Adjusted margin */
  line-height: 1.7;
}

/* Keyframe Animations (Included here for self-containment, but consider global if issues persist) */
@keyframes scaleIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Newsletter Stats */
.newsletter-stats-list {
  display: flex;
  gap: 3rem; /* More space between stats */
  margin-top: 3rem; /* More space from subtitle */
}

.stat-item {
  text-align: center;
  position: relative;
  padding: 0 1rem;
}

.stat-number-text {
  display: block;
  font-size: 2.5rem; /* Larger number */
  font-weight: 800;
  color: #fff;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

.stat-number-text::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  height: 3px;
  background: white; /* White underline */
  border-radius: 2px;
  opacity: 0.7;
}

.stat-label-text {
  font-size: 1rem; /* Slightly larger label */
  opacity: 0.9;
  margin-top: 0.5rem;
  display: block;
}

/* Newsletter Form */
.newsletter-form-container {
  background: rgba(255, 255, 255, 0.95); /* Slightly transparent white */
  padding: 40px;
  border-radius: 20px; /* More rounded */
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15); /* Deeper shadow */
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-styled {
  /* No specific styles needed here, children will be styled */
}

.form-group-styled {
  position: relative;
  display: flex;
  gap: 15px; /* More space between input and button */
  flex-wrap: wrap; /* Allow wrapping on small screens */
}

.form-control-styled {
  flex: 1;
  padding: 18px 25px; /* Larger padding */
  border: 2px solid #e0e0e0; /* Lighter border */
  border-radius: 35px; /* More rounded */
  font-size: 1.1rem;
  transition: all 0.3s ease;
  background-color: #f8f8f8; /* Light grey background */
  color: #333;
}

.form-control-styled::placeholder {
  color: #aaa;
}

.form-control-styled:focus {
  border-color: #a855f7; /* Purple focus border */
  box-shadow: 0 0 0 0.25rem rgba(168, 85, 247, 0.25); /* Purple shadow */
  background-color: #fff;
}

.btn-subscribe-styled {
  background: linear-gradient(45deg, #6a11cb, #2575fc); /* Blue-purple gradient */
  color: white;
  border: none;
  padding: 18px 35px; /* Larger padding */
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
  flex-shrink: 0; /* Prevent button from shrinking */
}

.btn-subscribe-styled:hover:not(:disabled) {
  background: linear-gradient(45deg, #6a11cb, #2575fc); /* Blue-purple gradient */
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.btn-subscribe-styled:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(45deg, #ccc, #bbb); /* Greyed out when disabled */
  box-shadow: none;
}

.spin-animation {
  animation: spin 1s linear infinite;
  margin-right: 8px; /* Space between icon and text */
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Checkbox Styling */
.form-check-styled {
  margin-top: 1.5rem !important; /* Adjusted margin */
}

.form-check-input-styled {
  width: 1.25rem; /* Larger checkbox */
  height: 1.25rem;
  border: 2px solid #a855f7; /* Purple border */
  border-radius: 0.3rem; /* Slightly rounded */
  margin-top: 0.15rem; /* Align with text */
  transition: all 0.2s ease;
  cursor: pointer;
}

.form-check-input-styled:checked {
  background-color: #a855f7; /* Purple when checked */
  border-color: #a855f7;
  box-shadow: 0 0 0 0.25rem rgba(168, 85, 247, 0.25);
}

.form-check-input-styled:focus {
  box-shadow: 0 0 0 0.25rem rgba(168, 85, 247, 0.25);
}

.form-check-label-styled {
  color: #333; /* Darker text for readability */
  font-size: 1rem; /* Larger font */
  margin-left: 0.5rem; /* Space from checkbox */
  cursor: pointer;
}

/* Alert Messages */
.alert-styled {
  border-radius: 15px; /* More rounded alerts */
  padding: 18px; /* More padding */
  margin-bottom: 0;
  font-size: 1.05rem;
  font-weight: 600;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.alert-success-styled {
  background-color: #e6ffed; /* Light green */
  color: #1a5e20; /* Dark green text */
  border-color: #b2eecb;
}

.alert-danger-styled {
  background-color: #ffe6e6; /* Light red */
  color: #8c0000; /* Dark red text */
  border-color: #ffb2b2;
}

/* Responsive adjustments */
@media (max-width: 991.98px) { /* Medium devices (md) */
  .newsletter-content-wrapper {
    padding: 40px;
  }
  .section-title-text {
    font-size: 2.8rem;
  }
  .section-subtitle-text {
    font-size: 1.2rem;
  }
  .newsletter-stats-list {
    gap: 2rem;
    justify-content: center; /* Center stats on tablet */
  }
  .stat-number-text {
    font-size: 2.2rem;
  }
  .stat-label-text {
    font-size: 0.9rem;
  }
  .form-group-styled {
    flex-direction: column; /* Stack input and button */
    gap: 10px;
  }
  .form-control-styled, .btn-subscribe-styled {
    width: 100%;
    padding: 15px 20px;
    font-size: 1rem;
  }
}

@media (max-width: 767.98px) { /* Small devices (sm) */
  .newsletter-content-wrapper {
    padding: 30px;
  }
  .section-title-text {
    font-size: 2.2rem;
  }
  .section-subtitle-text {
    font-size: 1.1rem;
  }
  .newsletter-stats-list {
    flex-direction: column; /* Stack stats vertically */
    gap: 1.5rem;
  }
  .stat-number-text {
    font-size: 2rem;
  }
  .stat-label-text {
    font-size: 0.85rem;
  }
  .form-check-label-styled {
    font-size: 0.9rem;
  }
  .alert-styled {
    font-size: 0.95rem;
    padding: 15px;
  }
}

@media (max-width: 575.98px) { /* Extra small devices (xs) */
  .section-title-text {
    font-size: 2rem;
  }
  .section-subtitle-text {
    font-size: 1rem;
  }
  .stat-number-text {
    font-size: 1.8rem;
  }
}
</style>
