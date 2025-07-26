const JSend = require("../jsend");

const ApiError = require("../api-error");
const catchAsync = require("../catchAsync");
const authService = require("../services/auth.service");

// Register a new user
const signup = catchAsync(async (req, res, _next) => {
  const { name, email, password, address, phone, role } = req.body;
  const userData = { name, email, password, address, phone, role };

  // Handle avatar file if present during signup
  if (req.file) {
    userData.avatar_url = `/public/avatars/${req.file.filename}`;
  }

  const newUserWithoutPassword = await authService.registerUser(userData);

  const token = authService.signToken(newUserWithoutPassword.id);

  res.status(201).json(
    JSend.success({
      user: newUserWithoutPassword,
      token,
      message: "Signup successful!",
    })
  );
});

// Log in a user
const login = catchAsync(async (req, res, _next) => {
  const { email, password } = req.body;

  const { user, token } = await authService.loginUser(email, password);

  res.status(200).json(
    JSend.success({
      user,
      token,
      message: "Login successful!",
    })
  );
});

// Get the profile of the current user
const getMe = catchAsync(async (req, res, _next) => {
  const user = req.user;
  if (!user) {
    return _next(new ApiError(404, "User information not found."));
  }
  res.status(200).json(JSend.success({ user }));
});

// Update the profile of the current user
const updateMe = catchAsync(async (req, res, _next) => {
  const userId = req.user.id;
  const updateData = { ...req.body };

  // Remove avatarFile field from updateData if it exists in req.body
  if (updateData.avatarFile) {
    delete updateData.avatarFile;
  }

  // Handle avatar file if present
  if (req.file) {
    updateData.avatar_url = `/public/avatars/${req.file.filename}`;
  } else if (updateData.avatar_url === "/public/image/products/BLANK.jpg.png") {
    // If the frontend sends a BLANK avatar_url (user removed or didn't select an image)
    // and the user's current avatar is not the BLANK one, set avatar_url to null
    // to delete the old avatar from the database.
    if (
      req.user.avatar_url &&
      req.user.avatar_url !== "/public/image/products/BLANK.jpg.png"
    ) {
      updateData.avatar_url = null;
    }
  }

  const updatedUser = await authService.updateProfile(userId, updateData);

  res.status(200).json(
    JSend.success({
      user: updatedUser,
      message: "Profile updated successfully!",
    })
  );
});

// Update the current user's password
const updateMyPassword = catchAsync(async (req, res, _next) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  const updatedUser = await authService.updatePasswordForUser(
    userId,
    currentPassword,
    newPassword
  );

  res.status(200).json(
    JSend.success({
      user: updatedUser,
      message: "Password updated successfully!",
    })
  );
});

// Forgot password
const forgotPassword = catchAsync(async (req, res, _next) => {
  const { email } = req.body;

  const resetToken = await authService.generatePasswordResetToken(email);

  res.status(200).json(
    JSend.success({
      message: "Password reset token has been sent to your email!",
      resetToken,
    })
  );
});

// Reset password
const resetPassword = catchAsync(async (req, res, _next) => {
  const { token } = req.params;
  const { newPassword, confirmNewPassword } = req.body;

  if (newPassword !== confirmNewPassword) {
    return _next(
      new ApiError(400, "New password and confirmation do not match.")
    );
  }

  const { user, token: newToken } = await authService.resetPassword(
    token,
    newPassword
  );

  res.status(200).json(
    JSend.success({
      user,
      token: newToken,
      message: "Password reset successful!",
    })
  );
});

// Log out user
const logout = catchAsync(async (req, res, _next) => {
  res.status(200).json(JSend.success({ message: "Logout successful!" }));
});

module.exports = {
  signup,
  login,
  getMe,
  updateMe,
  updateMyPassword,
  forgotPassword,
  resetPassword,
  logout,
};
