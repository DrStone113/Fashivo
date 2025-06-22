// app.js
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const JSend = require("./jsend");
const productRouter = require("./routes/product.router");
const {
  resourceNotFound,
  handleError,
} = require("./controllers/errors.controller");
const swaggerDocument = require("../docs/openapiSpec.json");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  return res.json(JSend.success());
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/public", express.static("public"));

productRouter.setup(app);

// Handle 404 error for unknown URL paths
app.use(resourceNotFound);

// Define the centralized error handling middleware, after all routes
// and middleware have been defined
app.use(handleError);

module.exports = app;
