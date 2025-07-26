const express = require("express");

const cartController = require("../controllers/cart.controller");
const cartSchemas = require("../schema/cart.schemas");
const { validate } = require("../middlewares/validator.middleware");
const { methodNotAllowed } = require("../controllers/errors.controller");
const multer = require("multer");
const { authenticate, restrictTo } = require("../middlewares/auth.middleware");

const router = express.Router();
// Initialize multer instance.
// We don't need it for JSON routes, as express.json() in app.js handles them.
// It's declared here for potential use in other routes that might handle multipart/form-data.
const upload = multer();

module.exports.setup = (app) => {
  // Mount the router at /api/v1/carts
  app.use("/api/v1/carts", router);

  // Define routes for /api/v1/carts
  router
    .route("/")
    .get(
      authenticate, // Require authentication
      restrictTo("admin"), // Only admins can view all carts
      validate(cartSchemas.getCartQuerySchema), // Validate query parameters
      cartController.getAllCarts // Controller to get all carts
    )

    .post(
      authenticate, // Require authentication (admin or user can create/update cart)
      // This route expects multipart/form-data with 'items' as a JSON string,
      // based on the implementation in cart.controller.js (createCart uses parseCartItems).
      // Therefore, upload.none() is necessary.
      upload.none(),
      validate(cartSchemas.createCartSchema), // Validate body against create cart schema
      cartController.createCart // Controller to create a cart
    )

    .delete(
      authenticate, // Require authentication
      restrictTo("admin"), // Only admins can delete all carts
      cartController.deleteAllCarts // Controller to delete all carts
    );

  // Define routes for the current user's cart: /api/v1/carts/myCart
  router
    .route("/myCart")
    .get(
      authenticate, // Require user authentication
      cartController.getMyCart // Controller to get the current user's cart
    )

    .post(
      // Add a product to my cart
      authenticate, // Require user authentication
      // The frontend sends `Content-Type: application/json`, so `express.json()` handles the body.
      // `multer.none()` is only needed for `multipart/form-data` without file uploads.
      validate(cartSchemas.addItemToCartSchema), // Validate body against add item to cart schema
      cartController.addItemToMyCart // Controller to add a product to the cart
    )

    .patch(
      // Update product quantity in my cart
      authenticate, // Require user authentication
      // Use updateMyCartItemSchema for this user-specific route
      validate(cartSchemas.updateMyCartItemSchema),
      cartController.updateMyCartItem // Controller to update a cart item
    )

    .delete(
      // Clear my entire cart
      authenticate, // Require user authentication
      cartController.clearMyCart // Controller to clear the entire cart
    );

  // Define route to remove a specific item from my cart
  router.route("/removeItem").delete(
    authenticate, // Require user authentication
    // The frontend sends `Content-Type: application/json`, so `express.json()` handles the body.
    validate(cartSchemas.removeItemFromCartSchema), // Validate body against remove item schema
    cartController.removeItemFromMyCart // Controller to remove a specific item
  );

  // Define route to get a cart by User ID (admin only)
  router.route("/user/:userId").get(
    authenticate,
    restrictTo("admin"),
    validate({ params: cartSchemas.userIdParamSchema }), // Validate the userId parameter
    cartController.getCartByUserId
  );

  // Define routes to get or delete a cart by Cart ID (admin only)
  router
    .route("/:id")
    .get(
      authenticate,
      restrictTo("admin"),
      validate({ params: cartSchemas.cartIdParamSchema }), // Validate the cartId parameter
      cartController.getCartById
    )
    .delete(
      authenticate,
      restrictTo("admin"),
      validate({ params: cartSchemas.cartIdParamSchema }), // Validate the cartId parameter
      cartController.deleteCart
    );

  // Define routes to update or delete a cart item by Cart ID and Product ID (admin only)
  router
    .route("/:id/item/:productId")
    .put(
      authenticate,
      validate({
        params: cartSchemas.cartIdParamSchema.extend({
          productId: cartSchemas.cartItemSchema.shape.product_id,
        }),
        // Use updateCartItemAdminSchema for this admin route
        body: cartSchemas.updateCartItemAdminSchema,
      }),
      cartController.updateCartItem
    )

    .delete(
      authenticate,
      validate({
        params: cartSchemas.cartIdParamSchema.extend({
          productId: cartSchemas.cartItemSchema.shape.product_id,
        }),
      }),
      cartController.deleteCartItem
    );

  // Handle disallowed HTTP methods for these routes
  router.all("/", methodNotAllowed);

  router.all("/myCart", methodNotAllowed);
  router.all("/removeItem", methodNotAllowed);
  router.all("/user/:userId", methodNotAllowed);
  router.all("/:id", methodNotAllowed);
  router.all("/:id/item/:productId", methodNotAllowed);
};
