const jwt = require("jsonwebtoken");
const ApiError = require("../api-error");
const catchAsync = require("../catchAsync");
const authService = require("../services/auth.service");

/**
 * Middleware to authenticate users based on a JWT token.
 */
const authenticate = catchAsync(async (req, res, next) => {
  // 1. Get token from the Authorization header.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ApiError(401, "You are not logged in. Please log in to get access.")
    );
  }

  // 2. Verify the token.
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3. Find the user from the ID in the token.
  const currentUser = await authService.findUserById(decoded.id);

  if (!currentUser) {
    return next(
      new ApiError(401, "The user belonging to this token no longer exists.")
    );
  }

  // 4. Attach the user to the request object for subsequent middleware/controllers.
  // Ensure the password is not attached to req.user.
  const { password, ...userWithoutPassword } = currentUser;
  req.user = userWithoutPassword;
  next();
});

/**
 * Middleware to restrict access to certain roles (Role-Based Access Control).
 * @param {...string} roles - An array of roles that are allowed access (e.g., 'admin', 'user').
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is available from the 'authenticate' middleware.
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return next(
        new ApiError(403, "You do not have permission to perform this action.")
      );
    }
    next();
  };
};

module.exports = {
  authenticate,
  restrictTo,
};
