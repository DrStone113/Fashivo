// ct313hm02-project-DrStone113/backend-api/src/middlewares/validator.middleware.js
const { ApiError } = require("../api-error"); // Import ApiError
const { z } = require('zod'); // Import Zod để xử lý ZodError

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Chuyển đổi ZodError thành một định dạng dễ đọc hơn
            const errors = error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message,
            }));
            return next(new ApiError(400, "Validation failed", { validationErrors: errors }));
        }
        // Các lỗi khác không phải ZodError
        next(error);
    }
};

module.exports = { validate };