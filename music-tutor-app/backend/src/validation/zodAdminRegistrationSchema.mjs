// /src/schemas/formSchema.js
import { z } from "zod";

//  utility function that encapsulates logic for handling blank data that will be used for each field
const removeBlanks = (message) => {
  return z.string().trim().min(1, { error: message });
};

export const zodAdminRegistrationSchema = z.object({
  firstName: removeBlanks("First name required"),
  lastName: removeBlanks("Last name required"),
  email: removeBlanks("Email required").email({
    error: "Invalid email format",
  }),
  // confirmEmail: removeBlanks("Confirm email").email({error:'Invalid email format'}),
  password: removeBlanks("Password required")
    .min(8, { message: "Min length 8 characters" })
    .max(16, { message: "Max length 16 characters" }),
  // confirmPassword: removeBlanks("Confirm password"),
}); // these refine methods are tagged on to the end of the schema for bespoke validation
/*
  .refine((data) => data.email === data.confirmEmail, {
    message: "Emails must match",
    path: ["confirmEmail"], // tells zod where the error belongs
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });
  */
