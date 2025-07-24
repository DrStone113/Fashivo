// src/services/product.service.js
import { BASE_URL_API, DEFAULT_IMAGE } from '../constants';

async function efetch(url, options = {}) {
    let result = {};
    let json = {};

    const token = localStorage.getItem('jwtToken');
    const requestHeaders = new Headers(options.headers || {});

    if (token) {
        requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    if (!(options.body instanceof FormData) && options.body) {
        requestHeaders.set('Content-Type', 'application/json');
    }

    const fetchOptions = {
        ...options,
        headers: requestHeaders,
    };

    try {
        result = await fetch(url, fetchOptions);
        // THAY ĐỔI QUAN TRỌNG TẠI ĐÂY:
        // Kiểm tra status trước khi cố gắng phân tích JSON
        if (result.status === 204) {
            console.log('API Response Status: 204 No Content');
            return null; // Trả về null hoặc undefined cho 204 No Content (không có body)
        }
        json = await result.json(); // Chỉ phân tích JSON nếu không phải 204
    } catch (error) {
        console.error('Network or parsing error:', error);
        // Đây có thể là lỗi parsing nếu backend gửi body với status 204
        // Hoặc lỗi mạng nếu fetch thất bại hoàn toàn
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

        // Đảm bảo data không phải là null (trường hợp status 204) trước khi truy cập .products
        if (data && data.products) {
            data.products = data.products.map((product) => ({
                ...product,
                image_url: product.image_url ?? DEFAULT_IMAGE
            }));
        }


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
        return efetch(baseUrl, {
            method: 'POST',
            body: productData instanceof FormData ? productData : JSON.stringify(productData)
        });
    }

    async function updateProduct(productId, productData) {
        return efetch(`${baseUrl}/${productId}`, {
            method: 'PUT',
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