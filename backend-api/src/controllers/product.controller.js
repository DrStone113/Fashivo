//C:\DVWEB\mergre\ct313hm02-project-DrStone113\backend-api\src\controllers\product.controller.js
const JSend = require("../jsend");
const ApiError = require("../api-error");
const catchAsync = require("../catchAsync");
const productService = require("../services/product.service");
const categoryService = require("../services/category.service");
const fs = require('fs').promises; // For file system operations
const path = require('path'); // For path manipulation


const createProduct = catchAsync(async (req, res, _next) => {
    let image_url = null;
    if (req.file) {
        image_url = `/public/img/products/${req.file.filename}`;
    } else {
        // If an image is required for creation, enforce it here
        return _next(new ApiError(400, 'Product image is required!'));
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
            return _next(new ApiError(400, `Category with ID ${category_id} does not exist.`));
        }
    }

    const productData = {
        type,
        name,
        description,
        price,
        stock,
        available: stock > 0,
        image_url,
        category_id,
    };

    const newProduct = await productService.createProduct(productData);
    return res.status(201).json(JSend.success({ product: newProduct }));
});

const updateProduct = catchAsync(async (req, res, _next) => {
    const { id } = req.params; 
    const { type, name, description, price, stock, category_id, available: explicitAvailable } = req.body; 

    let image_url = undefined;
    let oldImagePath = null; 

    if (req.file) {
        image_url = `/public/img/products/${req.file.filename}`;
        // Fetch the existing product to get old image_url
        const existingProduct = await productService.getProductById(id);
        if (existingProduct && existingProduct.image_url) {
            oldImagePath = path.join(__dirname, '../..', existingProduct.image_url);
        }
    }

    // Kiểm tra sự tồn tại của category_id khi cập nhật
    if (category_id !== undefined && category_id !== null) {
        const categoryExists = await categoryService.getCategoryById(category_id);
        if (!categoryExists) {
            // Delete newly uploaded file if category does not exist
            if (req.file) {
                await fs.unlink(req.file.path);
            }
            return _next(new ApiError(400, `Category with ID ${category_id} does not exist.`));
        }
    }

    const productData = {};

    if (type !== undefined) productData.type = type;
    if (name !== undefined) productData.name = name;
    if (description !== undefined) productData.description = description;
    if (price !== undefined) productData.price = price;

    // Logic cho 'stock' và 'available'
    if (stock !== undefined) {
        productData.stock = stock;
        // Nếu stock được cập nhật, available tự động suy ra TỪ stock
        productData.available = stock > 0;
    }

    // Nếu 'available' được gửi đến một cách rõ ràng (explicitly), nó sẽ ghi đè logic suy ra từ stock
    // Điều này cho phép admin thủ công chuyển trạng thái 'available'
    if (explicitAvailable !== undefined) {
        productData.available = explicitAvailable;
    }

    if (image_url !== undefined) productData.image_url = image_url;
    if (category_id !== undefined) productData.category_id = category_id;


    // This check is still useful if the refine in schema is not perfectly catching empty body + no file
    if (Object.keys(productData).length === 0 && !req.file) {
        return _next(new ApiError(400, "No data provided for update."));
    }

    const updatedProduct = await productService.updateProduct(id, productData);
    if (!updatedProduct) {
        // If update failed, delete the newly uploaded file if any
        if (req.file) {
            await fs.unlink(req.file.path);
        }
        return _next(new ApiError(404, "No product found with that ID to update"));
    }

    // If update was successful and a new image was uploaded, delete the old one
    if (req.file && oldImagePath) {
        try {
            // Add a more robust check if some product images should never be deleted (e.g., default ones)
            if (oldImagePath.includes('/public/img/products/product-')) { // Basic check for uploaded files
                await fs.unlink(oldImagePath);
            }
        } catch (err) {
            console.error(`Failed to delete old product image file: ${oldImagePath}`, err);
        }
    }

    res.status(200).json(JSend.success({ product: updatedProduct }));
});

const getAllProducts = catchAsync(async (req, res, _next) => {
    const filters = req.query; // Query has been validated and coerced by Zod
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

    if (!product) {
        return _next(new ApiError(404, "No product found with that ID to delete"));
    }

    const deleted = await productService.deleteProduct(productId);

    if (deleted) {
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
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    deleteAllProducts,
};