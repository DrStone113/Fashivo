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
app.use(express.json()); // Để xử lý application/json (cho các route khác không dùng multipart)
app.use(express.urlencoded({ extended: true })); // Để xử lý application/x-www-form-urlencoded (cho các route khác không dùng multipart)

// Multer xử lý multipart/form-data, nên không cần express.json() hay urlencoded cho loại này TRÊN CÁC ROUTE CÓ MULTER

app.get("/", (req, res) => {
  return res.json(JSend.success({ message: "Welcome to Fashivo API!" }));
});

console.log('Attempting to setup Swagger UI for /api-docs...');
//app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
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