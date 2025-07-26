const ApiError = require("../api-error");
const JSend = require("../jsend");

/**
 * Handles requests for unsupported HTTP methods on a route.
 * Responds with a 405 Method Not Allowed error.
 */
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

/**
 * Handles requests for non-existent resources.
 * Responds with a 404 Not Found error.
 */
function resourceNotFound(req, res, next) {
  return next(new ApiError(404, "Resource not found"));
}

/**
 * Centralized error handling middleware.
 * Logs the error and sends a formatted JSend response.
 */
function handleError(error, req, res, next) {
  // Log the error for debugging purposes on the server.
  console.error("SERVER_ERROR:", error);

  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  let responseData = null;

  // Extract validation errors if they exist.
  if (
    error instanceof ApiError &&
    error.headers &&
    error.headers.validationErrors
  ) {
    responseData = error.headers.validationErrors;
  }

  // Set any custom headers from the error object.
  if (error.headers) {
    for (const headerKey in error.headers) {
      if (headerKey !== "validationErrors") {
        res.set(headerKey, error.headers[headerKey]);
      }
    }
  }

  if (statusCode >= 400 && statusCode < 500) {
    // For client errors (4xx), use JSend.fail.
    return res.status(statusCode).json(JSend.fail(message, responseData));
  } else {
    // For server errors (5xx), use JSend.error.
    // In development, include the stack trace for easier debugging.
    if (process.env.NODE_ENV === "development") {
      return res.status(statusCode).json(
        JSend.error(message, {
          details: responseData,
          stack: error.stack, // Include stack trace in the response data
        })
      );
    } else {
      return res.status(statusCode).json(JSend.error(message, responseData));
    }
  }
}

module.exports = {
  methodNotAllowed,
  resourceNotFound,
  handleError,
};
