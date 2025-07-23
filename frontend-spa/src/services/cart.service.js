// src/services/cart.service.js
import { BASE_URL_API, DEFAULT_IMAGE } from '../constants';

async function efetch(url, options = {}) {
    let result = {};
    let json = {};

    const token = localStorage.getItem('jwtToken');
    const requestHeaders = new Headers(options.headers || {}); // Use Headers API for better handling

    if (token) {
        requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    // Set Content-Type based on body presence and type
    // Only set application/json if body is present and not FormData
    if (options.body && !(options.body instanceof FormData)) {
        requestHeaders.set('Content-Type', 'application/json');
    } 
    // If body is FormData, fetch API will automatically set the correct Content-Type with boundary
    // So we don't need to explicitly set it here for FormData.
    // If there's no body, no Content-Type is typically needed for GET/DELETE, etc.

    const fetchOptions = {
        ...options, // Keep original options like method, cache, etc.
        headers: requestHeaders, // Use our constructed Headers object
    };

    try {
        result = await fetch(url, fetchOptions); // Pass the merged options
        json = await result.json();
    } catch (error) {
        console.error('Network or parsing error:', error);
        throw new Error(`Network or parsing error: ${error.message}`);
    }

    console.log('API Response Status:', result.status);
    console.log('API Response JSON:', json);

    if (!result.ok || json.status !== 'success') {
        if (result.status === 401) {
            localStorage.removeItem('jwtToken');
            throw new Error(json.message || 'Unauthorized: Vui lòng đăng nhập lại.');
        }
        throw new Error(json.message || `API request failed with status ${result.status}`);
    }
    return json.data;
}

function makeCartService() {
    const baseUrl = `${BASE_URL_API}/carts`;

    async function fetchUserCart() {
        const data = await efetch(`${baseUrl}/myCart`);
        if (data && data.cart && data.cart.items) {
            data.cart.items = data.cart.items.map((item) => {
                return {
                    ...item,
                    product: {
                        ...item.product,
                        image_url: item.product.image_url ?? DEFAULT_IMAGE
                    }
                };
            });
        } else {
            return { cart: { items: [] } };
        }
        return data;
    }

    async function addItemToCart(productId, quantity) {
        // No need to set Content-Type here, efetch will handle it
        return efetch(`${baseUrl}/myCart`, {
            method: 'POST',
            body: JSON.stringify({ product_id: productId, quantity }) // This is correct
        });
    }

    async function updateItemQuantity(productId, quantity) {
        return efetch(`${baseUrl}/myCart`, {
            method: 'PATCH',
            body: JSON.stringify({ product_id: productId, quantity })
        });
    }

    async function removeItemFromCart(productId) {
        return efetch(`${baseUrl}/removeItem`, {
            method: 'DELETE',
            body: JSON.stringify({ product_id: productId }) // DELETE can have a body but not always
        });
    }

    async function clearMyCart() {
        return efetch(`${baseUrl}/myCart`, {
            method: 'DELETE' // No body needed for clearing all, typically
        });
    }

    async function createCart(userId) {
        return efetch(baseUrl, {
            method: 'POST',
            body: JSON.stringify({ user_id: userId })
        });
    }

    async function fetchCartInformation(cartId) {
        const { cart } = await efetch(`${baseUrl}/${cartId}`);
        return cart;
    }

    async function updateCartInformation(cart) {
        return efetch(`${baseUrl}/${cart.id}`, {
            method: 'PUT',
            body: JSON.stringify(cart)
        });
    }

    async function deleteCart(cartId) {
        return efetch(`${baseUrl}/${cartId}`, {
            method: 'DELETE'
        });
    }

    return {
        fetchUserCart,
        addItemToCart,
        updateItemQuantity,
        removeItemFromCart,
        clearMyCart,
        createCart,
        fetchCartInformation,
        updateCartInformation,
        deleteCart
    };
}

export default makeCartService();