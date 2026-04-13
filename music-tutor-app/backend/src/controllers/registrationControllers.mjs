import { pool } from "../config/pool.mjs";
//import { validateTutorRegistrationFormData } from "../validation/validateTutorRegistrationForm.mjs";
import { zodTutorRegistrationSchema } from "../validation/zodTutorRegistrationSchema.mjs";
import { zodStudentRegistrationSchema } from "../validation/zodStudentRegistrationSchema.mjs";
import { zodAdminRegistrationSchema } from "../validation/zodAdminRegistrationSchema.mjs";
//import { validateStudentRegistrationFormData } from "../validation/validateStudentRegistrationForm.mjs";
import { findUserByEmail } from "../services/userService.mjs";
import bcrypt from "bcrypt";

// this handler is for actual tutor registration attempt; it will also check email availability
// requests go to http://localhost:3000/api/register/tutor  (post request)
export const tutorRegistrationController = async (req, res, next) => {
  // check form data in req.body
  const formData = req.body || {};
  // console.log(formData);

  const zodValidationCheck = zodTutorRegistrationSchema.safeParse(formData);
  if (!zodValidationCheck.success) {
    console.log(
      "Backend zod validation issue: ",
      zodValidationCheck.error.issues,
    );
    return res.status(400).json({ errors: zodValidationCheck.error.issues });
  }

  // destructure the cleaned data returned in zodValidationCheck.data
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
  } = zodValidationCheck.data;

  const lowerCasedEmail = email.toLowerCase().trim();
  // create outer try block
  try {
    // since data is validated, check that the email is not in use already so that you don't begin the later transaction needlessly
    const isEmailRegistered = await findUserByEmail(lowerCasedEmail);
    if (isEmailRegistered) {
      console.log(isEmailRegistered.email + " is not available");
      return res.status(409).json({
        errors: [
          {
            path: ["email"],
            message: "Email already registered",
          },
        ],
      });
    }

    // use the 'client' method from the pool object rather than the 'query' method because the sql will use a transaction
    const client = await pool.connect();

    // inner try for attempting the transaction
    try {
      // get a client connection and begin transaction
      await client.query("BEGIN");

      // hash user password
      const passwordHash = await bcrypt.hash(password, 10);

      // get role id for tutor
      const roleResult = await client.query(
        `select role_id from roles where role_name = $1`,
        ["tutor"],
      );
      const roleId = roleResult.rows[0].role_id;

      // insert email, roleId, and hashed password in to app_users table and return the system-generated user id (from the user_id column)
      const appUserResult = await client.query(
        `insert into app_users (email, password_hash, role_id) 
      values ($1, $2, $3) returning user_id`,
        [lowerCasedEmail, passwordHash, roleId],
      );
      // get  user Id from appUserResult
      const userId = appUserResult.rows[0].user_id;

      // get city id from city table
      const cityResult = await client.query(
        `select city_id from cities where city_name = $1`,
        [city],
      );
      const cityId = cityResult.rows[0].city_id;

      // insert in to tutors
      const tutorResult = await client.query(
        `insert into tutors (first_name, last_name, city_id, user_id) values ($1, $2, $3, $4) returning tutor_id`,
        [firstName, lastName, cityId, userId],
      );

      const tutorId = tutorResult.rows[0].tutor_id;

      //get contact type for 'mobile' and add phoen number to user_contact_details
      const contactTypeResult = await client.query(
        `
      select contact_type_id
      from contact_type
      where contact_type = $1`,
        ["mobile"],
      );

      const phoneTypeId = contactTypeResult.rows[0].contact_type_id;

      // insert into USER_contact_details
      await client.query(
        `insert into user_contact_details (user_id, contact_type_id, contact_info) values ($1, $2, $3)`,
        [userId, phoneTypeId, phoneNumber],
      );

      // get instrument details
      const instrumentResult = await client.query(
        `select instrument_id from instruments where instrument_name = $1`,
        [instrument],
      );
      const instrumentId = instrumentResult.rows[0].instrument_id;
      // insert in to instrument table
      await client.query(
        `insert into tutor_instruments (tutor_id, instrument_id) values ($1, $2)`,
        [tutorId, instrumentId],
      );

      //teaching formats (an array)
      // 'ANY' is a postgres comparison operator that is saying 'that matches ANY item in the array ...'
      //'ANY' is equivalent to 'in' in normal sql (but is used for arrays specifically).
      // The $1 is just the usual node-pg-library placeholder to prevent sql injection
      // :: is postgres shorthand casting operator
      // text[] is telling posgtres that you are casting the paramter to an array of strings rather than relying on type deduction in postgres
      if (teachingFormats && teachingFormats.length > 0) {
        const formatsResult = await client.query(
          `select teaching_format_id, teaching_format_name from teaching_format where teaching_format_name = ANY($1::text[])`,
          [teachingFormats],
        ); // querry becomnes equivalent to ...where teaching_format_name = ANY(ARRAY['in_person'])
        // formatsResult would return, for each submitted format, row of teaching format id and name where submitted format name matches DB format name

        const values = [];
        const params = [tutorId]; // always add tutorId as the first param in the params array

        formatsResult.rows.forEach((row, index) => {
          values.push(`($1, $${index + 2})`); // depending on index, values becomes [($1,$2), ($1,$3), ($1, $4)...] SEE BELOW WHY ITS INDEX+2
          params.push(row.teaching_format_id); // add the teaching format id  to params so it becomes e.g [tutorId, 1,2,3 ...]
        });

        await client.query(
          `insert into tutor_teaching_formats (tutor_id, teaching_format_id)
        values ${values.join(",")}`, // becomes e.g. "($1,$2), ($1,$3), ($1, $4)" i.e. it turns the array in to an actual string with ',' between elements
          params, // params will be e.g. [tutorId, 1, 2,3,...] =
        );
        /*
          The code above creates bulk inserts where you insert numerous sets of values in a single query 
          rather than having one query per set of values to be inserted.
          e.g. tutorId = 10 and you have teaching_format_ids of 1,2,3.

          The query, after array-building and string joining becomes
          `insert into tutor_teaching_formats (tutor_id, teaching_format_id) values ($1,$2), ($1,$3), ($1,$4), [10, 1,2,3]`
          remeber that, due to the $, node-pg is using params 10 for $1 in each values pair along with the 1,2, or 3 as the 2nd part of individual pairs
          
          Finally, after the values placeholders are populated from the params array by node-pg library, the query becomes:
          `insert into tutor_teaching_formats (tutor_id, teaching_format_id) values (10,1), (10,2), (10,3)`
          i.e. a bulk insert

          Index +2 is used because the values pairs will always be of the form ($1,$x)- as only two columns are inserted in to- and $1 from the params array needs to be the tutor_id.
          Therefore, as the first insert needs to be the pair of tutor_id and then the 2nd param, the values formatting to be fed in to the query
          must be ($1,$2), then ($1, $3) for the 2nd insert i.e. always the index+2
        */
      }

      // teaching types -an array again
      if (teachingTypes && teachingTypes.length > 0) {
        const typesResult = await client.query(
          `select teaching_type_id, teaching_type_name from teaching_type where teaching_type_name = ANY($1::text[])`,
          [teachingTypes],
        );

        const values = [];
        const params = [tutorId]; // again, tutorID is 1st thing to insert

        typesResult.rows.forEach((row, index) => {
          values.push(`($1, $${index + 2})`);
          params.push(row.teaching_type_id);
        });

        await client.query(
          `insert into tutor_teaching_types (tutor_id, teaching_type_id) values ${values.join(
            ",",
          )}`,
          params,
        );
      }

      // skill levels - array
      if (skillLevels && skillLevels.length > 0) {
        const skillsResult = await client.query(
          `select skill_level_id, skill_level_name from skill_levels where skill_level_name = ANY($1::TEXT[])`,
          [skillLevels],
        );

        const values = [];
        const params = [tutorId]; // again, tutorId is 1st thing to insert

        skillsResult.rows.forEach((row, index) => {
          values.push(`($1, $${index + 2})`);
          params.push(row.skill_level_id);
        });

        await client.query(
          `insert into tutor_teaching_levels (tutor_id, skill_level_id)
        values ${values.join(",")}`,
          params,
        );
      }

      // COMMIT TRANSACTION
      await client.query("COMMIT");

      // confirm success
      return res
        .status(201)
        .json({ message: "tutor registered successfully", userId });
    } catch (err) {
      // in the midst of an error, roll back if anythign went wrong
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.error(
          "Error rolling back transaction in tutorRegistrationController: ",
          rollbackErr,
        );
      }
      // error for email being already registered. postgreSQL has the error code 23505 for a unique_violation error i.e. email breachers the app_user table's constraint of having unique email
      if (err.code === "23505") {
        return res.status(409).json({
          errors: [
            {
              path: ["email"],
              message: "Email already registered",
            },
          ],
        });
      }

      console.error("Error in tutorRegistrationController: ", err);
      return next(err);
    } finally {
      // release the client
      client.release();
    }
  } catch (outerError) {
    // catches errors from e.g. findUSerByEmail or pool.connect()
    console.error(
      "Outer error before transaction begins in registering tutor: ",
      outerError,
    );
    return next(outerError);
  }
};

export const studentRegistrationController = async (req, res, next) => {
  // check form data in req.body
  const formData = req.body || {};
  // console.log(formData);

  const zodValidationResult = zodStudentRegistrationSchema.safeParse(formData);

  if (!zodValidationResult.success) {
    return res.status(400).json({ errors: zodValidationResult.error.issues });
  }

  // destructure the cleaned data returned in zodValidationResult.data
  const { firstName, lastName, city, email, phoneNumber, password } =
    zodValidationResult.data;

  const lowerCasedEmail = email.toLowerCase();

  // create outer try block
  try {
    // since data is validated, check that the email is not in use already
    const isEmailRegistered = await findUserByEmail(lowerCasedEmail);
    if (isEmailRegistered) {
      console.log(isEmailRegistered.email + " is not available");
      return res.status(409).json({
        errors: [
          {
            path: ["email"],
            message: "Email already registered",
          },
        ],
      });
    }

    // use the 'client' method from the pool object rather than the 'query' method because the sql will use a transaction
    const client = await pool.connect();

    // inner try for attempting the transaction
    try {
      // get a client connection and begin transaction
      await client.query("BEGIN");

      // hash user password
      const passwordHash = await bcrypt.hash(password, 10);

      // get role id for STUDENT
      const roleResult = await client.query(
        `select role_id from roles where role_name = $1`,
        ["student"],
      );
      const roleId = roleResult.rows[0].role_id;

      // insert email, roleId, and hashed password in to app_users table and return the system-generated user id (from the user_id column)
      const appUserResult = await client.query(
        `insert into app_users (email, password_hash, role_id) 
      values ($1, $2, $3) returning user_id`,
        [lowerCasedEmail, passwordHash, roleId],
      );
      // get  user Id from appUserResult
      const userId = appUserResult.rows[0].user_id;

      // get city id from city table
      const cityResult = await client.query(
        `select city_id from cities where city_name = $1`,
        [city],
      );
      const cityId = cityResult.rows[0].city_id;

      // insert in to STUDENTS
      const studentResult = await client.query(
        `insert into students (first_name, last_name, city_id, user_id) values ($1, $2, $3, $4)`,
        [firstName, lastName, cityId, userId],
      );

      //get contact type for 'mobile' and add phoen number to tutor_contact_details
      const contactTypeResult = await client.query(
        `
      select contact_type_id
      from contact_type
      where contact_type = $1`,
        ["mobile"],
      );

      const contactTypeId = contactTypeResult.rows[0].contact_type_id;

      // insert into USER_contact_details
      await client.query(
        `insert into user_contact_details (user_id, contact_type_id, contact_info) values ($1, $2, $3)`,
        [userId, contactTypeId, phoneNumber],
      );

      // COMMIT TRANSACTION
      await client.query("COMMIT");

      // confirm success
      return res
        .status(201)
        .json({ message: "student registered successfully", userId });
    } catch (err) {
      // in the midst of an error, roll back if anythign went wrong
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.error(
          "Error rolling back transaction in studentRegistrationController: ",
          rollbackErr,
        );
      }
      // error for email being already registered. postgreSQL has the error code 23505 for a unique_violation error i.e. email breachers the app_user table's constraint of having unique email
      if (err.code === "23505") {
        return res.status(409).json({
          errors: [
            {
              path: ["email"],
              message: "Email already registered",
            },
          ],
        });
      }

      console.error("Error in studentRegistrationController: ", err);
      return next(err);
    } finally {
      // release the client
      client.release();
    }
  } catch (outerError) {
    // catches errors from e.g. findUSerByEmail or pool.connect()
    console.error(
      "Outer error before transaction begins in registering student: ",
      outerError,
    );
    return next(outerError);
  }
};

export const adminRegistrationController = async (req, res, next) => {
  // check form data in req.body
  const formData = req.body || {};

  const zodValidationResult = zodAdminRegistrationSchema.safeParse(formData);

  if (!zodValidationResult.success) {
    return res.status(400).json({ errors: zodValidationResult.error.issues });
  }

  // destructure the cleaned data returned in validateStudentRegistrationFormData.data
  const { firstName, lastName, email, password } = zodValidationResult.data;

  const lowerCasedEmail = email.toLowerCase();

  // create outer try block
  try {
    // since data is validated, check that the email is not in use already
    const isEmailRegistered = await findUserByEmail(lowerCasedEmail);
    if (isEmailRegistered) {
      console.log(isEmailRegistered.email + " is not available");
      return res.status(409).json({
        errors: [
          {
            path: ["email"],
            message: "Email already registered",
          },
        ],
      });
    }

    // use the 'client' method from the pool object rather than the 'query' method because the sql will use a transaction
    const client = await pool.connect();

    // inner try for attempting the transaction
    try {
      // get a client connection and begin transaction
      await client.query("BEGIN");

      // hash user password
      const passwordHash = await bcrypt.hash(password, 10);

      // get role id for ADMIN
      const roleResult = await client.query(
        `select role_id from roles where role_name = $1`,
        ["admin"],
      );
      const roleId = roleResult.rows[0].role_id;

      // insert email, roleId, and hashed password in to app_users table and return the system-generated user id (from the user_id column)
      const appUserResult = await client.query(
        `insert into app_users (email, password_hash, role_id) 
      values ($1, $2, $3) returning user_id`,
        [lowerCasedEmail, passwordHash, roleId],
      );
      // get  user Id from appUserResult
      const userId = appUserResult.rows[0].user_id;

      // insert in to ADMINS
      await client.query(
        `insert into admins (first_name, last_name, user_id) values ($1, $2, $3)`,
        [firstName, lastName, userId],
      );

      // COMMIT TRANSACTION
      await client.query("COMMIT");

      // confirm success
      return res
        .status(201)
        .json({ message: "admin registered successfully", userId });
    } catch (err) {
      // in the midst of an error, roll back if anythign went wrong
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.error(
          "Error rolling back transaction in adminRegistrationController: ",
          rollbackErr,
        );
      }
      // error for email being already registered. postgreSQL has the error code 23505 for a unique_violation error i.e. email breachers the app_user table's constraint of having unique email
      if (err.code === "23505") {
       return res.status(409).json({
        errors: [
          {
            path: ['email'],
            message: 'Email already registered'
          }
        ]
       });
      }

      console.error("Error in adminRegistrationController: ", err);
      return next(err);
    } finally {
      // release the client
      client.release();
    }
  } catch (outerError) {
    // catches errors from e.g. findUSerByEmail or pool.connect()
    console.error(
      "Outer error before transaction begins in registering admin: ",
      outerError,
    );
    return next(outerError);
  }
};
