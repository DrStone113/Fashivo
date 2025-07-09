// ct313hm02-project-DrStone113/backend-api/src/routes/product.router.js
const express = require("express");
const productController = require("../controllers/product.controller");
const productSchemas = require("../schema/product.schemas"); // Correct path
const { validate } = require("../middlewares/validator.middleware");
const { methodNotAllowed } = require("../controllers/errors.controller");
const multer = require("multer");
const ApiError = require("../api-error");

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
module.exports.setup = (app) => {
  app.use("/api/v1/product", router);

  router.route("/")
    .get(validate(productSchemas.getProductQuerySchema), productController.getAllProducts)
    .post(
      upload.single("imageFile"), 
      validate(productSchemas.createProductSchema), // Use create schema
      productController.createProduct
    )
    .delete(productController.deleteAllProducts);

  router.route("/:id")
    .get(validate(productSchemas.productIdParamSchema), productController.getProductById)
    .put( // Or PATCH, depending on your API design for partial updates
      upload.single("imageFile"), // Allow image update
      validate(productSchemas.updateProductSchema), // Use update schema
      productController.updateProduct
    )
    .delete(validate(productSchemas.productIdParamSchema), productController.deleteProduct);

  router.all("/", methodNotAllowed);
  router.all("/:id", methodNotAllowed);
}