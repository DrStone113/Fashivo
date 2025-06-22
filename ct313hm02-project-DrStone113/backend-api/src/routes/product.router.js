// ct313hm02-project-DrStone113/backend-api/src/routes/product.router.js
const express = require("express");
const productController = require("../controllers/product.controller");
const productSchemas = require("../schemas/product.schemas"); // Import schemas
const { validate } = require("../middlewares/validator.middleware"); // TẠO FILE NÀY NẾU CHƯA CÓ
const { methodNotAllowed } = require("../controllers/errors.controller");
const multer = require("multer"); // Import Multer

const router = express.Router();

// Multer setup
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ĐẢM BẢO THƯ MỤC NÀY TỒN TẠI: public/img/products
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
    // Sử dụng ApiError thay vì Error để thống nhất xử lý lỗi
    cb(new ApiError(400, "Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Middleware validate.js (Tạo file này nếu chưa có)
// ct313hm02-project-DrStone113/backend-api/src/middlewares/validator.middleware.js
const validate = (schema) => (req, res, next) => {
    try {
        // Tùy thuộc vào schema của bạn, bạn có thể validate req.body, req.query, req.params
        // productSchema: { body: z.object(...) }
        // getProductQuerySchema: { query: z.object(...) }
        // productIdParamSchema: { params: z.object(...) }
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        // Zod error có thể được format lại cho response thân thiện hơn
        next(new ApiError(400, "Validation failed", error.errors));
    }
};
// module.exports = { validate };


module.exports.setup = (app) => {
  app.use("/api/v1/product", router);

  router.route("/")
    .get(validate(productSchemas.getProductQuerySchema), productController.getAllProducts)
    .post(
      upload.single("imageFile"), // MULTER TRƯỚC
      validate(productSchemas.productSchema), // ZOD BODY SAU MULTER
      productController.createProduct
    )
    .delete(productController.deleteAllProducts); // Không cần validate ở đây nếu không có body/query

  router.route("/:id")
    .get(validate(productSchemas.productIdParamSchema), productController.getProductById)
    .put(
      validate(productSchemas.productIdParamSchema), // Validate ID param trước
      upload.single("imageFile"), // MULTER TRƯỚC
      validate(productSchemas.productSchema), // ZOD BODY SAU MULTER
      productController.updateProduct
    )
    .delete(validate(productSchemas.productIdParamSchema), productController.deleteProduct);

  // Áp dụng methodNotAllowed cho các route đã được định nghĩa, nhưng không hỗ trợ các method khác
  router.all("/", methodNotAllowed);
  router.all("/:id", methodNotAllowed);
};