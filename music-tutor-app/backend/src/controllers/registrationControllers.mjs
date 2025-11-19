import { pool } from "../config/pool.mjs";
import { validateTutorRegistrationFormData } from "../validation/validateTutorRegistrationForm.mjs";
import bcrypt from 'bcrypt'

export const tutorRegistrationController = async (req, res, next) => {
  // check form data in req.body
  const formData = req.body || {};
  const validationResult = validateTutorRegistrationFormData(formData);

  if(!validationResult.ok){
    return res.status(400).json({errors: validationResult.errors})
  }
  
  // destructure the cleaned data returned in validateTutorRegistrationFormData.data
    const {
    instrument,
    teachingFormats,
    teachingTypes,
    skillLevels,
    firstName,
    lastName,
    city,
    email,
    phoneNumber,
    password,
  } = validationResult.data;
  
  // use the 'client' method from the pool object rather than the 'query' method because the sql will use a transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
  } catch (error) {
    
  }
  res.status(200).json({ message: "yurt" });
};
