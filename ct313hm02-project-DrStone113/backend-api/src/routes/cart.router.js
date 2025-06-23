const express = require("express");
const cartController = require("../controllers/cart.controller");
const cartSchemas = require("../schema/cart.schemas");
const { validate } = require("../middlewares/validator.middleware"); // Đảm bảo đường dẫn này đúng
const { methodNotAllowed } = require("../controllers/errors.controller"); // Đảm bảo đường dẫn này đúng
const multer = require('multer'); // Import multer

const router = express.Router();
// Khởi tạo multer instance. Sử dụng .none() cho các route chỉ xử lý các trường văn bản từ multipart/form-data.
const upload = multer();

// Hàm setup để đăng ký các route giỏ hàng vào ứng dụng Express
module.exports.setup = (app) => {
  app.use("/api/v1/carts", router); // Đăng ký base path cho các route giỏ hàng

  router.route("/")
    .get(
      validate(cartSchemas.getCartQuerySchema), // Validate query params
      cartController.getAllCarts
    )
    .post(
      upload.none(), // Xử lý các trường văn bản từ multipart/form-data
      validate(cartSchemas.createCartSchema), // Validate request body
      cartController.createCart
    )
    .delete(cartController.deleteAllCarts); // Xóa tất cả giỏ hàng (chỉ dành cho admin/dev)

  router.route("/user/:userId")
    .get(
      validate({ params: cartSchemas.userIdParamSchema }), // Validate URL params
      cartController.getCartByUserId
    );

  router.route("/:id")
    .get(
      validate({ params: cartSchemas.cartIdParamSchema }), // Validate URL params
      cartController.getCartById
    )
    .delete(
      validate({ params: cartSchemas.cartIdParamSchema }), // Validate URL params
      cartController.deleteCart
    );

  router.route("/:id/item/:productId") // Route để cập nhật/xóa một mục cụ thể trong giỏ hàng
    .put(
      upload.none(), // Xử lý các trường văn bản từ multipart/form-data
      validate({
        // Mở rộng cartIdParamSchema để bao gồm productId
        params: cartSchemas.cartIdParamSchema.extend({
          productId: cartSchemas.cartItemSchema.shape.product_id, // Lấy schema cho product_id từ cartItemSchema
        }),
        body: cartSchemas.updateCartItemSchema, // Schema cho quantity trong body
      }),
      cartController.updateCartItem
    )
    .delete(
      validate({
        // Mở rộng cartIdParamSchema để bao gồm productId
        params: cartSchemas.cartIdParamSchema.extend({
          productId: cartSchemas.cartItemSchema.shape.product_id,
        }),
      }),
      cartController.deleteCartItem
    );

  // Xử lý các method không được phép trên các route này
  router.all("/", methodNotAllowed);
  router.all("/user/:userId", methodNotAllowed);
  router.all("/:id", methodNotAllowed);
  router.all("/:id/item/:productId", methodNotAllowed);
};
