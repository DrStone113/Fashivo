// backend-api/src/controllers/cart.controller.js

const JSend = require("../jsend");
const ApiError = require("../api-error");
const catchAsync = require("../catchAsync");
const cartService = require("../services/cart.service");
const productService = require("../services/product.service"); // Cần để kiểm tra sản phẩm

// Helper function để phân tích cú pháp 'items' từ request body của multipart/form-data.
// (Giữ nguyên vì bạn đã có)
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
 * Lấy giỏ hàng của người dùng hiện tại.
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} next - Hàm next middleware.
 */
exports.getMyCart = catchAsync(async (req, res, next) => {
  // req.user.id được thêm vào bởi middleware authenticate
  if (!req.user || !req.user.id) {
    // Điều này sẽ không xảy ra nếu authenticate middleware hoạt động đúng
    // và route được bảo vệ. Tuy nhiên, thêm kiểm tra để an toàn.
    return next(new ApiError(401, 'Vui lòng đăng nhập để xem giỏ hàng của bạn.'));
  }

  const cart = await cartService.getCartByUserId(req.user.id);

  if (!cart) {
    // Nếu người dùng chưa có giỏ hàng, trả về giỏ hàng rỗng
    return res.status(200).json(JSend.success({
      cart: { id: null, items: [] },
      message: 'Giỏ hàng của bạn đang trống.'
    }));
  }

  // Lấy chi tiết sản phẩm cho từng mục trong giỏ hàng
  const detailedItems = await Promise.all(cart.items.map(async (item) => {
    const product = await productService.getProductById(item.product_id);
    return {
      ...item,
      product: product // Gắn toàn bộ đối tượng sản phẩm vào
    };
  }));

  res.status(200).json(JSend.success({ cart: { ...cart, items: detailedItems } }));
});

/**
 * Thêm sản phẩm vào giỏ hàng của người dùng hiện tại.
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} next - Hàm next middleware.
 */
exports.addItemToMyCart = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(new ApiError(401, 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.'));
  }
  const { product_id, quantity } = req.body;

  // Kiểm tra sự tồn tại của sản phẩm
  const productExists = await productService.getProductById(product_id);
  if (!productExists) {
    return next(new ApiError(404, 'Sản phẩm không tồn tại.'));
  }

  // cartService.createOrUpdateCart sẽ tạo giỏ hàng nếu chưa có và thêm/cập nhật mục
  const { cart, items } = await cartService.createOrUpdateCart(req.user.id, [{ product_id, quantity }]);

  res.status(200).json(JSend.success({
    message: 'Sản phẩm đã được thêm vào giỏ hàng.',
    cart: { ...cart, items }
  }));
});

/**
 * Cập nhật số lượng của một mục trong giỏ hàng của người dùng hiện tại.
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} next - Hàm next middleware.
 */
exports.updateMyCartItem = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(new ApiError(401, 'Vui lòng đăng nhập để cập nhật giỏ hàng.'));
  }
  const { product_id, quantity } = req.body;

  const userCart = await cartService.getCartByUserId(req.user.id);
  if (!userCart) {
    return next(new ApiError(404, 'Không tìm thấy giỏ hàng của bạn.'));
  }

  if (quantity <= 0) {
    // Nếu số lượng là 0 hoặc âm, xóa sản phẩm khỏi giỏ hàng
    const deleted = await cartService.deleteCartItem(userCart.id, product_id);
    if (!deleted) {
      return next(new ApiError(404, 'Không tìm thấy sản phẩm trong giỏ hàng để xóa.'));
    }
    res.status(200).json(JSend.success({ message: 'Sản phẩm đã được xóa khỏi giỏ hàng.' }));
  } else {
    const updatedItem = await cartService.updateCartItem(userCart.id, product_id, quantity);
    if (!updatedItem) {
      return next(new ApiError(404, 'Không tìm thấy sản phẩm trong giỏ hàng để cập nhật.'));
    }
    res.status(200).json(JSend.success({
      message: 'Số lượng sản phẩm đã được cập nhật.',
      item: updatedItem
    }));
  }
});

/**
 * Xóa một mục cụ thể khỏi giỏ hàng của người dùng hiện tại.
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} next - Hàm next middleware.
 */
exports.removeItemFromMyCart = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(new ApiError(401, 'Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng.'));
  }
  const { product_id } = req.body; // productId từ body

  const userCart = await cartService.getCartByUserId(req.user.id);
  if (!userCart) {
    return next(new ApiError(404, 'Không tìm thấy giỏ hàng của bạn.'));
  }

  const deleted = await cartService.deleteCartItem(userCart.id, product_id);
  if (!deleted) {
    return next(new ApiError(404, 'Không tìm thấy sản phẩm trong giỏ hàng để xóa.'));
  }

  res.status(200).json(JSend.success({ message: 'Sản phẩm đã được xóa khỏi giỏ hàng.' }));
});

/**
 * Xóa toàn bộ giỏ hàng của người dùng hiện tại.
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} next - Hàm next middleware.
 */
exports.clearMyCart = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(new ApiError(401, 'Vui lòng đăng nhập để xóa giỏ hàng.'));
  }

  const userCart = await cartService.getCartByUserId(req.user.id);
  if (!userCart) {
    return next(new ApiError(404, 'Không tìm thấy giỏ hàng của bạn để xóa.'));
  }

  const deleted = await cartService.deleteCart(userCart.id);
  if (!deleted) {
    return next(new ApiError(500, 'Không thể xóa giỏ hàng của bạn.'));
  }

  res.status(200).json(JSend.success({ message: 'Giỏ hàng của bạn đã được xóa.' }));
});


// --- Admin/General Cart Operations (Giữ nguyên các hàm bạn đã có) ---

/**
 * Xử lý yêu cầu tạo giỏ hàng hoặc thêm/cập nhật mục vào giỏ hàng.
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} next - Hàm next middleware.
 */
exports.createCart = catchAsync(async (req, res, next) => {
    // Nếu có user_id trong body, ưu tiên dùng nó (admin có thể tạo cho người khác)
    // Nếu không, sử dụng user_id từ token của người dùng hiện tại
    const { user_id: requestedUserId } = req.body;
    const currentUserId = req.user ? req.user.id : null; // Lấy từ token nếu có

    let targetUserId = requestedUserId || currentUserId;

    if (!targetUserId) {
        return next(new ApiError(400, 'User ID là bắt buộc để tạo giỏ hàng.'));
    }

    const items = parseCartItems(req.body); // Sử dụng helper function
    if (items.length === 0) {
        return next(new ApiError(400, "Ít nhất một sản phẩm là bắt buộc cho giỏ hàng."));
    }

    const { cart, items: cartItems } = await cartService.createOrUpdateCart(targetUserId, items);

    res.status(201).json(JSend.success({
        message: "Giỏ hàng đã được tạo/cập nhật thành công.",
        cart: { ...cart, items: cartItems },
    }));
});

/**
 * Lấy tất cả giỏ hàng (chỉ dành cho admin).
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} next - Hàm next middleware.
 */
exports.getAllCarts = catchAsync(async (req, res, next) => {
    const filters = req.query; // Query đã được validate và coerced bởi Zod
    const cartsData = await cartService.getAllCarts(filters);
    res.status(200).json(JSend.success({
        carts: cartsData.carts,
        metadata: {
            totalItems: cartsData.totalItems,
            currentPage: cartsData.currentPage,
            totalPages: cartsData.totalPages,
            limit: cartsData.limit
        }
    }));
});

/**
 * Lấy giỏ hàng theo User ID (chỉ dành cho admin).
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} next - Hàm next middleware.
 */
exports.getCartByUserId = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const cart = await cartService.getCartByUserId(userId);
    if (!cart) {
        return next(new ApiError(404, "Không tìm thấy giỏ hàng cho người dùng này."));
    }
    res.status(200).json(JSend.success({ cart }));
});

/**
 * Lấy giỏ hàng theo Cart ID (chỉ dành cho admin).
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} next - Hàm next middleware.
 */
exports.getCartById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const cart = await cartService.getCartById(id);
    if (!cart) {
        return next(new ApiError(404, "Không tìm thấy giỏ hàng với ID này."));
    }
    res.status(200).json(JSend.success({ cart }));
});

/**
 * Cập nhật số lượng của một mục trong giỏ hàng (dành cho admin).
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} next - Hàm next middleware.
 */
exports.updateCartItem = catchAsync(async (req, res, next) => {
    const { id, productId } = req.params; // cartId và productId từ params
    const { quantity } = req.body; // quantity từ body

    const updatedItem = await cartService.updateCartItem(id, productId, quantity);
    if (!updatedItem) {
        return next(new ApiError(404, "Không tìm thấy mục giỏ hàng để cập nhật."));
    }
    res.status(200).json(JSend.success({ message: "Mục giỏ hàng đã được cập nhật.", item: updatedItem }));
});

/**
 * Xóa một mục cụ thể khỏi giỏ hàng (dành cho admin).
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} next - Hàm next middleware.
 */
exports.deleteCartItem = catchAsync(async (req, res, next) => {
    const { id, productId } = req.params;
    const deleted = await cartService.deleteCartItem(id, productId);
    if (!deleted) {
        return next(new ApiError(404, "Không tìm thấy mục giỏ hàng để xóa."));
    }
    res.status(200).json(JSend.success({ message: "Mục giỏ hàng đã được xóa." }));
});

/**
 * Xóa toàn bộ giỏ hàng (dành cho admin).
 * @param {Object} req - Đối tượng request.
 * @param {Object} res - Đối tượng response.
 * @param {Function} next - Hàm next middleware.
 */
exports.deleteCart = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const deleted = await cartService.deleteCart(id);
    if (!deleted) {
        return next(new ApiError(404, "Không tìm thấy giỏ hàng để xóa."));
    }
    res.status(200).json(JSend.success({ message: "Giỏ hàng đã được xóa." }));
});

/**
 * Xóa tất cả các giỏ hàng (chỉ dành cho admin/dev).
 * @param {Object} _req - Đối tượng request (không sử dụng).
 * @param {Object} res - Đối tượng response.
 * @param {Function} _next - Hàm next middleware.
 */
exports.deleteAllCarts = catchAsync(async (_req, res, _next) => {
    await cartService.deleteAllCarts();
    res.status(200).json(JSend.success({ message: "Tất cả giỏ hàng đã được xóa." }));
});
