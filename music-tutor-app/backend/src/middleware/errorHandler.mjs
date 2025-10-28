export function errorHandler(err, req, res, next) {
  console.error("Global error handler caught:", err);

  // If a response status hasn't already been set, default to 500
  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
  });
}
