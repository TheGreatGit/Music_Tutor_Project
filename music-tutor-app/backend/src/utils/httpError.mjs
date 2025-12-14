// helper function to standardise error generation and error-object-shape
export const httpError = (status, message, details) => {
  const err = new Error(message);
  err.status = status;

  if (details !== undefined) {
    err.details = details;
  }

  return err;
};

// create error setups for different error types so that they are standardised
// e.g. missing field in form validation
export const fieldError = (message, field)=>{
   return  httpError(400, message, {type: 'FIELD_ERROR', field});
};

// invalid data entered in to form field(s)
export const validationError = (errors)=>{
    return httpError(400, "Validation error", {type: "VALIDATION_ERROR", errors});
};

// incorrect email or password on login attempt
export const authError = ()=>{
   return  httpError(401, "Invalid credentials", {type: 'AUTHORISATION_ERROR'});
}
