// src/routes/auth.route.js

const express = require('express');
const authController = require('../controllers/auth.controller');
const authSchemas = require('../schema/auth.schemas');
const { validate } = require('../middlewares/validator.middleware');
const { authenticate, restrictTo } = require('../middlewares/auth.middleware'); // <-- Đổi tên authenticate
const { methodNotAllowed } = require("../controllers/errors.controller");
const multer = require('multer');
const { authLimiter } = require('../middlewares/rateLimit.middleware');

const router = express.Router();
const upload = multer(); // Khởi tạo multer để xử lý các trường text từ form-data

module.exports.setup = (app) => {
  app.use('/api/v1/auth', router);

  router.route('/signup')
    .post(
      authLimiter,
      upload.none(), // Chỉ xử lý các trường text, không có file
      validate(authSchemas.signupSchema),
      authController.signup
    )
    .all(methodNotAllowed); // Ngăn chặn các phương thức khác

  router.route('/login')
    .post(
      authLimiter,
      upload.none(),
      validate(authSchemas.loginSchema),
      authController.login
    )
    .all(methodNotAllowed);

  // Route để lấy thông tin của chính mình (cần xác thực)
  router.route('/me')
    .get(
      authenticate, // Yêu cầu xác thực
      authController.getMe
    )
    .put( // Nếu bạn cho phép cập nhật profile bằng PUT
        authenticate,
        upload.none(),
        validate(authSchemas.updateProfileSchema),
        authController.updateMe
    )
    .all(methodNotAllowed);

  // Route cập nhật mật khẩu (cần xác thực)
  router.route('/update-password') // Đổi tên cho rõ ràng hơn so với /updateMyPassword trong Controller
    .put(
        authenticate,
        upload.none(),
        validate(authSchemas.updatePasswordSchema),
        authController.updateMyPassword
    )
    .all(methodNotAllowed);

  // Route quên mật khẩu và đặt lại mật khẩu
  router.route('/forgot-password')
    .post(
      upload.none(),
      validate(authSchemas.forgotPasswordSchema), // Cần tạo schema này
      authController.forgotPassword
    )
    .all(methodNotAllowed);

  router.route('/reset-password/:token')
    .patch( // Hoặc PUT
      upload.none(),
      validate(authSchemas.resetPasswordSchema), // Cần tạo schema này
      authController.resetPassword
    )
    .all(methodNotAllowed);

  // Ví dụ deleteMe (user tự xóa tài khoản)
  // router.route('/deleteMe')
  //   .delete(
  //     authenticate,
  //     authController.deleteMe // Cần triển khai deleteMe trong authController
  //   )
  //   .all(methodNotAllowed);
};