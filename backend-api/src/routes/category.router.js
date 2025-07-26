const express = require("express");

const multer = require("multer");
const categoryController = require("../controllers/category.controller");
const categorySchemas = require("../schema/category.schemas"); // Correct path
const { validate } = require("../middlewares/validator.middleware");
const { methodNotAllowed } = require("../controllers/errors.controller");
const { authenticate, restrictTo } = require("../middlewares/auth.middleware");

const router = express.Router();
const upload = multer(); // For handling multipart/form-data with only text fields

// ROUTES
module.exports.setup = (app) => {
  app.use("/api/v1/categories", router);

  router
    .route("/")
    .get(
      validate(categorySchemas.getCategoryQuerySchema),
      categoryController.getAllCategories
    )
    .post(
      authenticate, // Require authentication
      restrictTo("admin"), // Only admins can POST
      upload.none(), // Process text fields from multipart/form-data
      validate(categorySchemas.createCategorySchema), // Use create schema
      categoryController.createCategory
    )

    .delete(
      authenticate, // Require authentication
      restrictTo("admin"), // Only admins can DELETE ALL
      categoryController.deleteAllCategories
    );

  router
    .route("/:id")
    .get(
      validate({ params: categorySchemas.categoryIdParamSchema }),
      categoryController.getCategoryById
    )
    .put(
      // Or PATCH
      authenticate, // Require authentication
      restrictTo("admin"), // Only admins can PUT
      upload.none(), // Process text fields from multipart/form-data
      validate(categorySchemas.updateCategorySchema), // Use update schema
      categoryController.updateCategory
    )

    .delete(
      authenticate, // Require authentication
      restrictTo("admin"), // Only admins can DELETE by ID
      validate({ params: categorySchemas.categoryIdParamSchema }),
      categoryController.deleteCategory
    );

  // Handle methods not allowed
  router.all("/", methodNotAllowed);
  router.all("/:id", methodNotAllowed);
};
