// ct313hm02-project-DrStone113/backend-api/src/app.js
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const JSend = require("./jsend");
const productRouter = require("./routes/product.router");
const userRouter = require("./routes/user.router");
const categoryRouter = require("./routes/category.router");

const {
  resourceNotFound,
  handleError,
} = require("./controllers/errors.controller"); 
let swaggerDocument;
try {
  swaggerDocument = require("../docs/openapiSpec.json");
  console.log('Swagger document loaded successfully.');
  console.log('Swagger document info title:', swaggerDocument.info.title);
} catch (error) {
  console.error('Failed to load swagger document:', error);
  swaggerDocument = {};
}

const app = express();

app.use(cors());
app.use(express.json()); // Để xử lý application/json
app.use(express.urlencoded({ extended: true })); // Để xử lý application/x-www-form-urlencoded

// Multer xử lý multipart/form-data, nên không cần express.json() hay urlencoded cho loại này

app.get("/", (req, res) => {
  return res.json(JSend.success({ message: "Welcome to Fashivo API!" }));
});

console.log('Attempting to setup Swagger UI for /api-docs...');
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
console.log('Swagger UI setup line executed.');

app.use("/public", express.static("public")); // Để phục vụ ảnh đã upload

productRouter.setup(app); // Gọi hàm setup của router
userRouter.setup(app);
categoryRouter.setup(app);

// Handle 404 error for unknown URL paths
app.use(resourceNotFound);

// Define the centralized error handling middleware, after all routes
// and middleware have been defined
app.use(handleError);

module.exports = app;