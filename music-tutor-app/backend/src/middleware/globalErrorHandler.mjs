export function GlobalErrorHandler(err, req, res, next) {
  console.error("Global error handler caught:", err);
  
  const statusCode = Number.isInteger(err.status)
  ? err.status 
  : (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  // send the status code and only the error message so that frontend doesn'tget to see backend internals
  res.status(statusCode).json({message: err.message || "internal server error"});
}


