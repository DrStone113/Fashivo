const express = require("express");
const cartController = require("../controllers/cart.controller");
const cartSchemas = require("../schema/cart.schemas");
const { validate } = require("../middlewares/validator.middleware"); 
const { methodNotAllowed } = require("../controllers/errors.controller"); 
const multer = require('multer'); 
const { authenticate, restrictTo } = require("../middlewares/auth.middleware");

const router = express.Router();
// Khởi tạo multer instance. Sử dụng .none() cho các route chỉ xử lý các trường văn bản từ multipart/form-data.
const upload = multer();

// Hàm setup để đăng ký các route giỏ hàng vào ứng dụng Express
module.exports.setup = (app) => {
  app.use("/api/v1/carts", router); // Đăng ký base path cho các route giỏ hàng

  router.route("/")
    .get(
      authenticate,
      restrictTo('admin'), // Chỉ admin mới được GET tất cả giỏ hàng
      validate(cartSchemas.getCartQuerySchema), // Validate query params
      cartController.getAllCarts
    )
    .post(
      authenticate, // User và admin đều có thể tạo/cập nhật giỏ hàng (logic kiểm tra user_id trong controller)
      upload.none(), // Xử lý các trường văn bản từ multipart/form-data
      validate(cartSchemas.createCartSchema), // Validate request body
      cartController.createCart
    )
    .delete(
      authenticate,
      restrictTo('admin'), // Chỉ admin mới được DELETE ALL
      cartController.deleteAllCarts
    ); // Xóa tất cả giỏ hàng (chỉ dành cho admin/dev)

  router.route("/user/:userId")
    .get(
      authenticate, // User và admin đều có thể GET giỏ hàng theo userId (logic kiểm tra user_id trong controller)
      validate({ params: cartSchemas.userIdParamSchema }), // Validate URL params
      cartController.getCartByUserId
    );

  router.route("/:id")
    .get(
      authenticate, // User và admin đều có thể GET giỏ hàng theo cartId (logic kiểm tra user_id trong controller)
      validate({ params: cartSchemas.cartIdParamSchema }), // Validate URL params
      cartController.getCartById
    )
    .delete(
      authenticate, // User và admin đều có thể DELETE giỏ hàng theo cartId (logic kiểm tra user_id trong controller)
      validate({ params: cartSchemas.cartIdParamSchema }), // Validate URL params
      cartController.deleteCart
    );

  router.route("/:id/item/:productId") // Route để cập nhật/xóa một mục cụ thể trong giỏ hàng
    .put(
      authenticate, // User và admin đều có thể PUT item trong giỏ hàng (logic kiểm tra user_id trong controller)
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
      authenticate, // User và admin đều có thể DELETE item trong giỏ hàng (logic kiểm tra user_id trong controller)
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
