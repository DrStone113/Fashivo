<template>
  <div class="add-product-page">
    <h2>Thêm Sản Phẩm Mới</h2>
    
    <form @submit.prevent="submitForm" class="product-add-form">
      
      <!-- Phần tải ảnh - Đã được điều chỉnh để giống EditProductPage -->
      <div class="image-section">
        <h3>Ảnh sản phẩm</h3>
        <div class="main-image-preview">
          <!-- Ảnh xem trước hoặc placeholder -->
          <img 
            :src="selectedFilePreviewUrl || '/public/image/products/BLANK.jpg.png'" 
            alt="Product Image Preview" 
            class="full-image-preview"
            onerror="this.onerror=null;this.src='/public/image/products/BLANK.jpg.png';"
          >
          
          <!-- Các input file và URL được đặt trực tiếp trong main-image-preview -->
          <div class="form-group">
            <label for="image_upload">Tải lên Ảnh Sản Phẩm:</label>
            <input 
              type="file" 
              id="image_upload" 
              accept="image/*" 
              @change="handleImageUpload"
              required 
              class="file-input"
            >
            <small class="help-text">Chọn một file ảnh (JPG, PNG, GIF) cho sản phẩm (bắt buộc).</small>
          </div>

          <div class="form-group">
            <label for="image_url_text">Hoặc nhập URL Ảnh:</label>
            <input type="text" id="image_url_text" v-model="productData.image_url" placeholder="Để trống nếu tải lên file">
          </div>
        </div>
      </div>

      <!-- Phần thông tin chi tiết sản phẩm -->
      <div class="details-section">
        <h3>Thông tin sản phẩm</h3>
        <div class="form-group">
          <label for="name">Tên sản phẩm:</label>
          <input type="text" id="name" v-model="productData.name" required placeholder="Nhập tên sản phẩm">
        </div>

        <div class="form-group">
          <label for="description">Mô tả:</label>
          <textarea id="description" v-model="productData.description" placeholder="Mô tả chi tiết về sản phẩm"></textarea>
        </div>

        <div class="form-group">
          <label for="price">Giá:</label>
          <input type="number" id="price" v-model.number="productData.price" required min="0" placeholder="0">
        </div>

        <div class="form-group">
          <label for="stock">Số lượng tồn kho:</label>
          <input type="number" id="stock" v-model.number="productData.stock" required min="0" placeholder="0">
        </div>

        <div class="form-group">
          <label for="type">Loại sản phẩm:</label>
          <input type="text" id="type" v-model="productData.type" placeholder="Ví dụ: Áo thun, Quần jean, Giày">
        </div>

        <!-- NEW: Trường available -->
        <div class="form-group checkbox-group">
          <input type="checkbox" id="available" v-model="productData.available">
          <label for="available" class="checkbox-label">Sản phẩm có sẵn để bán</label>
          <small class="help-text">Bỏ chọn nếu bạn muốn ẩn sản phẩm khỏi cửa hàng hoặc tạm ngừng bán.</small>
        </div>
        
        <div class="form-actions">
          <button type="submit" :disabled="isSubmitting" class="submit-btn">
            <i class="fas fa-plus-circle"></i> {{ isSubmitting ? 'Đang thêm...' : 'Thêm Sản phẩm' }}
          </button>
          <button type="button" @click="cancelAdd" class="cancel-btn">
            <i class="fas fa-times-circle"></i> Hủy
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'; 
import { useRouter } from 'vue-router';
import productService from '@/services/product.service'; 

const router = useRouter();

const productData = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  type: '',
  image_url: '',
  available: true // NEW: Mặc định là TRUE khi thêm mới
});

const isSubmitting = ref(false);
const selectedFile = ref(null); 
const selectedFilePreviewUrl = ref(null); 

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    selectedFilePreviewUrl.value = URL.createObjectURL(file);
    productData.value.image_url = ''; 
  } else {
    selectedFile.value = null;
    selectedFilePreviewUrl.value = null;
  }
};

async function submitForm() {
  if (isSubmitting.value) return;

  if (!productData.value.name || productData.value.price <= 0 || productData.value.stock < 0) {
    alert('Vui lòng điền đầy đủ Tên, Giá, và Số lượng tồn kho.');
    return;
  }
  if (!selectedFile.value && !productData.value.image_url) {
    alert('Vui lòng tải lên một ảnh hoặc nhập URL ảnh cho sản phẩm.');
    return;
  }

  isSubmitting.value = true;
  try {
    let dataToSend;

    if (selectedFile.value) {
      dataToSend = new FormData();
      dataToSend.append('imageFile', selectedFile.value); // Tên field phải khớp với Multer ('imageFile')
      for (const key in productData.value) {
        // Bỏ qua image_url nếu có file được chọn
        // Thêm trường 'available' vào FormData, chuyển đổi boolean thành string 'true'/'false'
        if (productData.value[key] !== null && productData.value[key] !== '') {
          if (key === 'image_url' && selectedFile.value) continue; 
          
          if (key === 'available') {
            dataToSend.append(key, productData.value[key] ? 'true' : 'false');
          } else {
            dataToSend.append(key, productData.value[key]);
          }
        }
      }
    } else {
      // Nếu không có file mới, gửi JSON body
      // Đảm bảo 'available' là boolean
      dataToSend = productData.value;
    }
    
    await productService.createProduct(dataToSend); 
    
    alert('Thêm sản phẩm thành công!');
    router.push('/admin/products'); 
  } catch (err) {
    console.error('Lỗi khi thêm sản phẩm:', err);
    alert('Thêm sản phẩm thất bại: ' + (err.message || 'Lỗi không xác định.'));
  } finally {
    isSubmitting.value = false;
  }
}

function cancelAdd() {
  router.back(); 
}
</script>

<style scoped>
.add-product-page {
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

.product-add-form { 
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.image-section,
.details-section {
  padding: 25px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
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
  color: #1976D2; 
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.6em;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
  width: 100%;
  font-weight: 600;
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
  color: #444;
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
  border-color: #1976D2; 
  outline: none;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.2);
}

textarea {
  resize: vertical;
  min-height: 120px; 
}

.file-input {
  width: 100%;
  padding: 10px 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #f8f8f8;
  cursor: pointer;
}

.file-input::file-selector-button {
  background-color: #007bff; 
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 15px;
  transition: background-color 0.2s;
}

.file-input::file-selector-button:hover {
  background-color: #0056b3;
}

.help-text {
  font-size: 0.85rem;
  color: #777;
  margin-top: 5px;
  display: block;
  text-align: left; 
}

/* NEW: Styles for checkbox group (copied from AdminEditProduct.vue) */
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
  display: inline-flex; 
  align-items: center;
  gap: 8px; 
}

.submit-btn {
  background-color: #28a745; 
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #6c757d; 
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .product-add-form {
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
