const express = require("express");
const userController = require("../controllers/user.controller");
const userSchemas = require("../schema/user.schemas"); 
const { validate } = require("../middlewares/validator.middleware");
const { methodNotAllowed } = require("../controllers/errors.controller");
const multer = require("multer");
const ApiError = require("../api-error");

const router = express.Router();

// Multer setup for avatar uploads
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Corrected path for consistency. Ensure 'public/avatars' exists.
    cb(null, 'public/avatars');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `avatar-${uniqueSuffix}.${ext}`);
  }
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit for avatars
});

// ROUTES
module.exports.setup = (app) => {
  app.use("/api/v1/users", router);

  router.route("/")
    .get(validate(userSchemas.getUserQuerySchema), userController.getAllUsers)
    .post(
      upload.single("avatar"), // Expects field name 'avatar' for file upload
      validate(userSchemas.createUserSchema),
      userController.createUser
    )
    .delete(userController.deleteAllUsers);

  router.route("/:id")
    .get(validate(userSchemas.userIdParamSchema), userController.getUserById)
    .put( // Changed from PUT to PATCH for partial updates with updateUserSchema
      upload.single("avatar"), // Allow avatar update
      validate(userSchemas.updateUserSchema), // Validate both params (from schema) and body
      userController.updateUser
    )
    .delete(validate(userSchemas.userIdParamSchema), userController.deleteUser);

  router.all("/", methodNotAllowed);
  router.all("/:id", methodNotAllowed);
};