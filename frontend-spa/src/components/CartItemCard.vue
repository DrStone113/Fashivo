<template>
  <div class="cart-item-card">
    <div class="item-select-col">
      <input 
        type="checkbox" 
        class="item-checkbox"
        :checked="item.selected"
        @change="$emit('update:selection', item.product_id, $event.target.checked)"
      />
    </div>
    <div class="item-product-info">
      <div class="item-image-wrapper">
        <img 
          :src="item.product?.image_url || '/public/image/products/BLANK.jpg.png'" 
          :alt="item.product?.name" 
          class="item-image"
          onerror="this.onerror=null;this.src='/public/image/products/BLANK.jpg.png';"
        >
      </div>
      <div class="item-details">
        <div class="item-name">{{ item.product?.name || 'Unknown Product' }}</div>
        <div class="item-type">{{ item.product?.category?.name || 'Uncategorized' }}</div>
      </div>
    </div>
    
    <div class="item-price">{{ formatPrice(item.product?.price || 0) }}</div>
    
    <div class="item-quantity-control">
      <button @click="$emit('update:quantity', item.product_id, item.quantity - 1)" :disabled="item.quantity <= 1 || isLoading" class="quantity-btn minus-btn">-</button>
      <input
        type="number"
        class="quantity-input"
        :value="item.quantity"
        @change="$emit('update:quantity', item.product_id, parseInt($event.target.value))"
        min="1"
        :max="item.product?.stock || 999"
        :disabled="isLoading"
      >
      <button @click="$emit('update:quantity', item.product_id, item.quantity + 1)" :disabled="item.quantity >= (item.product?.stock || 999) || isLoading" class="quantity-btn plus-btn">+</button>
    </div>
    
    <div class="item-total">{{ formatPrice(item.quantity * (item.product?.price || 0)) }}</div>
    
    <div class="item-actions">
      <button @click="$emit('remove', item.product_id)" class="remove-item-btn" :disabled="isLoading">
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { formatCurrency } from '@/utils/formatters';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['update:quantity', 'remove', 'update:selection']);

const formatPrice = (price) => {
  return formatCurrency(price);
};
</script>

<style scoped>
.cart-item-card {
  display: grid;
  grid-template-columns: 0.3fr 2.7fr 1fr 1fr 1fr 0.5fr;
  gap: 15px;
  background: #ffffff;
  padding: 20px 25px;
  border-bottom: 1px solid #e8e8e8;
  align-items: center;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.cart-item-card:hover {
  background-color: #f9f9f9;
  transform: scale(1.01);
}

.item-select-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #6C63FF;
}

.item-product-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.item-image-wrapper {
  width: 90px;
  height: 90px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  flex-shrink: 0;
  border: 2px solid #f0f0f0;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-name {
  font-weight: 600;
  color: #333;
  font-size: 1.1em;
  margin-bottom: 8px;
}

.item-type {
  color: #888;
  font-size: 0.9em;
  text-transform: capitalize;
}

.item-price, .item-total {
  font-weight: 600;
  color: #444;
  font-size: 1.05em;
  text-align: center;
}

.item-quantity-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.quantity-btn {
  background-color: #f4f4f4;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  font-size: 1.2em;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  color: #666;
}

.quantity-btn:hover:not(:disabled) {
  background-color: #e9e9e9;
  transform: scale(1.05);
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  width: 55px;
  padding: 6px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1em;
  -moz-appearance: textfield;
}
.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.item-actions {
  display: flex;
  justify-content: center;
  align-items: center;
}

.remove-item-btn {
  background-color: transparent;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('../assets/delete-product.png');
  background-size: 60%;
  background-repeat: no-repeat;
  background-position: center;
}

.remove-item-btn:hover:not(:disabled) {
  background-color: #FFEBEE;
  transform: scale(1.1);
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .cart-item-card {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  }
  .item-select-col {
    order: -1;
    align-self: flex-end;
    margin-bottom: 10px;
  }
  .item-product-info {
    width: 100%;
    margin-bottom: 15px;
  }
  .item-price,
  .item-quantity-control,
  .item-total {
    width: 100%;
    text-align: left;
    margin-bottom: 12px;
    padding: 10px;
    background-color: #f8f8f8;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1em;
  }
  .item-price::before,
  .item-total::before,
  .item-quantity-control::before {
    content: attr(data-label);
    font-weight: 600;
    color: #777;
    margin-right: 10px;
  }
  .item-price::before { content: "Price:"; }
  .item-total::before { content: "Total:"; }
  .item-quantity-control::before { content: "Quantity:"; }
  .item-actions {
    width: 100%;
    margin-top: 10px;
    justify-content: flex-end;
  }
}
</style>
