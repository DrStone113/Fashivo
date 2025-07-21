//C:\DVWEB\mergre\ct313hm02-project-DrStone113\backend-api\src\controllers\product.controller.js
const JSend = require("../jsend");
const ApiError = require("../api-error");
const catchAsync = require("../catchAsync");
const productService = require("../services/product.service");
const categoryService = require("../services/category.service");
const fs = require('fs').promises; // For file system operations
const path = require('path'); // For path manipulation


const createProduct = catchAsync(async (req, res, next) => { // Thêm 'next'
    let image_url = null;
    if (req.file) {
        image_url = `/public/img/products/${req.file.filename}`;
    } else {
        // If an image is required for creation, enforce it here
        return next(new ApiError(400, 'Product image is required!'));
    }

    // Zod has already coerced and validated these fields
    const { type, name, description, price, stock, category_id } = req.body;

    // Kiểm tra sự tồn tại của category_id (tùy chọn, DB Foreign Key cũng sẽ kiểm tra)
    if (category_id !== undefined && category_id !== null) {
        const categoryExists = await categoryService.getCategoryById(category_id);
        if (!categoryExists) {
            // Delete uploaded file if category does not exist
            if (req.file) {
                await fs.unlink(req.file.path);
            }
            return next(new ApiError(404, "Category not found.")); // Sử dụng next
        }
    }

    const productData = {
        type,
        name,
        description,
        price,
        stock,
        available: true, // Mặc định là có sẵn khi tạo
        image_url,
        category_id,
    };

    const newProduct = await productService.createProduct(productData);
    return res.status(201).json(JSend.success({ product: newProduct }));
});

const updateProduct = catchAsync(async (req, res, next) => { // Thêm 'next'
    const { id } = req.params;
    let image_url = undefined; // Use undefined to not update if no new file
    let oldImagePath = null;

    if (req.file) {
        image_url = `/public/img/products/${req.file.filename}`;
        // Get old product to delete old image
        const oldProduct = await productService.getProductById(id);
        if (oldProduct && oldProduct.image_url && oldProduct.image_url.includes('/public/img/products/product-')) {
            oldImagePath = path.join(__dirname, '../..', oldProduct.image_url);
        }
    }

    const { type, name, description, price, stock, available, category_id } = req.body;

    const updateData = {
        type,
        name,
        description,
        price,
        stock,
        available,
        image_url, // This will be undefined if no new file, or new path
        category_id,
    };

    // Remove undefined fields so they don't overwrite existing data with undefined
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // Check if category_id exists if it's being updated
    if (updateData.category_id !== undefined && updateData.category_id !== null) {
        const categoryExists = await categoryService.getCategoryById(updateData.category_id);
        if (!categoryExists) {
            // Delete newly uploaded file if category does not exist
            if (req.file) {
                await fs.unlink(req.file.path);
            }
            return next(new ApiError(404, "Category not found.")); // Sử dụng next
        }
    }

    const updatedProduct = await productService.updateProduct(id, updateData);

    if (updatedProduct) {
        // Delete old image file after successful update
        if (oldImagePath) {
            try {
                await fs.unlink(oldImagePath);
            } catch (err) {
                console.error(`Failed to delete old product image file: ${oldImagePath}`, err);
            }
        }
        res.status(200).json(JSend.success({ product: updatedProduct }));
    } else {
        return next(new ApiError(404, "No product found with that ID to update")); // Sử dụng next
    }
});

const getAllProducts = catchAsync(async (req, res, _next) => {
    const filters = req.query; // Query đã được validate và coerced bởi Zod
    const { products, totalItems, currentPage, totalPages, limit } = await productService.getAllProducts(filters);
    res.status(200).json(JSend.success({
        products,
        metadata: {
            totalRecords: totalItems,
            currentPage,
            totalPages,
            firstPage: 1,
            lastPage: totalPages,
            limit: limit
        }
    }));
});

const getProductById = catchAsync(async (req, res, _next) => {
    const product = await productService.getProductById(req.params.id); 
    if (!product) return _next(new ApiError(404, "No product found with that ID"));
    res.status(200).json(JSend.success({ product }));
});

const deleteProduct = catchAsync(async (req, res, _next) => {
    const productId = req.params.id;
    const product = await productService.getProductById(productId);

    if (product) {
        const deleted = await productService.deleteProduct(productId);
        if (!deleted) {
            return _next(new ApiError(500, "Failed to delete product from database."));
        }
        // If product deleted and it had an image, delete the image file
        if (product.image_url && product.image_url.includes('/public/img/products/product-')) {
            const imageFilePath = path.join(__dirname, '../..', product.image_url);
            try {
                await fs.unlink(imageFilePath);
            } catch (err) {
                console.error(`Failed to delete product image file: ${imageFilePath}`, err);
            }
        }
        res.status(204).json(JSend.success());
    } else {
        return _next(new ApiError(404, "No product found with that ID to delete"));
    }
});

const deleteAllProducts = catchAsync(async (req, res, _next) => {
    // Before deleting all products, get all their image paths to delete files
    const allProducts = await productService.getAllProducts({}); // Get all products without pagination/filters
    const imagePathsToDelete = allProducts.products
        .filter(product => product.image_url && product.image_url.includes('/public/img/products/product-'))
        .map(product => path.join(__dirname, '../..', product.image_url));

    await productService.deleteAllProducts();

    // Delete all image files
    for (const filePath of imagePathsToDelete) {
        try {
            await fs.unlink(filePath);
        } catch (err) {
            console.error(`Failed to delete product image file during deleteAllProducts: ${filePath}`, err);
        }
    }

    res.status(204).json(JSend.success());
});

module.exports = {
    createProduct,
    updateProduct,
    getAllProducts,
    getProductById,
    deleteProduct,
    deleteAllProducts
};
