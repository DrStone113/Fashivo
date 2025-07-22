// src/constants.js

export const DEFAULT_IMAGE = 'https://placehold.co/150x150/e2e8f0/64748b?text=No+Image';

/**
 * Hằng số cho URL API gốc của backend.
 * Đảm bảo rằng biến môi trường VITE_API_BASE_URL được thiết lập trong file .env.local hoặc .env
 * Ví dụ: VITE_API_BASE_URL=/api/v1  <-- THAY ĐỔI Ở ĐÂY
 */
// SỬA DÒNG NÀY:
// src/constants.js
export const BASE_URL_API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'; // Đảm bảo có http:// và /api/v1 // Đặt là đường dẫn tương đối

/**
 * Hằng số cho thời gian chờ (debounce) trong tìm kiếm.
 */
export const DEBOUNCE_TIME_MS = 300;

// Các hằng số khác có thể thêm vào đây tùy theo yêu cầu của ứng dụng