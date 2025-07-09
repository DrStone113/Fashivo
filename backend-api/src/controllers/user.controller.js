// backend-api/src/controllers/user.controller.js
const JSend = require("../jsend");
const ApiError = require("../api-error");
const catchAsync = require("../catchAsync");
const userService = require("../services/user.service");
const fs = require('fs').promises; // For file system operations
const path = require('path'); // For path manipulation


const createUser = catchAsync(async (req, res, _next) => {
  let avatarUrl = null;
  if (req.file) {
    avatarUrl = `/public/avatars/${req.file.filename}`;
  }

  const { name, email, password, address, phone, role } = req.body;

  const userData = {
    name, 
    email,
    password,
    address,
    phone, 
    role, 
    avatar_url: avatarUrl,
  };

  const newUser = await userService.createUser(userData);
  return res.status(201).json(JSend.success({ user: newUser }));
});

const updateUser = catchAsync(async (req, res, _next) => {
  const { id } = req.params; 
  const { name, email, password, address, phone, role } = req.body;

  let avatarUrl = undefined;
  let oldAvatarPath = null; // To store path of old avatar for deletion

  // If a new file is uploaded
  if (req.file) {
    avatarUrl = `/public/avatars/${req.file.filename}`; 
    // Fetch the existing user to get old avatar_url
    const existingUser = await userService.getUserById(id);
    if (existingUser && existingUser.avatar_url) {
      oldAvatarPath = path.join(__dirname, '../..', existingUser.avatar_url);
    }
  }

  const userData = {
    ...(name !== undefined && { name }), 
    ...(email !== undefined && { email }),
    ...(password !== undefined && { password }),
    ...(address !== undefined && { address }),
    ...(phone !== undefined && { phone }), 
    ...(role !== undefined && { role }), 
    ...(avatarUrl !== undefined && { avatar_url: avatarUrl }),
  };

  if (Object.keys(userData).length === 0 && !req.file) {
    return _next(new ApiError(400, "No data provided for update."));
  }

  const updatedUser = await userService.updateUser(id, userData);

  if (!updatedUser) {
    // If update failed, delete the newly uploaded file if any
    if (req.file) {
      await fs.unlink(req.file.path);
    }
    return _next(new ApiError(404, "No user found with that ID to update"));
  }

  // If update was successful and a new avatar was uploaded, delete the old one
  if (req.file && oldAvatarPath) {
    try {
      // Ensure the old avatar path points to a file that is not the default or a placeholder
      if (oldAvatarPath.includes('/public/avatars/avatar-')) { // Basic check for uploaded files
         await fs.unlink(oldAvatarPath);
      }
    } catch (err) {
      console.error(`Failed to delete old avatar file: ${oldAvatarPath}`, err);
    }
  }

  res.status(200).json(JSend.success({ user: updatedUser }));
});

const getAllUsers = catchAsync(async (req, res, _next) => {
  const filters = req.query; // Query has been validated and coerced by Zod
  const { users, totalItems, currentPage, totalPages, limit } = await userService.getAllUsers(filters);
  res.status(200).json(JSend.success({
    users,
    metadata: {
      totalRecords: totalItems,
      currentPage,
      totalPages,
      firstPage: 1,
      lastPage: totalPages,
      limit: limit
    }
  }));
});

const getUserById = catchAsync(async (req, res, _next) => {
  const user = await userService.getUserById(req.params.id); // req.params.id is already number
  if (!user) return _next(new ApiError(404, "No user found with that ID"));
  res.status(200).json(JSend.success({ user }));
});

const deleteUser = catchAsync(async (req, res, _next) => {
  const userId = req.params.id;
  const user = await userService.getUserById(userId);

  if (!user) {
    return _next(new ApiError(404, "No user found with that ID to delete"));
  }

  const deleted = await userService.deleteUser(userId);

  if (deleted) {
    // If user deleted and they had an avatar, delete the avatar file
    if (user.avatar_url && user.avatar_url.includes('/public/avatars/avatar-')) {
      const avatarFilePath = path.join(__dirname, '../..', user.avatar_url);
      try {
        await fs.unlink(avatarFilePath);
      } catch (err) {
        console.error(`Failed to delete user avatar file: ${avatarFilePath}`, err);
      }
    }
    res.status(204).json(JSend.success());
  } else {
    return _next(new ApiError(404, "No user found with that ID to delete"));
  }
});

const deleteAllUsers = catchAsync(async (req, res, _next) => {
    // Before deleting all users, get all their avatar paths to delete files
    const allUsers = await userService.getAllUsers({}); // Get all users without pagination/filters
    const avatarPathsToDelete = allUsers.users
        .filter(user => user.avatar_url && user.avatar_url.includes('/public/avatars/avatar-'))
        .map(user => path.join(__dirname, '../..', user.avatar_url));

    await userService.deleteAllUsers();

    // Delete all avatar files
    for (const filePath of avatarPathsToDelete) {
        try {
            await fs.unlink(filePath);
        } catch (err) {
            console.error(`Failed to delete avatar file during deleteAllUsers: ${filePath}`, err);
        }
    }

    res.status(204).json(JSend.success());
});

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  deleteAllUsers,
};