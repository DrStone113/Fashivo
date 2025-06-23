const JSend = require("../jsend");
const ApiError = require("../api-error");
const catchAsync = require("../catchAsync");
const cartService = require("../services/cart.service");
const productService = require("../services/product.service"); // Cần để kiểm tra sự tồn tại của sản phẩm và tồn kho

// Helper function để phân tích cú pháp 'items' từ request body của multipart/form-data.
// 'items' được mong đợi là một chuỗi JSON của mảng các đối tượng { product_id, quantity }.
const parseCartItems = (reqBody) => {
  if (!reqBody.items) {
    return [];
  }
  try {
    const parsedItems = JSON.parse(reqBody.items);
    if (!Array.isArray(parsedItems)) {
      throw new Error('Items must be a JSON string representing an array.');
    }
    // Chuyển đổi product_id và quantity sang số nguyên
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
  const { user_id } = req.body;
  const items = parseCartItems(req.body);

  if (!user_id) {
    return _next(new ApiError(400, "User ID is required."));
  }
  if (items.length === 0) {
    return _next(new ApiError(400, "At least one item is required for the cart."));
  }

  // Chuyển user_id sang số nguyên
  const parsedUserId = parseInt(user_id, 10);

  const { cart, items: newCartItems } = await cartService.createOrUpdateCart(parsedUserId, items);
  res.status(201).json(JSend.success({ cart: { ...cart, items: newCartItems } }));
});

/**
 * Lấy tất cả các giỏ hàng với phân trang và lọc tùy chọn.
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} _next - Hàm next middleware.
 */
const getAllCarts = catchAsync(async (req, res, _next) => {
  const filters = req.query; // Query đã được validate bởi Zod
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
  const cart = await cartService.getCartById(req.params.id); // req.params.id đã là số nguyên
  if (!cart) return _next(new ApiError(404, "No cart found with that ID"));
  res.status(200).json(JSend.success({ cart }));
});

/**
 * Lấy giỏ hàng theo ID người dùng.
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} _next - Hàm next middleware.
 */
const getCartByUserId = catchAsync(async (req, res, _next) => {
  const cart = await cartService.getCartByUserId(req.params.userId); // req.params.userId đã là số nguyên
  if (!cart) return _next(new ApiError(404, "No cart found for that user ID"));
  res.status(200).json(JSend.success({ cart }));
});

/**
 * Cập nhật số lượng của một mục cụ thể trong giỏ hàng.
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} _next - Hàm next middleware.
 */
const updateCartItem = catchAsync(async (req, res, _next) => {
  const { id: cartId, productId } = req.params; // Lấy cartId từ params, productId cũng từ params
  const { quantity } = req.body; // quantity được gửi trong body (multipart/form-data)

  const updatedCartItem = await cartService.updateCartItem(
    parseInt(cartId, 10),
    parseInt(productId, 10),
    parseInt(quantity, 10)
  );

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
  const deleted = await cartService.deleteCart(req.params.id); // req.params.id đã là số nguyên
  if (!deleted) return _next(new ApiError(404, "No cart found with that ID to delete"));
  res.status(204).json(JSend.success());
});

/**
 * Xóa một mục cụ thể trong giỏ hàng.
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} _next - Hàm next middleware.
 */
const deleteCartItem = catchAsync(async (req, res, _next) => {
  const { id: cartId, productId } = req.params; // Lấy cartId và productId từ params
  const deleted = await cartService.deleteCartItem(parseInt(cartId, 10), parseInt(productId, 10));
  if (!deleted) return _next(new ApiError(404, "No cart item found with that Cart ID and Product ID to delete"));
  res.status(204).json(JSend.success());
});

/**
 * Xóa tất cả các giỏ hàng (chỉ dành cho admin/dev).
 * @param {Object} _req - Đối tượng request (không sử dụng).
 * @param {Object} res - Đối tượng response.
 * @param {Function} _next - Hàm next middleware.
 */
const deleteAllCarts = catchAsync(async (_req, res, _next) => {
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
