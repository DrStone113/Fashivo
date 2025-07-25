<template>
  <div class="add-product-page-styled">
    <h2 class="page-title-styled">Thêm Sản Phẩm Mới</h2>
    
    <form @submit.prevent="submitForm" class="product-add-form-styled">
      
      <!-- Phần tải ảnh -->
      <div class="image-section-styled">
        <h3 class="section-heading">Ảnh sản phẩm</h3>
        <div class="main-image-preview-container">
          <!-- Ảnh xem trước hoặc placeholder -->
          <img 
            :src="selectedFilePreviewUrl || '/public/image/products/BLANK.jpg.png'" 
            alt="Product Image Preview" 
            class="full-image-preview-styled"
            onerror="this.onerror=null;this.src='/public/image/products/BLANK.jpg.png';"
          >
        </div>
        
        <div class="form-group-styled">
          <label for="image_upload" class="form-label-styled">Tải lên Ảnh Sản Phẩm:</label>
          <input 
            type="file" 
            id="image_upload" 
            accept="image/*" 
            @change="handleImageUpload"
            required 
            class="file-input-styled"
          >
          <small class="help-text-styled">Chọn một file ảnh (JPG, PNG, GIF) cho sản phẩm (bắt buộc).</small>
        </div>

        <div class="form-group-styled">
          <label for="image_url_text" class="form-label-styled">Hoặc nhập URL Ảnh:</label>
          <input 
            type="text" 
            id="image_url_text" 
            v-model="productData.image_url" 
            :disabled="!!selectedFile" 
            placeholder="Để trống nếu tải lên file"
            class="form-input-styled"
          >
          <small class="help-text-styled" v-if="selectedFile">URL ảnh bị vô hiệu hóa khi có file được chọn.</small>
        </div>
      </div>

      <!-- Phần thông tin chi tiết sản phẩm -->
      <div class="details-section-styled">
        <h3 class="section-heading">Thông tin sản phẩm</h3>
        <div class="form-group-styled">
          <label for="name" class="form-label-styled">Tên sản phẩm:</label>
          <input type="text" id="name" v-model="productData.name" required placeholder="Nhập tên sản phẩm" class="form-input-styled">
        </div>

        <div class="form-group-styled">
          <label for="description" class="form-label-styled">Mô tả:</label>
          <textarea id="description" v-model="productData.description" placeholder="Mô tả chi tiết về sản phẩm" class="form-textarea-styled"></textarea>
        </div>

        <div class="form-group-styled">
          <label for="price" class="form-label-styled">Giá:</label>
          <input type="number" id="price" v-model.number="productData.price" required min="0" placeholder="0" class="form-input-styled">
        </div>

        <div class="form-group-styled">
          <label for="stock" class="form-label-styled">Số lượng tồn kho:</label>
          <input type="number" id="stock" v-model.number="productData.stock" required min="0" placeholder="0" class="form-input-styled">
        </div>

        <div class="form-group-styled">
          <label for="type" class="form-label-styled">Loại sản phẩm:</label>
          <input type="text" id="type" v-model="productData.type" placeholder="Ví dụ: Áo thun, Quần jean, Giày" class="form-input-styled">
        </div>

        <!-- Trường available -->
        <div class="form-group-styled checkbox-group-styled">
          <input type="checkbox" id="available" v-model="productData.available" class="checkbox-input-styled">
          <label for="available" class="checkbox-label-styled">Sản phẩm có sẵn để bán</label>
          <small class="help-text-styled">Bỏ chọn nếu bạn muốn ẩn sản phẩm khỏi cửa hàng hoặc tạm ngừng bán.</small>
        </div>
        
        <div class="form-actions-styled">
          <button type="submit" :disabled="isSubmitting" class="btn-submit-styled">
            <i class="fas fa-plus-circle me-2"></i> {{ isSubmitting ? 'Đang thêm...' : 'Thêm Sản phẩm' }}
          </button>
          <button type="button" @click="cancelAdd" class="btn-cancel-styled">
            <i class="fas fa-times-circle me-2"></i> Hủy
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
import { useQueryClient } from '@tanstack/vue-query'; // THÊM DÒNG NÀY

const router = useRouter();
const queryClient = useQueryClient(); // KHỞI TẠO queryClient

const productData = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  type: '',
  image_url: '',
  available: true 
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
      dataToSend.append('imageFile', selectedFile.value); 
      for (const key in productData.value) {
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
      dataToSend = productData.value;
    }
    
    await productService.createProduct(dataToSend); 
    
    alert('Thêm sản phẩm thành công!');
    
    // QUAN TRỌNG: Vô hiệu hóa cache của query 'products' để buộc nó fetch lại dữ liệu mới nhất
    queryClient.invalidateQueries(['products']); 

    router.push({ path: '/menu', query: { page: 1 } }); 
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
/* General Page Styling */
.add-product-page-styled {
  max-width: 1200px;
  margin: 40px auto;
  padding: 30px;
  background: linear-gradient(to bottom, #f8f9fa, #f0f2f5); /* Light gradient background */
  border-radius: 20px; /* More rounded */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); /* Deeper shadow */
  font-family: 'Poppins', sans-serif; /* Poppins font */
}

/* Page Title */
.page-title-styled {
  text-align: center;
  color: white;
  margin: 0 auto 40px auto; /* More margin */
  padding: 20px 30px; /* More padding */
  font-size: 2.5em; /* Larger font */
  font-weight: 800; /* Bolder */
  background-image: linear-gradient(to right, #6a11cb, #2575fc); /* Blue-Purple Gradient for Add Product */
  border-radius: 15px; /* More rounded */
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25); /* Stronger shadow */
  display: block;
  width: calc(100% - 60px); /* Adjust width for padding */
  box-sizing: border-box;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
}

/* Form Layout */
.product-add-form-styled { 
  display: flex;
  gap: 40px; /* More space between sections */
  flex-wrap: wrap;
}

/* Section Styling (Image & Details) */
.image-section-styled,
.details-section-styled {
  padding: 30px; /* More padding */
  border: 1px solid #e0e0e0;
  border-radius: 15px; /* More rounded */
  background: white;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08); /* Deeper shadow */
  flex: 1;
  min-width: 320px;
}

.image-section-styled {
  flex-basis: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.details-section-styled {
  flex-basis: 55%;
}

.section-heading {
  color: #2575fc; /* Blue heading */
  margin-top: 0;
  margin-bottom: 30px; /* More margin */
  font-size: 1.8em; /* Larger font */
  font-weight: 700;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 15px; /* More padding */
  width: 100%;
  text-align: left; /* Align heading to left */
}

/* Image Preview */
.main-image-preview-container {
  width: 100%;
  max-width: 350px; /* Larger preview area */
  aspect-ratio: 1 / 1; /* Square aspect ratio */
  border: 2px solid #ddd; /* Thicker border */
  padding: 8px; /* More padding */
  background: #f0f0f0;
  border-radius: 12px; /* More rounded */
  margin-bottom: 25px; /* More margin */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.full-image-preview-styled {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Use contain to show entire image, not crop */
  border-radius: 8px;
}

/* Form Groups & Labels */
.form-group-styled { 
  margin-bottom: 25px; /* More space between groups */
  width: 100%; 
  text-align: left; 
}

.form-label-styled {
  display: block;
  margin-bottom: 10px; /* More space */
  font-weight: 600; /* Bolder */
  color: #555;
  font-size: 1rem;
}

/* Form Inputs (Text, Number, Textarea) */
.form-input-styled,
.form-textarea-styled {
  width: calc(100% - 2px); /* Adjust for border */
  padding: 14px 15px; /* Larger padding */
  border: 1px solid #ccc;
  border-radius: 10px; /* More rounded */
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s, background-color 0.3s;
  background-color: #f8f9fa;
  color: #333;
}

.form-input-styled:focus,
.form-textarea-styled:focus {
  border-color: #2575fc; /* Blue focus border */
  outline: none;
  box-shadow: 0 0 0 4px rgba(37, 117, 252, 0.2); /* Wider shadow */
  background-color: white;
}

.form-textarea-styled {
  resize: vertical;
  min-height: 120px; /* Taller textarea */
}

/* File Input */
.file-input-styled {
  width: 100%;
  padding: 10px 0;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f0f2f5; /* Light background */
  cursor: pointer;
  color: #555;
  font-size: 0.95rem;
}

.file-input-styled::file-selector-button {
  background-color: #2575fc; /* Blue button */
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 8px; /* More rounded */
  cursor: pointer;
  margin-right: 15px;
  transition: background-color 0.2s, transform 0.2s;
  font-weight: 600;
}

.file-input-styled::file-selector-button:hover {
  background-color: #1a60cc; /* Darker blue on hover */
  transform: translateY(-2px);
}

.help-text-styled {
  font-size: 0.85rem;
  color: #777;
  margin-top: 8px; /* More space */
  display: block;
  text-align: left; 
}

/* Checkbox Group */
.checkbox-group-styled {
  display: flex;
  align-items: center;
  gap: 12px; /* More space */
  margin-bottom: 30px; /* More margin */
}

.checkbox-input-styled {
  width: 22px; /* Larger checkbox */
  height: 22px;
  margin: 0;
  cursor: pointer;
  accent-color: #2575fc; /* Blue accent color */
  border: 2px solid #2575fc; /* Blue border */
  border-radius: 5px; /* Slightly rounded */
  flex-shrink: 0;
}

.checkbox-input-styled:checked {
  background-color: #2575fc;
  border-color: #2575fc;
}

.checkbox-input-styled:focus {
  box-shadow: 0 0 0 4px rgba(37, 117, 252, 0.2);
}

.checkbox-label-styled {
  margin-bottom: 0;
  font-weight: 500;
  color: #444;
  font-size: 1rem;
  cursor: pointer;
}

/* Form Actions (Buttons) */
.form-actions-styled {
  margin-top: 40px; /* More margin */
  text-align: right;
  display: flex;
  justify-content: flex-end;
  gap: 20px; /* Space between buttons */
}

.btn-submit-styled, .btn-cancel-styled {
  padding: 14px 30px; /* Larger padding */
  border: none;
  border-radius: 10px; /* More rounded */
  font-size: 1.05rem; /* Larger font */
  font-weight: 700; /* Bolder */
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex; /* For icon alignment */
  align-items: center;
  justify-content: center;
}

.btn-submit-styled {
  background: linear-gradient(45deg, #6a11cb, #2575fc); /* Blue-purple gradient */
  color: white;
}

.btn-submit-styled:hover:not(:disabled) {
  background: linear-gradient(45deg, #6a11cb, #2575fc); /* Blue-purple gradient */
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.btn-submit-styled:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}

.btn-cancel-styled {
  background-color: #6c757d; /* Dark grey for cancel */
  color: white;
}

.btn-cancel-styled:hover:not(:disabled) {
  background-color: #5a6268;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* Responsive adjustments */
@media (max-width: 991.98px) { /* Medium devices (md) */
  .add-product-page-styled {
    padding: 25px;
  }
  .page-title-styled {
    font-size: 2em;
    padding: 15px 20px;
  }
  .product-add-form-styled {
    gap: 30px;
  }
  .image-section-styled,
  .details-section-styled {
    padding: 25px;
  }
  .section-heading {
    font-size: 1.6em;
    margin-bottom: 25px;
  }
  .main-image-preview-container {
    max-width: 300px;
    margin-bottom: 20px;
  }
  .form-group-styled {
    margin-bottom: 20px;
  }
  .form-label-styled {
    font-size: 0.95rem;
  }
  .form-input-styled, .form-textarea-styled, .file-input-styled {
    padding: 12px 15px;
    font-size: 0.95rem;
  }
  .file-input-styled::file-selector-button {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  .checkbox-group-styled {
    margin-bottom: 25px;
  }
  .checkbox-input-styled {
    width: 20px;
    height: 20px;
  }
  .checkbox-label-styled {
    font-size: 0.95rem;
  }
  .form-actions-styled {
    margin-top: 30px;
    gap: 15px;
  }
  .btn-submit-styled, .btn-cancel-styled {
    padding: 12px 25px;
    font-size: 1rem;
  }
}

@media (max-width: 767.98px) { /* Small devices (sm) */
  .add-product-page-styled {
    margin: 20px auto;
    padding: 20px;
  }
  .page-title-styled {
    font-size: 1.8em;
    padding: 12px 15px;
    margin-bottom: 30px;
  }
  .product-add-form-styled {
    flex-direction: column;
    gap: 25px;
  }
  .image-section-styled,
  .details-section-styled {
    flex-basis: auto;
    width: 100%;
    padding: 20px;
  }
  .section-heading {
    font-size: 1.4em;
    margin-bottom: 20px;
  }
  .main-image-preview-container {
    max-width: 250px;
    margin-bottom: 15px;
  }
  .form-group-styled {
    margin-bottom: 18px;
  }
  .form-label-styled {
    font-size: 0.9rem;
  }
  .form-input-styled, .form-textarea-styled, .file-input-styled {
    padding: 10px 12px;
    font-size: 0.9rem;
  }
  .file-input-styled::file-selector-button {
    padding: 6px 10px;
    font-size: 0.85rem;
  }
  .checkbox-group-styled {
    margin-bottom: 20px;
  }
  .checkbox-input-styled {
    width: 18px;
    height: 18px;
  }
  .checkbox-label-styled {
    font-size: 0.9rem;
  }
  .form-actions-styled {
    margin-top: 25px;
    flex-direction: column; /* Stack buttons vertically */
    gap: 10px;
  }
  .btn-submit-styled, .btn-cancel-styled {
    width: 100%;
    padding: 10px 20px;
    font-size: 0.95rem;
  }
}
</style>