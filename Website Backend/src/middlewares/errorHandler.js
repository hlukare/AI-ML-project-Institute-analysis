const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof Error ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || [];

  err.stack && console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export default errorHandler;
