// ct313hm02-project-DrStone113/backend-api/src/controllers/product.controller.js
const JSend = require("../jsend");
const ApiError = require("../api-error");
const catchAsync = require("../catchAsync"); 
const productService = require("../services/product.service");
const categoryService = require("../services/category.service");


const createProduct = catchAsync(async (req, res, _next) => {
    let image_url = null;
    if (req.file) {
        image_url = `/public/img/products/${req.file.filename}`; 
    } else {
        return _next(new ApiError(400, 'Product image is required!'));
    }

    const { type, name, description, price, stock, category_id } = req.body;

    // Kiểm tra sự tồn tại của category_id (tùy chọn, DB Foreign Key cũng sẽ kiểm tra)
    if (category_id !== undefined && category_id !== null) {
        const categoryExists = await categoryService.getCategoryById(category_id);
        if (!categoryExists) {
            return _next(new ApiError(400, `Category with ID ${category_id} does not exist.`));
        }
    }

    const productData = {
        type,
        name,
        description,
        price,
        available: stock, 
        image_url,
        category_id,
    };

    const newProduct = await productService.createProduct(productData);
    return res.status(201).json(JSend.success({ product: newProduct }));
});

const updateProduct = catchAsync(async (req, res, _next) => {
    const { id } = req.params;
    const { type, name, description, price, stock, category_id } = req.body;

    let image_url = undefined;
    if (req.file) {
        image_url = `/public/img/products/${req.file.filename}`; 
        // TODO: Logic xóa ảnh cũ nếu có
    }

    // Kiểm tra sự tồn tại của category_id khi cập nhật
    if (category_id !== undefined && category_id !== null) {
        const categoryExists = await categoryService.getCategoryById(category_id);
        if (!categoryExists) {
            return _next(new ApiError(400, `Category with ID ${category_id} does not exist.`));
        }
    }

    const productData = {
        ...(type !== undefined && { type }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(stock !== undefined && { available: stock }), 
        ...(image_url !== undefined && { image_url }),
        ...(category_id !== undefined && { category_id })
    };

    // Kiểm tra xem có dữ liệu để cập nhật không
    if (Object.keys(productData).length === 0) {
        return _next(new ApiError(400, "No data provided for update."));
    }

    const updatedProduct = await productService.updateProduct(id, productData);
    if (!updatedProduct) {
        return _next(new ApiError(404, "No product found with that ID to update"));
    }
    res.status(200).json(JSend.success({ product: updatedProduct }));
});

const getAllProducts = catchAsync(async (req, res, _next) => {
    const filters = req.query; // Query đã được validate bởi Zod
    const { products, totalItems, currentPage, totalPages } = await productService.getAllProducts(filters);
    res.status(200).json(JSend.success({
        products,
        metadata: {
            totalRecords: totalItems,
            currentPage,
            totalPages,
            firstPage: 1, // Knex pagination có thể tự tính
            lastPage: totalPages,
            limit: filters.limit // Lấy limit từ filters
        }
    }));
});


const getProductById = catchAsync(async (req, res, _next) => {
    const product = await productService.getProductById(req.params.id); // req.params.id đã là số nguyên
    if (!product) return _next(new ApiError(404, "No product found with that ID"));
    res.status(200).json(JSend.success({ product }));
});

const deleteProduct = catchAsync(async (req, res, _next) => {
    const deleted = await productService.deleteProduct(req.params.id); // req.params.id đã là số nguyên
    if (!deleted) return _next(new ApiError(404, "No product found with that ID to delete"));
    res.status(204).json(JSend.success());
});

const deleteAllProducts = catchAsync(async (req, res, _next) => {
    await productService.deleteAllProducts();
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