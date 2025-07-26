const express = require("express");

const authController = require("../controllers/auth.controller");
const authSchemas = require("../schema/auth.schemas");
const { validate } = require("../middlewares/validator.middleware");
const { authenticate, restrictTo } = require("../middlewares/auth.middleware");
const { methodNotAllowed } = require("../controllers/errors.controller");
const multer = require("multer");
const { authLimiter } = require("../middlewares/rateLimit.middleware");

const router = express.Router();

// Multer configuration for avatar file uploads
// Ensure the public/avatars directory exists
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/avatars");
  },
  filename: (req, file, cb) => {
    // Use user ID if available (for profile updates), otherwise use a timestamp (for signups)
    const identifier = req.user ? `user-${req.user.id}` : `temp-${Date.now()}`;
    const ext = file.mimetype.split("/")[1];
    cb(null, `${identifier}-${Date.now()}.${ext}`);
  },
});

// Filter to allow only image uploads
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

module.exports.setup = (app) => {
  app.use("/api/v1/auth", router);

  // Unprotected routes (public)
  router
    .route("/signup")
    .post(
      authLimiter,
      upload.single("avatar"), // Allow uploading a single avatar file during signup
      validate(authSchemas.signupSchema),
      authController.signup
    )
    .all(methodNotAllowed);

  router
    .route("/login")
    .post(
      authLimiter,
      upload.none(),
      validate(authSchemas.loginSchema),
      authController.login
    )
    .all(methodNotAllowed);

  router
    .route("/forgot-password")
    .post(
      upload.none(),
      validate(authSchemas.forgotPasswordSchema),
      authController.forgotPassword
    )
    .all(methodNotAllowed);

  router
    .route("/reset-password/:token")
    .patch(
      upload.none(),
      validate(authSchemas.resetPasswordSchema),
      authController.resetPassword
    )
    .all(methodNotAllowed);

  // Logout route doesn't typically require authentication
  router.route("/logout").post(authController.logout).all(methodNotAllowed);

  // Protected routes (authenticate middleware will be applied to all routes below)
  router.use(authenticate);

  // Route to get and update (PATCH) the current user's information
  router
    .route("/me")
    .get(authController.getMe)
    .patch(
      upload.single("avatar"),
      validate(authSchemas.updateProfileSchema),
      authController.updateMe
    )
    .all(methodNotAllowed);

  // Route to update password (requires authentication)
  router
    .route("/update-password")
    .patch(
      upload.none(),
      validate(authSchemas.updatePasswordSchema),
      authController.updateMyPassword
    )
    .all(methodNotAllowed);
};
