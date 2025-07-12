// backend-api/src/controllers/cart.controller.js

const JSend = require("../jsend");
const ApiError = require("../api-error");
const catchAsync = require("../catchAsync");
const cartService = require("../services/cart.service");
const productService = require("../services/product.service");

// Helper function để phân tích cú pháp 'items' từ request body của multipart/form-data.
const parseCartItems = (reqBody) => {
    if (!reqBody.items) {
        return [];
    }
    try {
        const parsedItems = JSON.parse(reqBody.items);
        if (!Array.isArray(parsedItems)) {
            throw new Error('Items must be a JSON string representing an array.');
        }
        return parsedItems.map(item => ({
            product_id: parseInt(item.product_id, 10),
            quantity: parseInt(item.quantity, 10),
        }));
    } catch (e) {
        throw new ApiError(400, `Invalid items format: ${e.message}. Must be a JSON array string.`);
    }
};

/**
 * Xử lý yêu cầu tạo giỏ hàng hoặc thêm/cập nhật mục vào giỏ hàng.
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} _next - Hàm next middleware.
 */
const createCart = catchAsync(async (req, res, _next) => {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    const { user_id: requestedUserId } = req.body;
    const items = parseCartItems(req.body);

    if (items.length === 0) {
        return _next(new ApiError(400, "At least one item is required for the cart."));
    }

    let targetUserId = currentUserId;

    // Admin có thể tạo/cập nhật giỏ hàng cho người dùng khác
    if (currentUserRole === 'admin' && requestedUserId !== undefined && requestedUserId !== null) {
        const parsedRequestedUserId = parseInt(requestedUserId, 10);
        if (isNaN(parsedRequestedUserId) || parsedRequestedUserId <= 0) {
            return _next(new ApiError(400, "Invalid target user ID."));
        }
        targetUserId = parsedRequestedUserId;
    } else if (currentUserRole === 'user' && requestedUserId !== undefined && requestedUserId !== null && parseInt(requestedUserId, 10) !== currentUserId) {
        // User thường không được tạo/cập nhật giỏ hàng cho người khác
        return _next(new ApiError(403, "Bạn không có quyền tạo/cập nhật giỏ hàng cho người dùng khác."));
    }

    const { cart, items: newCartItems } = await cartService.createOrUpdateCart(targetUserId, items);
    res.status(201).json(JSend.success({ cart: { ...cart, items: newCartItems } }));
});

/**
 * Lấy tất cả các giỏ hàng với phân trang và lọc tùy chọn.
 * (Chỉ Admin mới có thể truy cập route này nhờ restrictTo ở router)
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} _next - Hàm next middleware.
 */
const getAllCarts = catchAsync(async (req, res, _next) => {
    // restrictTo('admin') đã đảm bảo chỉ admin mới vào được đây
    const filters = req.query;
    const { carts, totalItems, currentPage, totalPages, limit } = await cartService.getAllCarts(filters);
    res.status(200).json(JSend.success({
        carts,
        metadata: {
            totalRecords: totalItems,
            currentPage,
            totalPages,
            firstPage: 1,
            lastPage: totalPages,
            limit: limit
        }
    }));
});

/**
 * Lấy giỏ hàng theo ID giỏ hàng.
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} _next - Hàm next middleware.
 */
const getCartById = catchAsync(async (req, res, _next) => {
    const cartId = parseInt(req.params.id, 10);
    const currentUserRole = req.user.role;
    const currentUserId = req.user.id;

    const cart = await cartService.getCartById(cartId);
    if (!cart) {
        return _next(new ApiError(404, "No cart found with that ID"));
    }

    // Kiểm tra quyền: Nếu không phải admin VÀ user_id của giỏ hàng không khớp với user hiện tại
    if (currentUserRole !== 'admin' && cart.user_id !== currentUserId) {
        return _next(new ApiError(403, "Bạn không có quyền truy cập giỏ hàng này."));
    }

    res.status(200).json(JSend.success({ cart }));
});

/**
 * Lấy giỏ hàng theo ID người dùng.
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} _next - Hàm next middleware.
 */
const getCartByUserId = catchAsync(async (req, res, _next) => {
    const requestedUserId = parseInt(req.params.userId, 10);
    const currentUserRole = req.user.role;
    const currentUserId = req.user.id;

    // Kiểm tra quyền: Nếu không phải admin VÀ userId yêu cầu không khớp với user hiện tại
    if (currentUserRole !== 'admin' && requestedUserId !== currentUserId) {
        return _next(new ApiError(403, "Bạn không có quyền truy cập giỏ hàng của người dùng khác."));
    }

    const cart = await cartService.getCartByUserId(requestedUserId);
    if (!cart) {
        return _next(new ApiError(404, "No cart found for that user ID"));
    }
    res.status(200).json(JSend.success({ cart }));
});

/**
 * Cập nhật số lượng của một mục cụ thể trong giỏ hàng.
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} _next - Hàm next middleware.
 */
const updateCartItem = catchAsync(async (req, res, _next) => {
    const cartId = parseInt(req.params.id, 10);
    const productId = parseInt(req.params.productId, 10);
    const quantity = parseInt(req.body.quantity, 10);

    const currentUserRole = req.user.role;
    const currentUserId = req.user.id;

    const cart = await cartService.getCartById(cartId);
    if (!cart) {
        return _next(new ApiError(404, "Cart not found."));
    }

    if (currentUserRole !== 'admin' && cart.user_id !== currentUserId) {
        return _next(new ApiError(403, "Bạn không có quyền cập nhật mục trong giỏ hàng này."));
    }

    const updatedCartItem = await cartService.updateCartItem(cartId, productId, quantity);

    if (!updatedCartItem) {
        return _next(new ApiError(404, "No cart item found with that Cart ID and Product ID to update"));
    }
    res.status(200).json(JSend.success({ cartItem: updatedCartItem }));
});

/**
 * Xóa một giỏ hàng hoàn chỉnh.
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} _next - Hàm next middleware.
 */
const deleteCart = catchAsync(async (req, res, _next) => {
    const cartId = parseInt(req.params.id, 10);
    const currentUserRole = req.user.role;
    const currentUserId = req.user.id;

    const cart = await cartService.getCartById(cartId);
    if (!cart) {
        return _next(new ApiError(404, "No cart found with that ID to delete"));
    }

    if (currentUserRole !== 'admin' && cart.user_id !== currentUserId) {
        return _next(new ApiError(403, "Bạn không có quyền xóa giỏ hàng này."));
    }

    const deleted = await cartService.deleteCart(cartId);
    if (!deleted) {
        return _next(new ApiError(404, "No cart found with that ID to delete"));
    }
    res.status(204).json(JSend.success());
});

/**
 * Xóa một mục cụ thể trong giỏ hàng.
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} _next - Hàm next middleware.
 */
const deleteCartItem = catchAsync(async (req, res, _next) => {
    const cartId = parseInt(req.params.id, 10);
    const productId = parseInt(req.params.productId, 10);

    const currentUserRole = req.user.role;
    const currentUserId = req.user.id;

    const cart = await cartService.getCartById(cartId);
    if (!cart) {
        return _next(new ApiError(404, "Cart not found."));
    }

    if (currentUserRole !== 'admin' && cart.user_id !== currentUserId) {
        return _next(new ApiError(403, "Bạn không có quyền xóa mục trong giỏ hàng này."));
    }

    const deleted = await cartService.deleteCartItem(cartId, productId);
    if (!deleted) {
        return _next(new ApiError(404, "No cart item found with that Cart ID and Product ID to delete"));
    }
    res.status(204).json(JSend.success());
});

/**
 * Xóa tất cả các giỏ hàng (chỉ dành cho admin/dev).
 * (Chỉ Admin mới có thể truy cập route này nhờ restrictTo ở router)
 * @param {Object} _req - Đối tượng request (không sử dụng).
 * @param {Object} res - Đối tượng response.
 * @param {Function} _next - Hàm next middleware.
 */
const deleteAllCarts = catchAsync(async (_req, res, _next) => {
    // restrictTo('admin') đã đảm bảo chỉ admin mới vào được đây
    await cartService.deleteAllCarts();
    res.status(204).json(JSend.success());
});

module.exports = {
    createCart,
    getAllCarts,
    getCartById,
    getCartByUserId,
    updateCartItem,
    deleteCart,
    deleteCartItem,
    deleteAllCarts,
};