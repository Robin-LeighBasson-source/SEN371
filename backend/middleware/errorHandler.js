// Catches requests that matched no route and hands them to the error handler.
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Global error handler - keeps every error response in the same JSON shape.
// Express identifies this as an error handler by its four arguments, so `next`
// must stay in the signature even though it is unused.
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
    ...(process.env.NODE_ENV === "production" ? {} : { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
