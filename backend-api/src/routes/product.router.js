const express = require("express");
const productController = require("../controllers/product.controller");
const { methodNotAllowed } = require("../controllers/errors.controller");

const router = express.Router();

module.exports.setup = (app) => {
  app.use("/api/v1/product", router);

  router.get("/", productController.getProduct);
  router.post("/", productController.createProduct);
  router.all("/", methodNotAllowed);

  router.put("/:id", productController.updateProduct);
  router.delete("/:id", productController.deleteProduct);
  router.all("/:id", methodNotAllowed);
};
