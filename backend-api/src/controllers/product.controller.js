const JSend = require("../jsend");
const ApiError = require("../api-error");
const catchAsync = require("../catchAsync");
const productService = require("../services/product.service");
const categoryService = require("../services/category.service");
const fs = require("fs").promises;
const path = require("path");

/**
 * Creates a new product.
 */
const createProduct = catchAsync(async (req, res, next) => {
  let image_url = null;
  if (req.file) {
    image_url = `/public/image/products/${req.file.filename}`;
  } else {
    return next(new ApiError(400, "Product image is required."));
  }

  const { type, name, description, price, stock, category_id } = req.body;

  if (category_id !== undefined && category_id !== null) {
    const categoryExists = await categoryService.getCategoryById(category_id);
    if (!categoryExists) {
      // If category is invalid, delete the uploaded image.
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      return next(new ApiError(404, "Category not found."));
    }
  }

  const productData = {
    type,
    name,
    description,
    price,
    stock,
    available: true,
    image_url,
    category_id,
  };

  const newProduct = await productService.createProduct(productData);
  return res.status(201).json(JSend.success({ product: newProduct }));
});

/**
 * Updates an existing product.
 */
const updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let image_url = undefined;
  let oldImagePath = null;

  const oldProduct = await productService.getProductById(id);
  if (!oldProduct) {
    // If product doesn't exist, delete the newly uploaded file if any.
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkErr) {
        console.error(
          `Failed to delete uploaded file for non-existent product: ${req.file.path}`,
          unlinkErr
        );
      }
    }
    return next(new ApiError(404, "Product not found with the specified ID."));
  }

  if (req.file) {
    image_url = `/public/image/products/${req.file.filename}`;
    // If there was an old image, mark it for deletion.
    if (
      oldProduct.image_url &&
      oldProduct.image_url.includes("/public/image/products/")
    ) {
      oldImagePath = path.join(__dirname, "../..", oldProduct.image_url);
    }
  } else if (req.body.image_url === "") {
    // Handle explicit image removal.
    image_url = null;
    if (
      oldProduct.image_url &&
      oldProduct.image_url.includes("/public/image/products/")
    ) {
      oldImagePath = path.join(__dirname, "../..", oldProduct.image_url);
    }
  }

  const { type, name, description, price, stock, available, category_id } =
    req.body;

  const updateData = {
    type,
    name,
    description,
    price,
    stock,
    available,
    image_url,
    category_id,
  };

  // Remove undefined fields so they are not updated in the database.
  Object.keys(updateData).forEach(
    (key) => updateData[key] === undefined && delete updateData[key]
  );

  // Validate category if it's being updated.
  if (updateData.category_id !== undefined && updateData.category_id !== null) {
    const categoryExists = await categoryService.getCategoryById(
      updateData.category_id
    );
    if (!categoryExists) {
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkErr) {
          console.error(
            `Failed to delete uploaded file for invalid category: ${req.file.path}`,
            unlinkErr
          );
        }
      }
      return next(new ApiError(404, "Category not found."));
    }
  }

  const updatedProduct = await productService.updateProduct(id, updateData);

  if (updatedProduct) {
    // If update was successful and there's an old image, delete it.
    if (oldImagePath) {
      try {
        await fs.unlink(oldImagePath);
      } catch (err) {
        if (err.code === "ENOENT") {
          console.warn(
            `Old image file not found, skipping deletion: ${oldImagePath}`
          );
        } else {
          console.error(
            `Failed to delete old product image: ${oldImagePath}`,
            err
          );
        }
      }
    }
    res.status(200).json(JSend.success({ product: updatedProduct }));
  } else {
    return next(new ApiError(404, "Product not found with the specified ID."));
  }
});

/**
 * Retrieves all products with filtering and pagination.
 */
const getAllProducts = catchAsync(async (req, res, _next) => {
  const filters = req.query;
  const { products, totalItems, currentPage, totalPages, limit } =
    await productService.getAllProducts(filters);
  res.status(200).json(
    JSend.success({
      products,
      metadata: {
        totalRecords: totalItems,
        currentPage,
        totalPages,
        limit,
      },
    })
  );
});

/**
 * Retrieves a single product by its ID.
 */
const getProductById = catchAsync(async (req, res, _next) => {
  const product = await productService.getProductById(req.params.id);
  if (!product)
    return _next(new ApiError(404, "Product not found with the specified ID."));
  res.status(200).json(JSend.success({ product }));
});

/**
 * Deletes a product by its ID and its associated image.
 */
const deleteProduct = catchAsync(async (req, res, _next) => {
  const productId = req.params.id;
  const product = await productService.getProductById(productId);

  if (product) {
    const deleted = await productService.deleteProduct(productId);
    if (!deleted) {
      return next(
        new ApiError(500, "Failed to delete product from the database.")
      );
    }
    // Delete the associated image file.
    if (
      product.image_url &&
      product.image_url.includes("/public/image/products/")
    ) {
      const imageFilePath = path.join(__dirname, "../..", product.image_url);
      try {
        await fs.unlink(imageFilePath);
      } catch (err) {
        if (err.code === "ENOENT") {
          console.warn(
            `Image file not found during product deletion, skipping: ${imageFilePath}`
          );
        } else {
          console.error(
            `Failed to delete product image file: ${imageFilePath}`,
            err
          );
        }
      }
    }
    res.status(204).send();
  } else {
    return _next(new ApiError(404, "Product not found with the specified ID."));
  }
});

/**
 * Deletes all products and their associated images.
 */
const deleteAllProducts = catchAsync(async (req, res, _next) => {
  const allProducts = await productService.getAllProducts({});
  const imagePathsToDelete = allProducts.products
    .filter(
      (p) => p.image_url && p.image_url.includes("/public/image/products/")
    )
    .map((p) => path.join(__dirname, "../..", p.image_url));

  await productService.deleteAllProducts();

  for (const filePath of imagePathsToDelete) {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      if (err.code === "ENOENT") {
        console.warn(
          `Image file not found during bulk deletion, skipping: ${filePath}`
        );
      } else {
        console.error(
          `Failed to delete product image during bulk deletion: ${filePath}`,
          err
        );
      }
    }
  }

  res.status(204).send();
});

module.exports = {
  createProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  deleteAllProducts,
};
