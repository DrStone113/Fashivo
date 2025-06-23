const ApiError = require("../api-error");
const JSend = require("../jsend");

function methodNotAllowed(req, res, next) {
  if (req.route) {
    const httpMethods = Object.keys(req.route.methods)
      .filter((method) => method !== "_all")
      .map((method) => method.toUpperCase());
    return next(
      new ApiError(405, "Method Not Allowed", {
        Allow: httpMethods.join(", "),
      })
    );
  }
  return next();
}

function resourceNotFound(req, res, next) {
  return next(new ApiError(404, "Resource not found"));
}

function handleError(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  // Khai báo biến để chứa dữ liệu bổ sung, ví dụ validationErrors
  let responseData = null;

  // Nếu lỗi là ApiError và có thuộc tính 'headers' chứa validationErrors
  if (error instanceof ApiError && error.headers && error.headers.validationErrors) {
    responseData = error.headers.validationErrors;
  }

  // Đặt các HTTP headers nếu có, nhưng chỉ những cái hợp lệ (ví dụ: 'Allow' cho 405)
  if (error.headers) {
    for (const headerKey in error.headers) {
      // Chỉ đặt các headers hợp lệ, không phải validationErrors
      if (headerKey !== 'validationErrors') {
        res.set(headerKey, error.headers[headerKey]);
      }
    }
  }


  // Dùng JSend.fail và truyền responseData vào tham số thứ hai (data)
  // nếu statusCode là lỗi client (4xx)
  if (statusCode >= 400 && statusCode < 500) {
    return res.status(statusCode).json(JSend.fail(message, responseData));
  } else {
    // Dùng JSend.error cho lỗi server (5xx)
    return res.status(statusCode).json(JSend.error(message, null, responseData)); // Giả định JSend.error có tham số 'data' thứ 3
  }
}

module.exports = {
  methodNotAllowed,
  resourceNotFound,
  handleError,
};