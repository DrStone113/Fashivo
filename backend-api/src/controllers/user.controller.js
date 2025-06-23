// backend-api/src/controllers/user.controller.js
const JSend = require('../jsend');
const ApiError = require('../api-error');
const catchAsync = require('../catchAsync');
const userService = require('../services/user.service'); 

const createUser = catchAsync(async (req, res, next) => {
  const { name, email, address, phone, role } = req.body; 
  const avatarFile = req.file;

  if (!name || !email) { 
    throw new ApiError(400, "Name and email are required.");
  }

  const existingUser = await userService.getUserByEmail(email);
  if (existingUser) {
    throw new ApiError(409, "Email already exists.");
  }

  let avatarUrl = null;
  if (avatarFile) {
    avatarUrl = `/public/uploads/${avatarFile.filename}`; // Lưu URL ảnh avatar
  }

  const newUserData = {
    name,
    email,
    address,
    phone,
    role,
    avatar_url: avatarUrl,
  };

  const newUser = await userService.createUser(newUserData);
  res.status(201).json(JSend.success({ user: newUser }));
});

const getAllUsers = catchAsync(async (req, res, next) => {
  const filters = req.query;
  const users = await userService.getAllUsers(filters);
  return res.json(JSend.success({ users }));
});

const getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res.json(JSend.success({ user }));
});

const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedData = req.body;
  const avatarFile = req.file;

  if (avatarFile) {
    updatedData.avatar_url = `/public/uploads/${avatarFile.filename}`;
  }

  const updatedUser = await userService.updateUser(id, updatedData);
  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }
  return res.json(JSend.success({ user: updatedUser }));
});

const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deletedCount = await userService.deleteUser(id);
  if (deletedCount === 0) {
    throw new ApiError(404, "User not found");
  }
  return res.json(JSend.success({ message: "User deleted successfully" }));
});

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};