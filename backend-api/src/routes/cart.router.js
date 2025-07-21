const express = require("express");
const cartController = require("../controllers/cart.controller");
const cartSchemas = require("../schema/cart.schemas");
const { validate } = require("../middlewares/validator.middleware"); 
const { methodNotAllowed } = require("../controllers/errors.controller"); 
const multer = require('multer'); 
const { authenticate, restrictTo } = require("../middlewares/auth.middleware");

const router = express.Router();
const upload = multer();

module.exports.setup = (app) => {
  app.use("/api/v1/carts", router);

  router.route("/")
    .get(
      authenticate,
      restrictTo('admin'), // Chỉ admin mới được GET tất cả giỏ hàng
      validate(cartSchemas.getCartQuerySchema),
      cartController.getAllCarts
    )
    .post(
      authenticate, // User và admin đều có thể tạo/cập nhật giỏ hàng (logic kiểm tra user_id trong controller)
      upload.none(),
      validate(cartSchemas.createCartSchema),
      cartController.createCart
    )
    .delete(
      authenticate,
      restrictTo('admin'),
      cartController.deleteAllCarts
    );

  router.route("/myCart") // THÊM ROUTE NÀY CHO GIỎ HÀNG CỦA NGƯỜI DÙNG HIỆN TẠI
    .get(
      authenticate, // Yêu cầu xác thực, nhưng không cần restrictTo admin
      cartController.getMyCart // Controller mới sẽ được tạo
    )
    .post( // Thêm sản phẩm vào giỏ hàng của tôi
      authenticate,
      upload.none(),
      validate(cartSchemas.addItemToCartSchema), // Cần định nghĩa schema này
      cartController.addItemToMyCart // Controller mới
    )
    .patch( // Cập nhật số lượng sản phẩm trong giỏ hàng của tôi
      authenticate,
      upload.none(),
      validate(cartSchemas.updateCartItemSchema), // Schema cho quantity trong body
      cartController.updateMyCartItem // Controller mới
    )
    .delete( // Xóa toàn bộ giỏ hàng của tôi
      authenticate,
      cartController.clearMyCart // Controller mới
    );

  router.route("/removeItem") // Route để xóa một mục cụ thể khỏi giỏ hàng của tôi
    .delete(
      authenticate,
      upload.none(),
      validate(cartSchemas.removeItemFromCartSchema), // Cần định nghĩa schema này
      cartController.removeItemFromMyCart // Controller mới
    );

  router.route("/user/:userId")
    .get(
      authenticate,
      restrictTo('admin'), // Chỉ admin mới được GET giỏ hàng theo userId
      validate({ params: cartSchemas.userIdParamSchema }),
      cartController.getCartByUserId
    );

  router.route("/:id")
    .get(
      authenticate,
      restrictTo('admin'), // Chỉ admin mới được GET giỏ hàng theo cartId
      validate({ params: cartSchemas.cartIdParamSchema }),
      cartController.getCartById
    )
    .delete(
      authenticate,
      restrictTo('admin'), // Chỉ admin mới được DELETE giỏ hàng theo cartId
      validate({ params: cartSchemas.cartIdParamSchema }),
      cartController.deleteCart
    );

  router.route("/:id/item/:productId") // Route này có thể bị trùng lặp với /myCart/item/:productId, nên cân nhắc
    .put(
      authenticate,
      upload.none(),
      validate({
        params: cartSchemas.cartIdParamSchema.extend({
          productId: cartSchemas.cartItemSchema.shape.product_id,
        }),
        body: cartSchemas.updateCartItemSchema,
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

  router.all("/", methodNotAllowed);
  router.all("/user/:userId", methodNotAllowed);
  router.all("/:id", methodNotAllowed);
  router.all("/:id/item/:productId", methodNotAllowed);
};
