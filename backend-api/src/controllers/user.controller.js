const JSend = require("../jsend");
const ApiError = require("../api-error");
const catchAsync = require("../catchAsync");
const userService = require("../services/user.service");
const fs = require("fs").promises;
const path = require("path");

/**
 * Creates a new user. (Admin)
 */
const createUser = catchAsync(async (req, res, next) => {
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

/**
 * Updates an existing user. (Admin)
 */
const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, password, address, phone, role } = req.body;

  let avatarUrl = undefined;
  let oldAvatarPath = null;

  // If a new avatar is uploaded, prepare to update the path and delete the old one.
  if (req.file) {
    avatarUrl = `/public/avatars/${req.file.filename}`;
    const oldUser = await userService.getUserById(id);
    if (
      oldUser &&
      oldUser.avatar_url &&
      oldUser.avatar_url.includes("/public/avatars/")
    ) {
      oldAvatarPath = path.join(__dirname, "../..", oldUser.avatar_url);
    }
  }

  const updateData = {
    name,
    email,
    password,
    address,
    phone,
    role,
    avatar_url: avatarUrl,
  };

  // Remove undefined fields to avoid overwriting existing data.
  Object.keys(updateData).forEach(
    (key) => updateData[key] === undefined && delete updateData[key]
  );

  const updatedUser = await userService.updateUser(id, updateData);

  if (updatedUser) {
    // If the update was successful, delete the old avatar file.
    if (oldAvatarPath) {
      try {
        await fs.unlink(oldAvatarPath);
      } catch (err) {
        console.warn(
          `Failed to delete old user avatar file: ${oldAvatarPath}`,
          err
        );
      }
    }
    res.status(200).json(JSend.success({ user: updatedUser }));
  } else {
    return next(new ApiError(404, "User not found with the specified ID."));
  }
});

/**
 * Retrieves all users with filtering and pagination. (Admin)
 */
const getAllUsers = catchAsync(async (req, res, _next) => {
  const filters = req.query;
  const { users, totalItems, currentPage, totalPages, limit } =
    await userService.getAllUsers(filters);
  res.status(200).json(
    JSend.success({
      users,
      metadata: {
        totalItems,
        currentPage,
        totalPages,
        limit,
      },
    })
  );
});

/**
 * Retrieves a single user by their ID. (Admin)
 */
const getUserById = catchAsync(async (req, res, _next) => {
  const user = await userService.getUserById(req.params.id);
  if (!user)
    return _next(new ApiError(404, "User not found with the specified ID."));
  res.status(200).json(JSend.success({ user }));
});

/**
 * Deletes a user by their ID and their associated avatar. (Admin)
 */
const deleteUser = catchAsync(async (req, res, _next) => {
  const userId = req.params.id;
  const user = await userService.getUserById(userId);

  if (user) {
    const deleted = await userService.deleteUser(userId);
    if (!deleted) {
      return _next(
        new ApiError(500, "Failed to delete user from the database.")
      );
    }
    // If user is deleted and had an avatar, delete the avatar file.
    if (user.avatar_url && user.avatar_url.includes("/public/avatars/")) {
      const avatarFilePath = path.join(__dirname, "../..", user.avatar_url);
      try {
        await fs.unlink(avatarFilePath);
      } catch (err) {
        console.warn(
          `Failed to delete user avatar file: ${avatarFilePath}`,
          err
        );
      }
    }
    res.status(204).send();
  } else {
    return _next(new ApiError(404, "User not found with the specified ID."));
  }
});

/**
 * Deletes all users and their associated avatars. (Admin)
 */
const deleteAllUsers = catchAsync(async (req, res, _next) => {
  const allUsers = await userService.getAllUsers({});
  const avatarPathsToDelete = allUsers.users
    .filter(
      (user) => user.avatar_url && user.avatar_url.includes("/public/avatars/")
    )
    .map((user) => path.join(__dirname, "../..", user.avatar_url));

  await userService.deleteAllUsers();

  for (const filePath of avatarPathsToDelete) {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.warn(
        `Failed to delete avatar file during bulk deletion: ${filePath}`,
        err
      );
    }
  }

  res.status(204).send();
});

module.exports = {
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser,
  deleteAllUsers,
};
