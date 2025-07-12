// src/controllers/auth.controller.js
const JSend = require("../jsend");
const ApiError = require("../api-error");
const catchAsync = require("../catchAsync");
const authService = require("../services/auth.service");

// Đăng ký người dùng mới
const signup = catchAsync(async (req, res, _next) => {
  // Dữ liệu đã được Zod validate bởi signupSchema
  // Đã đổi từ username, email, password, fullname... thành name, email, password...
  const { name, email, password, address, phone, role } = req.body;

  // Gọi service để tạo người dùng
  const newUserWithoutPassword = await authService.registerUser({
    name, // Sử dụng 'name' để phù hợp với CSDL
    email,
    password,
    address,
    phone,
    role, // Vai trò sẽ được Zod schema mặc định là 'user' nếu không được cung cấp
  });

  // Tạo token cho người dùng mới đăng ký
  const token = authService.signToken(newUserWithoutPassword.id);

  res.status(201).json(JSend.success({
    user: newUserWithoutPassword,
    token,
    message: "Đăng ký thành công!"
  }));
});

// Đăng nhập người dùng (Không đổi)
const login = catchAsync(async (req, res, _next) => {
  const { email, password } = req.body;

  const { user, token } = await authService.loginUser(email, password);
  console.log('Generated Token:', token);

  res.status(200).json(JSend.success({
    user,
    token,
    message: "Đăng nhập thành công!"
  }));
});

// Lấy thông tin profile của người dùng hiện tại (đã được xác thực) (Không đổi)
const getMe = catchAsync(async (req, res, _next) => {
  const user = req.user;
  if (!user) {
    return _next(new ApiError(404, "Không tìm thấy thông tin người dùng."));
  }
  res.status(200).json(JSend.success({ user }));
});

// Cập nhật thông tin profile của người dùng hiện tại (Không đổi, vì updateData đã chứa 'name' từ schema)
const updateMe = catchAsync(async (req, res, _next) => {
    const userId = req.user.id;
    const updateData = req.body; // updateData sẽ chứa 'name' nếu được cung cấp

    const updatedUser = await authService.updateProfile(userId, updateData);

    res.status(200).json(JSend.success({
        user: updatedUser,
        message: "Cập nhật thông tin thành công!"
    }));
});

// Cập nhật mật khẩu của người dùng hiện tại (Không đổi)
const updateMyPassword = catchAsync(async (req, res, _next) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const updatedUser = await authService.updatePasswordForUser(userId, currentPassword, newPassword);

    res.status(200).json(JSend.success({
        user: updatedUser,
        message: "Cập nhật mật khẩu thành công!"
    }));
});

// Quên mật khẩu (Không đổi)
const forgotPassword = catchAsync(async (req, res, _next) => {
  const { email } = req.body;

  const resetToken = await authService.generatePasswordResetToken(email);

  res.status(200).json(JSend.success({
    message: 'Token đặt lại mật khẩu đã được gửi đến email của bạn!',
    resetToken // CHỈ NÊN GỬI TRONG DEV ĐỂ TEST, KHÔNG GỬI TRONG PRODUCTION
  }));
});

// Đặt lại mật khẩu (Không đổi)
const resetPassword = catchAsync(async (req, res, _next) => {
  const { token } = req.params;
  const { newPassword, confirmNewPassword } = req.body;

  if (newPassword !== confirmNewPassword) {
    return _next(new ApiError(400, 'Mật khẩu mới và xác nhận mật khẩu không khớp.'));
  }

  const { user, token: newToken } = await authService.resetPassword(token, newPassword);

  res.status(200).json(JSend.success({
    user,
    token: newToken,
    message: 'Đặt lại mật khẩu thành công!'
  }));
});

module.exports = {
  signup,
  login,
  getMe,
  updateMe,
  updateMyPassword,
  forgotPassword,
  resetPassword,
};