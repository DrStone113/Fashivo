const express = require("express");
const multer = require('multer');
const categoryController = require("../controllers/category.controller");
const categorySchemas = require("../schema/category.schemas"); // Correct path
const { validate } = require("../middlewares/validator.middleware");
const { methodNotAllowed } = require("../controllers/errors.controller");

const router = express.Router();
const upload = multer(); // For handling multipart/form-data with only text fields

// ROUTES
module.exports.setup = (app) => {
  app.use("/api/v1/categories", router);

  router.route("/")
    .get(
      validate(categorySchemas.getCategoryQuerySchema),
      categoryController.getAllCategories
    )
    .post(
      upload.none(), // Process text fields from multipart/form-data
      validate(categorySchemas.createCategorySchema), // Use create schema
      categoryController.createCategory
    )
    .delete(categoryController.deleteAllCategories);

  router.route("/:id")
    .get(
      validate({ params: categorySchemas.categoryIdParamSchema }),
      categoryController.getCategoryById
    )
    .put( // Or PATCH
      upload.none(), // Process text fields from multipart/form-data
      validate(categorySchemas.updateCategorySchema), // Use update schema
      categoryController.updateCategory
    )
    .delete(
      validate({ params: categorySchemas.categoryIdParamSchema }),
      categoryController.deleteCategory
    );

  // Handle methods not allowed
  router.all("/", methodNotAllowed);
  router.all("/:id", methodNotAllowed);
};