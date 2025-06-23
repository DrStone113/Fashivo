const { z } = require('zod');

// Schema cho việc tạo/cập nhật danh mục
// Đây là schema cho TRỰC TIẾP req.body sau khi multer đã xử lý
const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name cannot be more than 100 characters'),
  url_path: z.string().max(100, 'URL path cannot be more than 100 characters').toLowerCase().trim().optional().nullable(), // url_path có thể là null hoặc undefined nếu không cung cấp
  description: z.string().max(500, 'Category description cannot be more than 500 characters').optional().nullable(),
});

// Schema cho truy vấn danh mục (GET /api/v1/categories)
const getCategoryQuerySchema = z.object({
  query: z.object({
    name: z.string().optional(), // Lọc theo tên danh mục
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
});

// Schema cho tham số ID (GET/PUT/DELETE /api/v1/categories/:id)
const categoryIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Category ID must be a positive integer'), // ID là serial (integer)
  }),
});

module.exports = {
  categorySchema,
  getCategoryQuerySchema,
  categoryIdParamSchema,
};