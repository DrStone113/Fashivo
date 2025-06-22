// ct313hm02-project-DrStone113/backend-api/src/controllers/product.controller.js
const JSend = require("../jsend");

function createProduct(req, res) {
  return res.status(201).json(JSend.success({ product: {} }));
}

function getProductsByFilter(req, res) {
  const filters = [];
  const { name, type } = req.query;

  if (name) {
    filters.push(`name=${name}`);
  }

  if (type !== undefined) {
    filters.push(`type=${type}`);
  }

  console.log(filters.join("&"));

  return res.json(
    JSend.success({
      product: [],
    })
  );
}

function getProduct(req, res) {
  return res.json(JSend.success({ product: {} }));
}

function updateProduct(req, res) {
  return res.json(JSend.success({ product: {} }));
}

function deleteProduct(req, res) {
  return res.json(JSend.success());
}

function deleteAllProducts(req, res) {
  return res.json(JSend.success());
}

module.exports = {
  getProductsByFilter,
  deleteAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
