//backend-api\src\app.js
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
// Đảm bảo dotenv được load sớm nhất để các biến môi trường có sẵn
require('dotenv').config();

const JSend = require("./jsend");

// Import tất cả các router
const productRouter = require("./routes/product.router");
const userRouter = require("./routes/user.router"); // Lưu ý: `user.router` thường là để CRUD user bởi admin, còn auth.route.js là cho người dùng tự quản lý tài khoản của họ (signup, login, getMe, updateMe, updatePassword)
const categoryRouter = require("./routes/category.router");
const cartRouter = require("./routes/cart.router"); // Import cartRouter
const authRouter = require("./routes/auth.route"); // Import authRouter MỚI

const {
  resourceNotFound, // Middleware xử lý 404 (chưa tìm thấy tài nguyên)
  handleError,      // Middleware xử lý lỗi tập trung
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

// Các Middlewares toàn cục
app.use(cors());
app.use(express.json()); // Để xử lý application/json
app.use(express.urlencoded({ extended: true })); // Để xử lý application/x-www-form-urlencoded

// Multer xử lý multipart/form-data, nên không cần express.json() hay urlencoded cho loại này
// trên các ROUTE CÓ MULTER. Với các route khác, express.json() và urlencoded vẫn cần.

// Route gốc
app.get("/", (req, res) => {
  return res.json(JSend.success({ message: "Welcome to Fashivo API!" }));
});

// Setup Swagger UI
console.log('Attempting to setup Swagger UI for /api-docs...');
const swaggerOptions = {
  customCss: `
    body {
      font-family: 'Inter', 'Segoe UI', sans-serif;
      background: #f0f2f5;
      margin: 0;
    }

    /* Topbar */
    .swagger-ui .topbar {
      background: #0d47a1;
      padding: 10px 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .swagger-ui .topbar-wrapper img {
      content: url('https://cdn-icons-png.flaticon.com/512/3917/3917132.png'); /* logo API */
      width: 36px;
      height: auto;
      margin-right: 12px;
    }

    /* Title */
    .swagger-ui .info {
      background: white;
      padding: 24px;
      border-left: 5px solid #1565c0;
      margin: 20px auto;
      border-radius: 6px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }

    .swagger-ui .info hgroup h2 {
      font-size: 26px;
      color: #1a237e;
    }

    /* Tag sections (khung mỗi nhóm) */
    .swagger-ui .opblock-tag-section {
      background: white;
      margin-bottom: 30px;
      border-radius: 10px;
      padding: 20px 25px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.06);
      border-left: 5px solid #1976d2;
    }

    .swagger-ui .opblock-tag {
      font-size: 20px;
      font-weight: bold;
      color: #0d47a1;
      padding-bottom: 10px;
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 20px;
    }

    /* Border trái theo từng nhóm */
    .swagger-ui .opblock-tag-section[data-tag="product"] {
      border-left-color: #4caf50;
    }

    .swagger-ui .opblock-tag-section[data-tag="category"] {
      border-left-color: #fbc02d;
    }

    .swagger-ui .opblock-tag-section[data-tag="user"] {
      border-left-color: #2196f3;
    }
    
    .swagger-ui .opblock-tag-section[data-tag="auth"] { /* NEW: For Auth group */
      border-left-color: #7B1FA2; /* A nice purple for auth */
    }

    .swagger-ui .opblock-tag-section[data-tag="cart"] {
      border-left-color: #e53935;
    }

    /* Endpoint blocks */
    .swagger-ui .opblock {
      border-radius: 10px;
      margin-bottom: 15px;
      box-shadow: 0 1px 5px rgba(0,0,0,0.05);
    }

    .swagger-ui .opblock-summary {
      font-size: 15px;
      padding: 10px;
      font-weight: 600;
    }

    .swagger-ui .opblock.opblock-get {
      border-left: 6px solid #00b894;
      background: #e8f5f2;
    }

    .swagger-ui .opblock.opblock-post {
      border-left: 6px solid #0984e3;
      background: #e3f2fd;
    }

    .swagger-ui .opblock.opblock-put {
      border-left: 6px solid #f39c12;
      background: #fff8e1;
    }

    .swagger-ui .opblock.opblock-delete {
      border-left: 6px solid #d63031;
      background: #ffebee;
    }

    /* Execute button */
    .swagger-ui .btn.execute {
      background: #0d47a1;
      border-radius: 6px;
      padding: 8px 18px;
      font-weight: bold;
      transition: all 0.2s;
    }

    .swagger-ui .btn.execute:hover {
      background: #1565c0;
      transform: scale(1.03);
    }

    .swagger-ui .btn-group, .swagger-ui .btn {
      border-radius: 6px !important;
    }

    /* General text */
    .swagger-ui .parameter__name, .swagger-ui .response-col_status, .swagger-ui .model-title {
      font-weight: 500;
    }

    /* Markdown and spacing */
    .swagger-ui .markdown p {
      font-size: 15px;
      color: #333;
    }

    /* Scrollbar fix */
    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-thumb {
      background-color: #c5cae9;
      border-radius: 4px;
    }
  `,
  customSiteTitle: "🛍️ Fashivo API - Modern & Clean",
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
console.log('Swagger UI setup line executed.');

// Serve static files (e.g., product images)
app.use("/public", express.static("public"));

// Đăng ký các router
// Quan trọng: Auth router nên được đăng ký đầu tiên nếu bạn muốn xác thực hoạt động trước các route khác
authRouter.setup(app); // Setup Auth routes
productRouter.setup(app);
categoryRouter.setup(app);
cartRouter.setup(app); // Setup Cart routes

// Handle 404 error for unknown URL paths
app.use(resourceNotFound);

// Define the centralized error handling middleware, after all routes
// and middleware have been defined. This should be the LAST middleware.
app.use(handleError);

module.exports = app;