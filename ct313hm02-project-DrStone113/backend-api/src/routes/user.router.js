// backend-api/src/routes/user.router.js
const express = require('express');
const userController = require('../controllers/user.controller');
const { userSchema, userIdParamSchema, updateUserSchema } = require("../schemas/user.schemas"); 
const validate = require("../middlewares/validator.middleware"); 
const multer = require("multer");

// Cấu hình Multer để lưu trữ ảnh avatar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/avatars/"); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

const router = express.Router();

router.post(
  "/",
  upload.single("avatarFile"), 
  validate(userSchema), 
  userController.createUser
);

router.get(
  "/",
  userController.getAllUsers
);

router.get(
  "/:id",
  validate(userIdParamSchema),
  userController.getUserById
);

router.put(
  "/:id",
  upload.single("avatarFile"), 
  validate(updateUserSchema), 
  userController.updateUser
);

router.delete(
  "/:id",
  validate(userIdParamSchema),
  userController.deleteUser
);

exports.setup = (app) => {
  app.use("/api/v1/users", router); 
};