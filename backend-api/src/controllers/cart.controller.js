const JSend = require("../jsend");
const ApiError = require("../api-error");
const catchAsync = require("../catchAsync");
const cartService = require("../services/cart.service");
const productService = require("../services/product.service");

/**
 * Parses cart items from the request body.
 * @param {object} reqBody - The request body.
 * @returns {Array<{product_id: number, quantity: number}>} - An array of parsed cart items.
 * @throws {ApiError} If the items format is invalid.
 */
const parseCartItems = (reqBody) => {
  if (!reqBody.items) {
    return [];
  }
  try {
    const parsedItems = JSON.parse(reqBody.items);
    if (!Array.isArray(parsedItems)) {
      throw new Error("Items must be a JSON string representing an array.");
    }
    return parsedItems.map((item) => ({
      product_id: parseInt(item.product_id, 10),
      quantity: parseInt(item.quantity, 10),
    }));
  } catch (e) {
    throw new ApiError(
      400,
      `Invalid items format: ${e.message}. Must be a JSON array string.`
    );
  }
};

/**
 * Gets the current user's cart.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const getMyCart = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(new ApiError(401, "Please log in to view your cart."));
  }

  const cart = await cartService.getCartByUserId(req.user.id);

  if (!cart || !cart.items || cart.items.length === 0) {
    return res.status(200).json(
      JSend.success({
        cart: { id: cart ? cart.id : null, items: [] }, // Ensure cart ID is returned if it exists but is empty
        message: "Your cart is empty.",
      })
    );
  }

  // Fetch product details for each item in the cart
  const detailedItems = await Promise.all(
    cart.items.map(async (item) => {
      const product = await productService.getProductById(item.product_id);
      if (!product) {
        console.warn(
          `Product with ID ${item.product_id} not found for cart item.`
        );
        return { ...item, product: null }; // Return item with null product if not found
      }
      return {
        ...item,
        product: product, // Attach the full product object
      };
    })
  );

  res
    .status(200)
    .json(JSend.success({ cart: { ...cart, items: detailedItems } }));
});

/**
 * Adds an item to the current user's cart.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const addItemToMyCart = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(new ApiError(401, "Please log in to add items to your cart."));
  }
  const { product_id, quantity } = req.body;

  const productExists = await productService.getProductById(product_id);
  if (!productExists) {
    return next(new ApiError(404, "Product not found."));
  }

  const { cart, items } = await cartService.createOrUpdateCart(req.user.id, [
    { product_id, quantity },
  ]);

  res.status(200).json(
    JSend.success({
      message: "Product added to cart successfully.",
      cart: { ...cart, items },
    })
  );
});

/**
 * Updates the quantity of an item in the current user's cart.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const updateMyCartItem = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(new ApiError(401, "Please log in to update your cart."));
  }
  const { product_id, quantity } = req.body;

  if (product_id === undefined || quantity === undefined) {
    return next(
      new ApiError(400, "Missing product ID or quantity for update.")
    );
  }

  const userCart = await cartService.getCartByUserId(req.user.id);
  if (!userCart) {
    return next(new ApiError(404, "Your cart was not found."));
  }

  if (quantity <= 0) {
    const deleted = await cartService.deleteCartItem(userCart.id, product_id);
    if (!deleted) {
      return next(new ApiError(404, "Product not found in cart to delete."));
    }
    res
      .status(200)
      .json(JSend.success({ message: "Product removed from cart." }));
  } else {
    const updatedItem = await cartService.updateCartItem(
      userCart.id,
      product_id,
      quantity
    );
    if (!updatedItem) {
      return next(new ApiError(404, "Product not found in cart to update."));
    }
    res.status(200).json(
      JSend.success({
        message: "Product quantity updated successfully.",
        item: updatedItem,
      })
    );
  }
});

/**
 * Removes a specific item from the current user's cart.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const removeItemFromMyCart = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(
      new ApiError(401, "Please log in to remove items from your cart.")
    );
  }
  const { product_id } = req.body;

  const userCart = await cartService.getCartByUserId(req.user.id);
  if (!userCart) {
    return next(new ApiError(404, "Your cart was not found."));
  }

  const deleted = await cartService.deleteCartItem(userCart.id, product_id);
  if (!deleted) {
    return next(new ApiError(404, "Product not found in cart to delete."));
  }

  res
    .status(200)
    .json(JSend.success({ message: "Product removed from cart." }));
});

/**
 * Clears the entire cart for the current user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const clearMyCart = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(new ApiError(401, "Please log in to clear your cart."));
  }

  const userCart = await cartService.getCartByUserId(req.user.id);
  if (!userCart) {
    return next(new ApiError(404, "Your cart was not found to be cleared."));
  }

  const deleted = await cartService.deleteCart(userCart.id);
  if (!deleted) {
    return next(new ApiError(500, "Could not clear your cart."));
  }

  res
    .status(200)
    .json(JSend.success({ message: "Your cart has been cleared." }));
});

// --- Admin/General Cart Operations ---

/**
 * Creates a new cart or updates an existing one. (Admin)
 */
const createCart = catchAsync(async (req, res, next) => {
  const { user_id: requestedUserId } = req.body;
  const currentUserId = req.user ? req.user.id : null;

  let targetUserId = requestedUserId || currentUserId;

  if (!targetUserId) {
    return next(new ApiError(400, "User ID is required to create a cart."));
  }

  const items = parseCartItems(req.body);
  if (items.length === 0) {
    return next(
      new ApiError(400, "At least one item is required for the cart.")
    );
  }

  const { cart, items: cartItems } = await cartService.createOrUpdateCart(
    targetUserId,
    items
  );

  res.status(201).json(
    JSend.success({
      message: "Cart created/updated successfully.",
      cart: { ...cart, items: cartItems },
    })
  );
});

/**
 * Gets all carts with filtering and pagination. (Admin)
 */
const getAllCarts = catchAsync(async (req, res, next) => {
  const filters = req.query;
  const cartsData = await cartService.getAllCarts(filters);
  res.status(200).json(
    JSend.success({
      carts: cartsData.carts,
      metadata: {
        totalItems: cartsData.totalItems,
        currentPage: cartsData.currentPage,
        totalPages: cartsData.totalPages,
        limit: cartsData.limit,
      },
    })
  );
});

/**
 * Gets a cart by user ID. (Admin)
 */
const getCartByUserId = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const cart = await cartService.getCartByUserId(userId);
  if (!cart) {
    return next(new ApiError(404, "Cart not found for this user."));
  }
  res.status(200).json(JSend.success({ cart }));
});

/**
 * Gets a cart by its ID. (Admin)
 */
const getCartById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const cart = await cartService.getCartById(id);
  if (!cart) {
    return next(new ApiError(404, "Cart with this ID not found."));
  }
  res.status(200).json(JSend.success({ cart }));
});

/**
 * Updates a specific item in a cart. (Admin)
 */
const updateCartItem = catchAsync(async (req, res, next) => {
  const { id, productId } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined) {
    return next(new ApiError(400, "Quantity is required for update."));
  }

  const updatedItem = await cartService.updateCartItem(id, productId, quantity);
  if (!updatedItem) {
    return next(new ApiError(404, "Cart item not found for update."));
  }
  res
    .status(200)
    .json(
      JSend.success({
        message: "Cart item updated successfully.",
        item: updatedItem,
      })
    );
});

/**
 * Deletes a specific item from a cart. (Admin)
 */
const deleteCartItem = catchAsync(async (req, res, next) => {
  const { id, productId } = req.params;
  const deleted = await cartService.deleteCartItem(id, productId);
  if (!deleted) {
    return next(new ApiError(404, "Cart item not found to delete."));
  }
  res
    .status(200)
    .json(JSend.success({ message: "Cart item deleted successfully." }));
});

/**
 * Deletes a cart by its ID. (Admin)
 */
const deleteCart = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleted = await cartService.deleteCart(id);
  if (!deleted) {
    return next(new ApiError(404, "Cart not found to delete."));
  }
  res
    .status(200)
    .json(JSend.success({ message: "Cart deleted successfully." }));
});

/**
 * Deletes all carts. (Admin)
 */
const deleteAllCarts = catchAsync(async (_req, res, _next) => {
  await cartService.deleteAllCarts();
  res
    .status(200)
    .json(JSend.success({ message: "All carts have been deleted." }));
});

// Export all functions
module.exports = {
  getMyCart,
  addItemToMyCart,
  updateMyCartItem,
  removeItemFromMyCart,
  clearMyCart,
  createCart,
  getAllCarts,
  getCartByUserId,
  getCartById,
  updateCartItem,
  deleteCartItem,
  deleteCart,
  deleteAllCarts,
};
