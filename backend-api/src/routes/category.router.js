const express = require("express");
const multer = require('multer'); // Import multer
const categoryController = require("../controllers/category.controller");
const categorySchemas = require("../schema/category.schemas"); // Đảm bảo đường dẫn này đúng
const { validate } = require("../middlewares/validator.middleware");
const { methodNotAllowed } = require("../controllers/errors.controller");

const router = express.Router();
const upload = multer(); // Khởi tạo multer instance

// ROUTES
module.exports.setup = (app) => {
  app.use("/api/v1/categories", router);

  router.route("/")
    .get(
      validate({ query: categorySchemas.getCategoryQuerySchema }), // Validate query params
      categoryController.getAllCategories
    )
    .post(
      upload.none(), // <-- Quan trọng: xử lý các trường văn bản từ multipart/form-data
      validate({ body: categorySchemas.categorySchema }), // Validate request body
      categoryController.createCategory
    )
    .delete(categoryController.deleteAllCategories); // Xóa tất cả (endpoint này có thể không cần validate body)

  router.route("/:id")
    .get(
      validate({ params: categorySchemas.categoryIdParamSchema }), // Validate URL params
      categoryController.getCategoryById
    )
    .put(
      upload.none(), // <-- Quan trọng: xử lý các trường văn bản từ multipart/form-data
      validate({ params: categorySchemas.categoryIdParamSchema, body: categorySchemas.categorySchema }), // Validate params và body
      categoryController.updateCategory
    )
    .delete(
      validate({ params: categorySchemas.categoryIdParamSchema }), // Validate URL params
      categoryController.deleteCategory
    );

  // Xử lý các method không được phép trên các route này
  router.all("/", methodNotAllowed);
  router.all("/:id", methodNotAllowed);
};