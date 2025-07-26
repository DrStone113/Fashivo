/**
 * JSend success response format.
 * @param {object | null} data - The payload to be returned.
 * @returns {{status: 'success', data: object | null}} - The JSend success object.
 */
function success(data = null) {
  return {
    status: "success",
    data: data,
  };
}

/**
 * JSend fail response format.
 * @param {string} message - A meaningful, end-user-readable message explaining what went wrong.
 * @param {object | null} [data] - Optional data associated with the failure.
 * @returns {{status: 'fail', message: string, data?: object}} - The JSend fail object.
 */
function fail(message, data = null) {
  const response = {
    status: "fail",
    message,
  };
  if (data) {
    response.data = data;
  }
  return response;
}

/**
 * JSend error response format.
 * @param {string} message - A meaningful, end-user-readable message explaining the error.
 * @param {object | null} [data] - Optional data associated with the error.
 * @returns {{status: 'error', message: string, data?: object}} - The JSend error object.
 */
function error(message, data = null) {
  const response = {
    status: "error",
    message,
  };
  if (data) {
    response.data = data;
  }
  return response;
}

module.exports = {
  success,
  fail,
  error,
};
