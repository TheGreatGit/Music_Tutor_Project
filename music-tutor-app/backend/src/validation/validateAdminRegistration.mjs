const PASSWORD_MIN = 8;
const PASSWORD_MAX = 16;

export const validateAdminRegistration = (formData) => {
  //create an array to hold validation errors:
  const errors = [];

  const {
    firstName,
    lastName,
    email,
    password,
  } = formData || {};

  // hekper function for checking if required string fields have a string or if it is empty
  const isBlank = (val) => typeof val !== "string" || val.trim().length === 0;

  // check if the string-type fields are ok first
  if (isBlank(firstName)) errors.push("First name is required.");
  if (isBlank(lastName)) errors.push("Last name is required.");
  if (isBlank(email)) errors.push("Email is required.");
  if (isBlank(password)) errors.push("Password is required.");

  if (password && password.length < PASSWORD_MIN) {
    errors.push(`Password must be at least ${PASSWORD_MIN} characters long.`);
  }

  if (password && password.length > PASSWORD_MAX) {
    errors.push(`Password maximum of ${PASSWORD_MAX} characters long.`);
  }

  // if validation fails, return a status update and error array
  if (errors.length > 0) {
    return { ok: false, errors };
  }

  // Otherwise, clean values before passing to route handler
  // dont bother returning the 'confirm' fields here because they won't be used in database.
  const cleaned = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    // some say to NOT trim a password in order to preserve it exactly as user types it, but I don't care
    password: password.trim(),
  };

  // validation has passed so return status update and cleaned data to be used in route handler
  return { ok: true, data: cleaned };
};
