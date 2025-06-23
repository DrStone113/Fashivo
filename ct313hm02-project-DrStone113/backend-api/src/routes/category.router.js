// ct313hm02-project-DrStone113/backend-api/src/routes/category.router.js
const express = require("express");
const categoryController = require("../controllers/category.controller");
const categorySchemas = require("../schemas/category.schemas"); 
const { validate } = require("../middlewares/validator.middleware"); 
const { methodNotAllowed } = require("../controllers/errors.controller"); 

const router = express.Router();

// ROUTES
module.exports.setup = (app) => {
  app.use("/api/v1/categories", router); 

  router.route("/")
    .get(validate(categorySchemas.getCategoryQuerySchema), categoryController.getAllCategories)
    .post(
      validate(categorySchemas.categorySchema), 
      categoryController.createCategory
    )
    .delete(categoryController.deleteAllCategories); 

  router.route("/:id")
    .get(validate(categorySchemas.categoryIdParamSchema), categoryController.getCategoryById)
    .put(
      validate(categorySchemas.categoryIdParamSchema), // Validate ID params
      validate(categorySchemas.categorySchema), // Validate body khi cập nhật
      categoryController.updateCategory
    )
    .delete(validate(categorySchemas.categoryIdParamSchema), categoryController.deleteCategory);

  // Xử lý các method không được phép trên các route này
  router.all("/", methodNotAllowed);
  router.all("/:id", methodNotAllowed);
};