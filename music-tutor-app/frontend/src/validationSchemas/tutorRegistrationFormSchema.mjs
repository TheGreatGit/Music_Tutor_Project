// /src/schemas/formSchema.js
import { z } from "zod";

//  utility function that encapsulates logic for handling blank data that will be used for each string field
const removeBlanks = (message) => {
  return z.string().trim().min(1,{error: message });
};

// create enums for the fields with multiple simultaneous options in the form
const teachingFormatEnum = z.enum(['online', 'in_person']);
const teachingTypeEnum = z.enum(['individual', 'group']);
const skillLevelEnum = z.enum(['Beginner', 'Intermediate', 'Advanced', 'Professional']);

export const tutorRegistrationFormSchema = z
  .object({
    instrument: removeBlanks("Instrument is required"),

    teachingFormats: z.array(teachingFormatEnum).min(1,{error: 'Select at least one teaching format'}),
    teachingTypes: z.array(teachingTypeEnum).min(1,{error: 'Select at least one teaching type'}),
    skillLevels: z.array(skillLevelEnum).min(1,{error: 'Select at least one skill level'}),

    firstName: removeBlanks("First name required"),
    lastName: removeBlanks("Last name required"),
    city: removeBlanks('City is required'),

    email: removeBlanks("Email required").email({error: "Invalid email format"}),
    confirmEmail: removeBlanks("Confirm email").email({error:"Invalid email format"}),

    password: removeBlanks("Password required")
      .min(8, { error: "Min length 8 characters" })
      .max(16, { error: "Max length 16 characters" }),
    confirmPassword: removeBlanks("Confirm password"),

    phoneNumber: removeBlanks("Phone number required").length(11,{error: 'Invalid phone number format'}),
  }) // these refine methods are tagged on to the end of the schema for bespoke validation
  .refine((data) => data.email === data.confirmEmail, {
    message: "Emails must match",
    path: ["confirmEmail"], // tells zod where the error belongs
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });
  