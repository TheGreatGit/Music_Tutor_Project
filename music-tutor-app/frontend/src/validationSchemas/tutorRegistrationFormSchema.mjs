// /src/schemas/formSchema.js
import { z } from "zod";

//  utility function that encapsulates logic for handling blank data that will be used for each field
const removeBlanks = (message) => {
  return z.string().trim().nonempty({ message });
};

const API_URL = "https://localhost:3000";

const isEmailTaken = async (email) => {
  // code for checking  tutor emails in db
  return false;
};

export const tutorRegistrationFormSchema = z
  .object({
    firstName: removeBlanks("First name required"),
    lastName: removeBlanks("Last name required"),

    email: removeBlanks("Email required").email(),
    confirmEmail: removeBlanks("Confirm email"),

    password: removeBlanks("Password required")
      .min(8, { message: "Min length 8 characters" })
      .max(16, { message: "Max length 16 characters" }),
    confirmPassword: removeBlanks("Confirm password"),

    phoneNumber: removeBlanks("Phone number required"),
  }) // these refine methods are tagged on to the end of the schema for bespoke validation
  .refine((data) => data.email === data.confirmEmail, {
    message: "Emails must match",
    path: ["confirmEmail"], // tells zod where the error belongs
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  })
  .check(async (ctx) => {
    // ctx is a `validation context object` from zod that contains the form values to be validated and any associated errors
    // zodresolver takes any errors and adds them to the react hook form formstate.errors object.
    console.log("ctx is", ctx);

    // ctx.value contains all the form values as fieldname: value pairs.
    const { email } = ctx.value; // deconstructing the  email field value.
    
    try {
      const emailTaken = await isEmailTaken(email);

      if (emailTaken) {
        ctx.issues.push({
          code: "custom",
          path: ["email"],
          message: "Email is not available",
        });
      }
    } catch (e) {
      // catches error if api call doesn't complete e.g. API is down
      ctx.issues.push({
        code: "custom",
        path: ["root"],
        message: "Could not verify availability. Please try again.",
      });
    }
  });
