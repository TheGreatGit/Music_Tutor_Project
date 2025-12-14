export function errorHandler(err, req, res, next) {
  console.error("Global error handler caught:", err);

  // If a response status hasn't already been set, default to 500
  const statusCode = Number.isInteger(err.status) ? err.status : 500;

  // create a 'payload' object to be sent to frontend in the error
  // as a minimum, the 'payload' will contain the error message
  const payload = { message: err.message || "internal server error" };

  // if extra detail was given to the error object when created in the httpError function, add it to the payload
  const standardisedErrorDetails = standardiseErrorDetailsForPayload(err.details);
  if (standardisedErrorDetails !== undefined) {
    payload.details = standardisedErrorDetails;
  }
  res.status(statusCode).json(payload);
}

const standardiseErrorDetailsForPayload = (details) => {
  if (details === undefined) return undefined;
  if (details === null) return null; // check null before typeof object because null IS considered an object in JS
  if (typeof details === "object") return details;
  // for random info- ensure the error payload sends the info as an object for frontend handler e.g. details added as '123' becomes {value: '123} for the frontend
  return { value: details };
};

