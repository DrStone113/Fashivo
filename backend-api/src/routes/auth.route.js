// src/routes/auth.route.js

const express = require('express');
const authController = require('../controllers/auth.controller');
const authSchemas = require('../schema/auth.schemas');
const { validate } = require('../middlewares/validator.middleware');
const { authenticate, restrictTo } = require('../middlewares/auth.middleware');
const { methodNotAllowed } = require("../controllers/errors.controller");
const multer = require('multer'); // Import multer
const { authLimiter } = require('../middlewares/rateLimit.middleware');

const router = express.Router();

// Cấu hình Multer cho việc upload file avatar
// Đảm bảo thư mục public/img/users tồn tại
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users'); 
  },
  filename: (req, file, cb) => {
    // req.user.id sẽ có sẵn nếu middleware authenticate được áp dụng trước Multer
    // Nếu không có authenticate, bạn cần một cách khác để tạo tên file duy nhất
    const userId = req.user ? req.user.id : 'unknown'; // Fallback nếu không có user
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${userId}-${Date.now()}.${ext}`);
  }
});

// Filter để chỉ cho phép upload ảnh
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh!'), false);
  }
};

const upload = multer({ 
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn kích thước file 5MB
});


module.exports.setup = (app) => {
  app.use('/api/v1/auth', router);

  // Routes không cần bảo vệ (public routes)
  router.route('/signup')
    .post(
      authLimiter,
      upload.none(), // Chỉ xử lý các trường text, không có file
      validate(authSchemas.signupSchema),
      authController.signup
    )
    .all(methodNotAllowed);

  router.route('/login')
    .post(
      authLimiter,
      upload.none(),
      validate(authSchemas.loginSchema),
      authController.login
    )
    .all(methodNotAllowed);

  router.route('/forgot-password')
    .post(
      upload.none(),
      validate(authSchemas.forgotPasswordSchema), 
      authController.forgotPassword
    )
    .all(methodNotAllowed);

  router.route('/reset-password/:token')
    .patch( 
      upload.none(),
      validate(authSchemas.resetPasswordSchema), 
      authController.resetPassword
    )
    .all(methodNotAllowed);

  // Route logout không cần xác thực (thường là vậy)
  router.route('/logout')
    .post(authController.logout) // Không cần authenticate ở đây
    .all(methodNotAllowed);

  // Routes cần bảo vệ (authenticate middleware sẽ được áp dụng cho tất cả các route bên dưới)
  // Đặt authenticate ở đây để nó chỉ áp dụng cho các route sau nó
  router.use(authenticate); 

  // Route để lấy thông tin của chính mình và CẬP NHẬT (PATCH)
  router.route('/me')
    .get(authController.getMe)
    .patch( 
      upload.single('avatar'), // Xử lý file avatar, tên trường là 'avatar'
      validate(authSchemas.updateProfileSchema), // Validate body, không bao gồm file
      authController.updateMe
    )
    .all(methodNotAllowed);

  // Route cập nhật mật khẩu (cần xác thực)
  router.route('/update-password') 
    .patch( 
      upload.none(),
      validate(authSchemas.updatePasswordSchema),
      authController.updateMyPassword
    )
    .all(methodNotAllowed);
};
