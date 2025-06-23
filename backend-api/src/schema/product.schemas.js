// ct313hm02-project-DrStone113/backend-api/src/schemas/product.schemas.js
const { z } = require('zod');

// Schema cho việc tạo/cập nhật sản phẩm
const productSchema = z.object({
  body: z.object({
    type: z.string().min(1, 'Product type is required'),
    name: z.string().min(1, 'Product name is required'),
    description: z.string().optional(),
    price: z.coerce.number().positive('Price must be a positive number'),
    stock: z.coerce.boolean(), // Sẽ chuyển đổi "true"/"false" từ form-data thành boolean
  }),
});

// Schema cho truy vấn sản phẩm (GET /api/v1/product)
const getProductQuerySchema = z.object({
  query: z.object({
    type: z.string().optional(),
    name: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    available: z.coerce.boolean().optional(), // Thêm filter available
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
});

// Schema cho tham số ID (GET/PUT/DELETE /api/v1/product/:id)
const productIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Product ID must be a positive integer'), // ID là serial (integer)
  }),
});

module.exports = {
  productSchema,
  getProductQuerySchema,
  productIdParamSchema,
};