export function GlobalErrorHandler(err, req, res, next) {
  console.error("Global error handler caught:", err);

  // If a response status hasn't already been set, default to 500
  const statusCode = Number.isInteger(err.status) ? err.status : 500;

  // send the status code and only the error message so that frontend doesn'tget to see backend internals
  res.status(statusCode).json({message: err.message || "internal server error"});
}


