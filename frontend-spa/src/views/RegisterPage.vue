<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header text-center">
            <h3>Register</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label for="name" class="form-label">Full Name</label>
                <input type="text" class="form-control" id="name" v-model="name" required autocomplete="name">
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email address</label>
                <input type="email" class="form-control" id="email" v-model="email" required autocomplete="email">
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" v-model="password" required autocomplete="new-password">
              </div>
              <div class="mb-3">
                <label for="passwordConfirm" class="form-label">Confirm Password</label>
                <input type="password" class="form-control" id="passwordConfirm" v-model="passwordConfirm" required autocomplete="new-password">
              </div>
              <div class="mb-3">
                <label for="phone" class="form-label">Phone Number</label>
                <input type="tel" class="form-control" id="phone" v-model="phone" autocomplete="tel">
              </div>
              <div class="mb-3">
                <label for="address" class="form-label">Address</label>
                <textarea class="form-control" id="address" v-model="address" autocomplete="street-address"></textarea>
              </div>
              <div class="mb-3">
                <label for="avatar" class="form-label">Avatar (Optional)</label>
                <input type="file" class="form-control" id="avatar" @change="handleAvatarUpload">
              </div>
              <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
              <button type="submit" class="btn btn-success w-100" :disabled="isLoading">
                <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Register
              </button>
            </form>
            <p class="mt-3 text-center">
              Already have an account? <router-link to="/login">Login here</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';

const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const phone = ref('');
const address = ref('');
const avatarFile = ref(null);
const errorMessage = ref('');
const isLoading = ref(false);
const router = useRouter();
const authStore = useAuthStore();

const handleAvatarUpload = (event) => {
  avatarFile.value = event.target.files[0];
};

const handleRegister = async () => {
  errorMessage.value = '';
  isLoading.value = true;

  if (password.value !== passwordConfirm.value) {
    errorMessage.value = 'Passwords do not match.';
    isLoading.value = false;
    return;
  }

  try {
    const userData = {
      name: name.value,
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
      phone: phone.value,
      address: address.value,
      avatarFile: avatarFile.value,
      role: 'user' // Mặc định là user
    };
    await authStore.signup(userData);
    alert('Registration successful! Please login.'); // Thay bằng modal thông báo
    router.push('/login');
  } catch (error) {
    errorMessage.value = error.message || 'Registration failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Add any specific styles for the register page here */
</style>
