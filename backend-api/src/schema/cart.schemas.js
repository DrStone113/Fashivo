//C:\DVWEB\mergre\ct313hm02-project-DrStone113\backend-api\src\schema\cart.schemas.js
const { z } = require('zod');

// Schema cho một mục trong giỏ hàng (khi nhận từ request body)
const cartItemSchema = z.object({
  product_id: z.coerce.number().int().positive('Product ID must be a positive integer'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
});

// Schema cho việc tạo giỏ hàng hoặc thêm/cập nhật các mục (sử dụng trong POST)
// user_id và items sẽ được gửi dưới dạng multipart/form-data
// items sẽ là một chuỗi JSON của mảng các đối tượng cartItemSchema
const createCartSchema = z.object({
  body: z.object({
    user_id: z.coerce.number().int().positive('User ID must be a positive integer'),
    // items được mong đợi là một chuỗi JSON của mảng cartItemSchema
    items: z.string().transform((str, ctx) => {
      try {
        const parsed = JSON.parse(str);
        // Validate each item in the parsed array against cartItemSchema
        if (!Array.isArray(parsed)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Items must be a JSON string representing an array.',
          });
          return z.NEVER;
        }
        for (const item of parsed) {
          cartItemSchema.parse(item); // Validate each item
        }
        return parsed;
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid JSON string for items or invalid item structure.',
        });
        return z.NEVER;
      }
    }).pipe(z.array(cartItemSchema).min(1, 'At least one item is required for the cart')),
  }),
});

// Schema cho việc cập nhật số lượng của một mục cụ thể trong giỏ hàng (PUT /:id/item/:productId)
const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  }),
});

// Schema cho tham số ID giỏ hàng (GET/PUT/DELETE /api/v1/carts/:id)
const cartIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Cart ID must be a positive integer'),
});

// Schema cho tham số User ID (GET /api/v1/carts/user/:userId)
const userIdParamSchema = z.object({
  userId: z.coerce.number().int().positive('User ID must be a positive integer'),
});

// Schema cho truy vấn giỏ hàng (GET /api/v1/carts)
const getCartQuerySchema = z.object({
  query: z.object({
    user_id: z.coerce.number().int().positive('User ID must be a positive integer').optional(),
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
  }),
});

module.exports = {
  cartItemSchema,
  createCartSchema,
  updateCartItemSchema,
  cartIdParamSchema,
  userIdParamSchema,
  getCartQuerySchema,
};
