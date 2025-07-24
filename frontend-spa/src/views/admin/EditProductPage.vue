<template>
  <div class="edit-product-page">
    <h2>Chỉnh Sửa Sản Phẩm</h2>
    <p v-if="loading">Đang tải thông tin sản phẩm...</p>
    <p v-if="queryError">Lỗi khi tải sản phẩm: {{ queryError.message }}</p>

    <form @submit.prevent="submitForm" v-if="productData" class="product-edit-form">
      
      <div class="image-section">
        <h3>Ảnh sản phẩm</h3>
        <div class="main-image-preview">
          <img 
            :src="selectedFilePreviewUrl || productData.image_url || '/public/image/products/BLANK.jpg.png'" 
            alt="Product Image" 
            class="full-image-preview"
            onerror="this.onerror=null;this.src='/public/image/products/BLANK.jpg.png';"
          >
          
          <div class="form-group">
            <label for="image_upload">Tải lên Ảnh Mới:</label>
            <input 
              type="file" 
              id="image_upload" 
              accept="image/*" 
              @change="handleImageUpload"
              class="file-input"
            >
            <small class="help-text">Chọn một file ảnh (JPG, PNG, GIF) để thay thế ảnh hiện tại.</small>
          </div>

          <div class="form-group">
            <label for="image_url_text">Hoặc nhập URL Ảnh:</label>
            <input type="text" id="image_url_text" v-model="productData.image_url" :disabled="!!selectedFile" placeholder="Để trống nếu tải lên file">
            <small class="help-text" v-if="selectedFile">URL ảnh bị vô hiệu hóa khi có file được chọn.</small>
          </div>
        </div>
      </div>

      <div class="details-section">
        <h3>Thông tin sản phẩm</h3>
        <div class="form-group">
          <label for="name">Tên sản phẩm:</label>
          <input type="text" id="name" v-model="productData.name" required>
        </div>

        <div class="form-group">
          <label for="description">Mô tả:</label>
          <textarea id="description" v-model="productData.description"></textarea>
        </div>

        <div class="form-group">
          <label for="price">Giá:</label>
          <input type="number" id="price" v-model.number="productData.price" required min="0">
        </div>

        <div class="form-group">
          <label for="stock">Số lượng tồn kho:</label>
          <input type="number" id="stock" v-model.number="productData.stock" required min="0">
        </div>

        <div class="form-group">
          <label for="type">Loại sản phẩm:</label>
          <input type="text" id="type" v-model="productData.type">
        </div>

        <div class="form-group checkbox-group">
          <input type="checkbox" id="available" v-model="productData.available">
          <label for="available" class="checkbox-label">Sản phẩm có sẵn để bán</label>
          <small class="help-text">Bỏ chọn nếu bạn muốn ẩn sản phẩm khỏi cửa hàng hoặc tạm ngừng bán.</small>
        </div>
        
        <div class="form-actions">
          <button type="submit" :disabled="isSubmitting">{{ isSubmitting ? 'Đang cập nhật...' : 'Cập nhật Sản phẩm' }}</button>
          <button type="button" @click="cancelEdit" class="cancel-btn">Hủy</button>
        </div>
      </div>
    </form>
    <p v-else-if="!loading && !queryError">Không tìm thấy sản phẩm.</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query'; 
import useProduct from '@/composables/useProduct'; 
import productService from '@/services/product.service'; 

const route = useRoute();
const router = useRouter();
const productData = ref(null);
const isSubmitting = ref(false);

const selectedFile = ref(null); 
const selectedFilePreviewUrl = ref(null); 

const queryClient = useQueryClient(); 

const { product, isLoading: loading, isError: queryError } = useProduct().fetchProduct(ref(route.params.id));

// Lấy số trang từ query parameter, mặc định là 1 nếu không có
const fromPage = ref(parseInt(route.query.fromPage || '1')); // LẤY fromPage TỪ QUERY PARAMETER

watch(product, (newProduct) => {
  if (newProduct) {
    productData.value = { ...newProduct, available: newProduct.available ?? true }; 
    selectedFile.value = null; 
    selectedFilePreviewUrl.value = null; 
  } else {
    productData.value = null;
  }
}, { immediate: true });

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    selectedFilePreviewUrl.value = URL.createObjectURL(file);
  } else {
    selectedFile.value = null;
    selectedFilePreviewUrl.value = null;
  }
};

async function submitForm() {
  if (!productData.value || isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    let dataToSend;

    if (selectedFile.value) {
      dataToSend = new FormData();
      dataToSend.append('imageFile', selectedFile.value);
      for (const key in productData.value) {
        if (key !== 'image_url' && productData.value[key] !== null) { 
          if (key === 'available') {
            dataToSend.append(key, productData.value[key] ? 'true' : 'false');
          } else {
            dataToSend.append(key, productData.value[key]);
          }
        }
      }
    } else {
      dataToSend = { ...productData.value };
      if (dataToSend.image_url === '') { 
        dataToSend.image_url = null; 
      } else if (dataToSend.image_url === undefined) {
         delete dataToSend.image_url;
      }
    }

    await productService.updateProduct(route.params.id, dataToSend);
    
    queryClient.invalidateQueries(['products']); 

    console.log('Cập nhật sản phẩm thành công! Đang điều hướng về trang:', fromPage.value); 
    // Điều hướng về trang gốc mà sản phẩm được chỉnh sửa
    router.push({ path: '/menu', query: { page: fromPage.value } }); // SỬ DỤNG fromPage.value
  } catch (err) {
    console.error('Lỗi khi cập nhật sản phẩm:', err);
    alert('Cập nhật sản phẩm thất bại: ' + (err.message || 'Lỗi không xác định.'));
  } finally {
    isSubmitting.value = false;
  }
}

function cancelEdit() {
  router.back(); 
}
</script>


<style scoped>
.edit-product-page {
  max-width: 1200px;
  margin: 40px auto;
  padding: 30px;
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

/* CÁC THAY ĐỔI CHO H2 - Khung nền gradient */
h2 {
  text-align: center;
  color: white; /* Màu chữ trắng để nổi bật trên nền gradient */
  margin: 0 auto 30px auto; /* Căn giữa và tạo khoảng cách dưới */
  padding: 15px 30px; /* Padding bên trong khung */
  font-size: 2.2em;
  font-weight: 700;
  
  /* Background gradient */
  background-image: linear-gradient(to right, #6C63FF, #A044FF); 
  border-radius: 10px; /* Bo góc cho khung */
  box-shadow: 0 4px 15px rgba(0,0,0,0.2); /* Thêm bóng đổ nhẹ */
  display: block; /* Đã thay đổi thành block để chiếm toàn bộ chiều rộng */
  width: 100%; /* Đảm bảo chiếm 100% chiều rộng của parent */
  box-sizing: border-box; /* Bao gồm padding trong width */
}

.product-edit-form {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.image-section,
.details-section {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  flex: 1;
  min-width: 300px;
}

.image-section {
  flex-basis: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.details-section {
  flex-basis: 55%;
}

.image-section h3,
.details-section h3 {
  color: #4CAF50;
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.5em;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
  width: 100%;
}

.main-image-preview {
  width: 100%;
  max-width: 300px;
  height: auto;
  border: 1px solid #ddd;
  padding: 5px;
  background: #f0f0f0;
  border-radius: 8px;
  margin-bottom: 20px;
  display: block;
  overflow: hidden;
  position: relative;
}

.full-image-preview {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 5px;
}

.image-section .form-group { 
    margin-bottom: 20px; 
    width: 100%; 
    text-align: left; 
}

.form-group {
  margin-bottom: 20px;
  width: 100%; 
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

input[type="text"],
input[type="number"],
textarea {
  width: calc(100% - 24px);
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

input[type="text"]:focus,
input[type="number"]:focus,
textarea:focus {
  border-color: #667eea;
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

textarea {
  resize: vertical;
  min-height: 100px;
}

input[type="file"] {
  width: 100%;
  padding: 8px 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #f8f8f8;
  cursor: pointer;
}

input[type="file"]::file-selector-button {
  background-color: #667eea;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  transition: background-color 0.2s;
}

input[type="file"]::file-selector-button:hover {
  background-color: #536cdb;
}

.help-text {
  font-size: 0.85rem;
  color: #777;
  margin-top: 5px;
  display: block;
  text-align: left; 
}

/* NEW: Styles for checkbox group */
.checkbox-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.checkbox-group input[type="checkbox"] {
  width: 20px;
  height: 20px;
  margin: 0;
  cursor: pointer;
  accent-color: #667eea; /* Màu sắc của checkbox khi được chọn */
}

.checkbox-group .checkbox-label {
  margin-bottom: 0; /* Ghi đè margin-bottom mặc định của label */
  font-weight: normal; /* Không in đậm label của checkbox */
  cursor: pointer;
}

.form-actions {
  margin-top: 30px;
  text-align: right;
}

button {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s, box-shadow 0.2s;
  margin-left: 15px;
}

button[type="submit"] {
  background-color: #667eea;
  color: white;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #536cdb;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

button[type="submit"]:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #e0e0e0;
  color: #555;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #c0c0c0;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .product-edit-form {
    flex-direction: column;
  }
  .image-section,
  .details-section {
    flex-basis: auto;
    width: 100%;
  }
  .form-actions {
    text-align: center;
  }
  button {
    margin-left: 0;
    margin-bottom: 10px;
    width: 100%;
  }
}
</style>
