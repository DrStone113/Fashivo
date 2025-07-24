// src/services/product.service.js
import { BASE_URL_API, DEFAULT_IMAGE } from '../constants';

// Hàm efetch không thay đổi, giữ nguyên như cũ
async function efetch(url, options = {}) {
    let result = {};
    let json = {};
    const token = localStorage.getItem('jwtToken');
    const requestHeaders = new Headers(options.headers || {});

    if (token) {
        requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    // Nếu body là FormData, fetch API sẽ tự động đặt Content-Type là multipart/form-data
    // Nếu không phải FormData và có body, đặt Content-Type là application/json
    if (!(options.body instanceof FormData) && options.body) {
        requestHeaders.set('Content-Type', 'application/json');
    }

    const fetchOptions = {
        ...options,
        headers: requestHeaders,
    };

    try {
        result = await fetch(url, fetchOptions);
        json = await result.json();
    } catch (error) {
        console.error('Network or parsing error:', error);
        throw new Error(`Network or parsing error: ${error.message}`);
    }

    console.log('API Response Status:', result.status); // Giữ lại để debug
    console.log('API Response JSON:', json); // Giữ lại để debug

    if (!result.ok || json.status !== 'success') {
        if (result.status === 401) {
            localStorage.removeItem('jwtToken');
            throw new Error(json.message || 'Unauthorized: Vui lòng đăng nhập lại.');
        }
        throw new Error(json.message || `API request failed with status ${result.status}`);
    }
    return json.data;
}

function makeProductService() {
    const baseUrl = `${BASE_URL_API}/product`;

    async function fetchProducts(page = 1, limit = 8, filters = {}) {
        const queryParams = new URLSearchParams({
            page,
            limit
        });

        if (filters.search) {
            queryParams.append('search', filters.search);
        }
        if (filters.minPrice > 0) {
            queryParams.append('minPrice', filters.minPrice);
        }
        if (filters.maxPrice < 10000000) {
            queryParams.append('maxPrice', filters.maxPrice);
        }
        if (filters.inStock) {
            queryParams.append('inStock', 'true');
        }

        if (filters.categories && filters.categories.length > 0) {
            filters.categories.forEach((id) => {
                queryParams.append('category_id', id);
            });
        }

        if (filters.sortBy) {
            const [sortField, sortOrder] = filters.sortBy.split(',');
            if (sortField) {
                queryParams.append('sort', sortField);
                queryParams.append('order', sortOrder);
            }
        }

        const queryString = queryParams.toString();

        const data = await efetch(`${baseUrl}?${queryString}`);

        data.products = data.products.map((product) => ({
            ...product,
            image_url: product.image_url ?? DEFAULT_IMAGE
        }));

        return data;
    }

    async function fetchProduct(productId) {
        const dataFromApi = await efetch(`${baseUrl}/${productId}`);
        const actualProduct = dataFromApi.product;
        return {
            ...actualProduct,
            image_url: actualProduct.image_url ?? DEFAULT_IMAGE
        };
    }

    async function createProduct(productData) {
        // productData có thể là FormData hoặc JSON object
        return efetch(baseUrl, {
            method: 'POST',
            body: productData instanceof FormData ? productData : JSON.stringify(productData)
        });
    }

    async function updateProduct(productId, productData) {
        // SỬA LỖI 405: Thay đổi PATCH thành PUT
        // SỬA LỖI BODY: Kiểm tra nếu productData là FormData thì gửi trực tiếp, không thì stringify
        return efetch(`${baseUrl}/${productId}`, {
            method: 'PUT', // <-- ĐÃ SỬA TỪ 'PATCH' THÀNH 'PUT'
            body: productData instanceof FormData ? productData : JSON.stringify(productData)
        });
    }

    async function deleteProduct(productId) {
        return efetch(`${baseUrl}/${productId}`, {
            method: 'DELETE'
        });
    }

    return {
        fetchProducts,
        fetchProduct,
        createProduct,
        updateProduct,
        deleteProduct
    };
}

export default makeProductService();
