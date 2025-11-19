const PASSWORD_MIN = 8;
const PASSWORD_MAX = 16;

export const validateTutorRegistrationFormData = (formData) => {
  //create an array to hold validation errors:
  const errors = [];

  const {
    instrument,
    teachingFormats,
    teachingTypes,
    skillLevels,
    firstName,
    lastName,
    city,
    email,
    confirmEmail,
    password,
    confirmPassword,
    phoneNumber,
  } = formData || {};

  // hekper function for checking if required string fields have a string or if it is empty
  const isBlank = (val) => typeof val !== "string" || val.trim().length === 0;

  // check if the string-type fields are ok first
  if (isBlank(firstName)) errors.push("First name is required.");
  if (isBlank(lastName)) errors.push("Last name is required.");
  if (isBlank(city)) errors.push("City is required.");
  if (isBlank(instrument)) errors.push("Instrument is required.");
  if (isBlank(email)) errors.push("Email is required.");
  if (isBlank(confirmEmail)) errors.push("Confirm email is required.");
  if (isBlank(password)) errors.push("Password is required.");
  if (isBlank(confirmPassword)) errors.push("Confirm password is required.");
  if (isBlank(phoneNumber)) errors.push("Phone number is required.");

  // email match
  if (email.trim() !== confirmEmail.trim()) {
    errors.push("Email and confirm email do not match.");
  }

  // password match + min/max
  if (password !== confirmPassword) {
    errors.push("Password and confirm password do not match.");
  }

  if (password && password.length < PASSWORD_MIN) {
    errors.push(`Password must be at least ${PASSWORD_MIN} characters long.`);
  }

  if (password && password.length > PASSWORD_MAX) {
    errors.push(`Password maximum of ${PASSWORD_MAX} characters long.`);
  }

  // check if array fields are valid
  if (!Array.isArray(teachingFormats) || teachingFormats.length === 0) {
    errors.push("At least one teaching format is required.");
  }
  if (!Array.isArray(teachingTypes) || teachingTypes.length === 0) {
    errors.push("At least one teaching type is required.");
  }
  if (!Array.isArray(skillLevels) || skillLevels.length === 0) {
    errors.push("At least one skill level is required.");
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
    city: city.trim(),
    instrument: instrument.trim(),
    email: email.trim(),
    phoneNumber: phoneNumber.trim(),
    teachingFormats: teachingFormats.map((f) => f.trim()),
    teachingTypes: teachingTypes.map((t) => t.trim()),
    skillLevels: skillLevels.map((l) => l.trim()),
    // some say to NOT trim a password in order to preserve it exactly as user types it, but I don't care
    password: password.trim(),
  };

  // validation has passed so return status update and cleaned data to be used in route handler
  return { ok: true, data: cleaned };
};
