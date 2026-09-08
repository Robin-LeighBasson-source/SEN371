// Builds the error shape the global error handler in middleware/errorHandler.js
// understands: a normal Error with a `statusCode` attached. Controllers throw
// these so a failure is reported with the right HTTP status instead of a 500.
const httpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = httpError;
