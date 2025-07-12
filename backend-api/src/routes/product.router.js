// ct313hm02-project-DrStone113/backend-api/src/routes/product.router.js
const express = require("express");
const productController = require("../controllers/product.controller");
const productSchemas = require("../schema/product.schemas"); // Correct path
const { validate } = require("../middlewares/validator.middleware");
const { methodNotAllowed } = require("../controllers/errors.controller");
const multer = require("multer");
const ApiError = require("../api-error");
const { authenticate, restrictTo } = require("../middlewares/auth.middleware");

const router = express.Router();

// Multer setup for product images
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/products'); 
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `product-${uniqueSuffix}.${ext}`);
  }
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// ROUTES
// ROUTES
module.exports.setup = (app) => {
  app.use("/api/v1/product", router);

  router.route("/")
    .get(
      authenticate, // Cả user và admin đều được GET
      validate(productSchemas.getProductQuerySchema),
      productController.getAllProducts
    )
    .post(
      authenticate, // Yêu cầu xác thực
      restrictTo('admin'), // Chỉ admin mới được POST
      upload.single("imageFile"),
      validate(productSchemas.createProductSchema),
      productController.createProduct
    )
    .delete(
      authenticate, // Yêu cầu xác thực
      restrictTo('admin'), // Chỉ admin mới được DELETE ALL
      productController.deleteAllProducts
    );

  router.route("/:id")
    .get(
      authenticate, // Cả user và admin đều được GET theo ID
      validate(productSchemas.productIdParamSchema),
      productController.getProductById
    )
    .put(
      authenticate, // Yêu cầu xác thực
      restrictTo('admin'), // Chỉ admin mới được PUT
      upload.single("imageFile"), // Cho phép cập nhật ảnh
      validate(productSchemas.updateProductSchema),
      productController.updateProduct
    )
    .delete(
      authenticate, // Yêu cầu xác thực
      restrictTo('admin'), // Chỉ admin mới được DELETE theo ID
      validate(productSchemas.productIdParamSchema),
      productController.deleteProduct
    );

  router.all("/", methodNotAllowed);
  router.all("/:id", methodNotAllowed);
}