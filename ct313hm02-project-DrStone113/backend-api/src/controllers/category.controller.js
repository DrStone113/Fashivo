// ct313hm02-project-DrStone113/backend-api/src/controllers/category.controller.js
const JSend = require("../jsend"); 
const ApiError = require("../api-error"); 
const catchAsync = require("../catchAsync"); 
const categoryService = require("../services/category.service");

const createCategory = catchAsync(async (req, res, _next) => {
  let { name, url_path, description } = req.body;

  // Nếu url_path không được cung cấp, tự động tạo từ tên
  if (!url_path && name) {
    url_path = name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  } else if (url_path) {
    url_path = url_path.toLowerCase().trim(); 
  } else {
    return _next(new ApiError(400, "Category name or url_path is required to create a category."));
  }

  const categoryData = {
    name,
    url_path,
    description,
  };

  const newCategory = await categoryService.createCategory(categoryData);
  return res.status(201).json(JSend.success({ category: newCategory }));
});

const updateCategory = catchAsync(async (req, res, _next) => {
  const { id } = req.params; // ID đã được validate là số nguyên dương
  let { name, url_path, description } = req.body;

  // Xử lý url_path tương tự như tạo, nhưng chỉ khi nó được cung cấp
  if (url_path) {
    url_path = url_path.toLowerCase().trim();
  } else if (name && !url_path) { // Nếu tên được cập nhật nhưng url_path không được cung cấp, tạo lại slug từ tên mới
    url_path = name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (url_path !== undefined) updateData.url_path = url_path;
  if (description !== undefined) updateData.description = description;

  // Kiểm tra xem có dữ liệu để cập nhật không
  if (Object.keys(updateData).length === 0) {
    return _next(new ApiError(400, "No data provided for update."));
  }

  const updatedCategory = await categoryService.updateCategory(id, updateData);
  if (!updatedCategory) {
    return _next(new ApiError(404, "No category found with that ID to update"));
  }
  res.status(200).json(JSend.success({ category: updatedCategory }));
});

const getAllCategories = catchAsync(async (req, res, _next) => {
  const filters = req.query; // Query đã được validate bởi Zod
  const { categories, totalItems, currentPage, totalPages, limit } = await categoryService.getAllCategories(filters);
  res.status(200).json(JSend.success({
    categories,
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

const getCategoryById = catchAsync(async (req, res, _next) => {
  const category = await categoryService.getCategoryById(req.params.id);
  if (!category) return _next(new ApiError(404, "No category found with that ID"));
  res.status(200).json(JSend.success({ category }));
});

const deleteCategory = catchAsync(async (req, res, _next) => {
  const deleted = await categoryService.deleteCategory(req.params.id);
  if (!deleted) return _next(new ApiError(404, "No category found with that ID to delete"));
  res.status(204).json(JSend.success()); // 204 No Content, không có data trả về
});

const deleteAllCategories = catchAsync(async (req, res, _next) => {
  await categoryService.deleteAllCategories();
  res.status(204).json(JSend.success());
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  deleteAllCategories, 
};