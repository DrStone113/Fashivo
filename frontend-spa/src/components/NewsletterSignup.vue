<template>
  <section class="newsletter-signup py-5">
    <div class="container">
      <div class="newsletter-content">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <div class="newsletter-text">
              <h2 class="section-title">Stay in Style</h2>
              <p class="section-subtitle">
                Subscribe to our newsletter and get 15% off your first order! 
                Be the first to know about new arrivals, exclusive offers, and fashion tips.
              </p>
              <div class="newsletter-stats">
                <div class="stat">
                  <span class="stat-number">50K+</span>
                  <span class="stat-label">Subscribers</span>
                </div>
                <div class="stat">
                  <span class="stat-number">Weekly</span>
                  <span class="stat-label">Updates</span>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="newsletter-form">
              <form @submit.prevent="handleSubmit" class="form-container">
                <div class="form-group">
                  <input 
                    v-model="email" 
                    type="email" 
                    class="form-control" 
                    placeholder="Enter your email address"
                    required
                  >
                  <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                    <span v-if="!isSubmitting">Subscribe</span>
                    <span v-else>
                      <i class="bi bi-arrow-clockwise spin"></i> Subscribing...
                    </span>
                  </button>
                </div>
                <div class="form-check mt-3">
                  <input 
                    v-model="agreedToTerms" 
                    type="checkbox" 
                    class="form-check-input" 
                    id="termsCheck"
                    required
                  >
                  <label class="form-check-label" for="termsCheck">
                    I agree to receive promotional emails and accept the privacy policy
                  </label>
                </div>
                <div v-if="message" class="alert mt-3" :class="messageType">
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
    messageType.value = 'alert-danger'
    return
  }

  isSubmitting.value = true
  
  // Simulate API call
  setTimeout(() => {
    message.value = 'Welcome to Fashivo! Check your email for 15% off coupon.'
    messageType.value = 'alert-success'
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
.newsletter-signup {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.newsletter-content {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 60px;
  backdrop-filter: blur(10px);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.newsletter-stats {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.form-container {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.form-group {
  position: relative;
  display: flex;
  gap: 10px;
}

.form-control {
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #e9ecef;
  border-radius: 50px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 15px 30px;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-check-label {
  color: #333;
  font-size: 0.9rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.alert {
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .newsletter-content {
    padding: 30px;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .form-group {
    flex-direction: column;
  }
  
  .newsletter-stats {
    justify-content: center;
  }
}
</style>
