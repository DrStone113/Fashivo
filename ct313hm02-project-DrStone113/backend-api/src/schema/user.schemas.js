// backend-api/src/schemas/user.schemas.js
const { z } = require('zod');

const createUserBodySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  address: z.string().optional(),
  phone: z.string().optional(), 
  role: z.enum(['admin', 'user']).default('user').optional(), 
  // avatarFile sẽ được xử lý riêng bằng Multer và không nằm trong schema này trực tiếp
});

const userSchema = z.object({
  body: createUserBodySchema,
});

const userIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('User ID must be a positive integer'),
  }),
});

const updateUserBodySchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  email: z.string().email('Invalid email address').min(1, 'Email cannot be empty').optional(),
  //password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'user']).optional(),
}).refine(data => Object.keys(data).length > 0, "At least one field must be provided for update"); 

const updateUserSchema = z.object({
  params: userIdParamSchema.shape.params, 
  body: updateUserBodySchema,
});

module.exports = {
  userSchema,
  userIdParamSchema,
  updateUserSchema,
};