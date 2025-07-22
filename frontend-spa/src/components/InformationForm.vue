<template>
  <div class="information-form-container">
    <h4 class="mb-3">Your Profile Information</h4>
    <div v-if="!authStore.isAuthenticated" class="alert alert-warning text-center">
      Please <router-link to="/login">login</router-link> to view and update your profile.
    </div>
    <form v-else @submit.prevent="updateProfile">
      <div class="mb-3">
        <label for="name" class="form-label">Full Name</label>
        <input type="text" class="form-control" id="name" v-model="userForm.name" required>
      </div>
      <div class="mb-3">
        <label for="email" class="form-label">Email address</label>
        <input type="email" class="form-control" id="email" v-model="userForm.email" required disabled>
        <small class="form-text text-muted">Email cannot be changed.</small>
      </div>
      <div class="mb-3">
        <label for="phone" class="form-label">Phone Number</label>
        <input type="tel" class="form-control" id="phone" v-model="userForm.phone">
      </div>
      <div class="mb-3">
        <label for="address" class="form-label">Address</label>
        <textarea class="form-control" id="address" v-model="userForm.address"></textarea>
      </div>
      <div class="mb-3">
        <label for="avatar" class="form-label">Avatar</label>
        <input type="file" class="form-control" id="avatar" @change="handleAvatarUpload">
        <div v-if="userForm.avatar_url" class="mt-2">
          Current Avatar: <img :src="userForm.avatar_url" alt="Avatar" class="img-thumbnail" style="width: 100px;">
        </div>
      </div>

      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

      <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
        <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Update Profile
      </button>
    </form>

    <hr class="my-4">

    <h4 class="mb-3">Change Password</h4>
    <form v-if="authStore.isAuthenticated" @submit.prevent="changePassword">
      <div class="mb-3">
        <label for="currentPassword" class="form-label">Current Password</label>
        <input type="password" class="form-control" id="currentPassword" v-model="passwordForm.currentPassword" required>
      </div>
      <div class="mb-3">
        <label for="newPassword" class="form-label">New Password</label>
        <input type="password" class="form-control" id="newPassword" v-model="passwordForm.newPassword" required>
      </div>
      <div class="mb-3">
        <label for="newPasswordConfirm" class="form-label">Confirm New Password</label>
        <input type="password" class="form-control" id="newPasswordConfirm" v-model="passwordForm.newPasswordConfirm" required>
      </div>

      <div v-if="passwordErrorMessage" class="alert alert-danger">{{ passwordErrorMessage }}</div>
      <div v-if="passwordSuccessMessage" class="alert alert-success">{{ passwordSuccessMessage }}</div>

      <button type="submit" class="btn btn-warning w-100" :disabled="passwordLoading">
        <span v-if="passwordLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Change Password
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { useAuthStore } from '@/store/authStore';

const authStore = useAuthStore();

const userForm = reactive({
  name: '',
  email: '',
  address: '',
  phone: '',
  avatar_url: '',
  avatarFile: null,
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
});

const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const passwordLoading = ref(false);
const passwordErrorMessage = ref('');
const passwordSuccessMessage = ref('');

// Load user data when component mounts or authStore.user changes
onMounted(() => {
  if (authStore.isAuthenticated && authStore.user) {
    Object.assign(userForm, authStore.user);
  }
});

watch(() => authStore.user, (newUser) => {
  if (newUser) {
    Object.assign(userForm, newUser);
  }
}, { immediate: true });

const handleAvatarUpload = (event) => {
  userForm.avatarFile = event.target.files[0];
};

const updateProfile = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  isLoading.value = true;
  try {
    const dataToUpdate = {
      name: userForm.name,
      address: userForm.address,
      phone: userForm.phone,
      avatarFile: userForm.avatarFile,
    };
    await authStore.updateProfile(dataToUpdate);
    successMessage.value = 'Profile updated successfully!';
  } catch (error) {
    errorMessage.value = error.message || 'Failed to update profile.';
  } finally {
    isLoading.value = false;
  }
};

const changePassword = async () => {
  passwordErrorMessage.value = '';
  passwordSuccessMessage.value = '';
  passwordLoading.value = true;

  if (passwordForm.newPassword !== passwordForm.newPasswordConfirm) {
    passwordErrorMessage.value = 'New passwords do not match.';
    passwordLoading.value = false;
    return;
  }

  try {
    await authStore.updatePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword,
      passwordForm.newPasswordConfirm
    );
    passwordSuccessMessage.value = 'Password changed successfully!';
    // Clear password fields
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.newPasswordConfirm = '';
  } catch (error) {
    passwordErrorMessage.value = error.message || 'Failed to change password.';
  } finally {
    passwordLoading.value = false;
  }
};
</script>

<style scoped>
/* Add any specific styles for information form here */
</style>