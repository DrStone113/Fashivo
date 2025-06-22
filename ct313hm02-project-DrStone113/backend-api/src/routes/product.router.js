// ct313hm02-project-DrStone113/backend-api/src/routes/product.router.js
const express = require("express");
const productController = require("../controllers/product.controller");
const { methodNotAllowed } = require("../controllers/errors.controller");

const router = express.Router();

module.exports.setup = (app) => {
  app.use("/api/v1/product", router);

  router.get("/", productController.getProductsByFilter);
  router.post("/", productController.createProduct);
  router.delete("/", productController.deleteAllProducts);
  router.all("/", methodNotAllowed);

  router.get("/:id", productController.getProduct);
  router.put("/:id", productController.updateProduct);
  router.delete("/:id", productController.deleteProduct);
  router.all("/:id", methodNotAllowed);
};
