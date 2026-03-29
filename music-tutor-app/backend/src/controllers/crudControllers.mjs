import { pool } from "../config/pool.mjs";
import { verifyToken } from "../services/tokenService.mjs";
import { findUserByUserId } from "../services/userService.mjs";

export const tutorCrudController = async (req, res, next) => {
  // get form data
  const formData = req.body || {};

  // get token
  const token = req.cookies?.token;
  if (!token) {
    res.status(401);
    return next(new Error("Not authenticated"));
  }

  // verify token
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    res.status(401);
    return next(new Error("Invalid token"));
  }

  const userId = decoded?.userId;
  if (!userId) {
    res.status(401);
    return next(new Error("Invalid token"));
  }

  // get frontend's form data
  const city = formData?.city?.trim() || "";
  const instrument = formData?.instrument?.trim() || "";
  const teachingFormats = formData?.teachingFormats || [];
  const teachingTypes = formData?.teachingTypes || [];
  const skillLevels = formData?.skillLevels || [];

  if (!city) {
    res.status(400);
    return next(new Error("City is required"));
  }

  if (!instrument) {
    res.status(400);
    return next(new Error("Instrument is required"));
  }

  if (teachingFormats.length === 0) {
    res.status(400);
    return next(new Error("At least one teaching format is required"));
  }

  if (teachingTypes.length === 0) {
    res.status(400);
    return next(new Error("At least one teaching type is required"));
  }

  if (skillLevels.length === 0) {
    res.status(400);
    return next(new Error("At least one skill level is required"));
  }

  // outer try block before transaction
  try {
    // get tutor from DB
    const userRow = await findUserByUserId(userId);

    if (!userRow) {
      res.status(401);
      return next(new Error("User not found"));
    }

    if (userRow.role_name !== "tutor" || !userRow.tutor_id) {
      res.status(403);
      return next(new Error("Tutor profile not found for this user"));
    }

    // tutor id is needed for updating all the tutor-x tables
    const tutorId = userRow.tutor_id;

    const client = await pool.connect();
    // inner try block for transaction
    try {
      // get city ID corresponding to frontend data
      const cityResult = await client.query(
        `select city_id from cities where city_name = $1`,
        [city],
      );
      const cityId = cityResult.rows?.[0]?.city_id;

      if (!cityId) {
        res.status(400);
        return next(new Error("Invalid city"));
      }

      // get instrument id corresponding to frontend data
      const instrumentResult = await client.query(
        `select instrument_id from instruments where instrument_name = $1`,
        [instrument],
      );

      const instrumentId = instrumentResult.rows?.[0]?.instrument_id;

      if (!instrumentId) {
        res.status(400);
        return next(new Error("Invalid instrument"));
      }

      // get teaching format ids corresponding to frontend data
      const formatsResult = await client.query(
        `select teaching_format_id, teaching_format_name
         from teaching_format
         where teaching_format_name = ANY($1::text[])`,
        [teachingFormats],
      );

      // check if the teaching formats sent from online (in the array) are all found in the DB
      // i.e. if the frontend sends an invalid teaching format,  there will be no corresponding row from DB
      // this will mean that DB rows.length != teachingFormats.length
      if (formatsResult.rows.length !== teachingFormats.length) {
        res.status(400);
        return next(new Error("One or more teaching formats are invalid"));
      }

      // get teaching type ids corresponding to frontend data
      const typesResult = await client.query(
        `select teaching_type_id, teaching_type_name
         from teaching_type
         where teaching_type_name = ANY($1::text[])`,
        [teachingTypes],
      );
      // same as for teachingFormats
      if (typesResult.rows.length !== teachingTypes.length) {
        res.status(400);
        return next(new Error("One or more teaching types are invalid"));
      }

      // get skill level ids
      const skillsResult = await client.query(
        `select skill_level_id, skill_level_name
         from skill_levels
         where skill_level_name = ANY($1::text[])`,
        [skillLevels],
      );
      // and again
      if (skillsResult.rows.length !== skillLevels.length) {
        res.status(400);
        return next(new Error("One or more skill levels are invalid"));
      }

      // begin transaction
      await client.query("BEGIN");

      // update city_id in tutors table (will be updated with the current one if no change made)
      await client.query(
        `update tutors
         set city_id = $1,
             updated_at = now()
         where tutor_id = $2`,
        [cityId, tutorId],
      );

      // delete old tutor instrument entry
      await client.query(
        `delete from tutor_instruments
         where tutor_id = $1`,
        [tutorId],
      );

      // insert new one
      await client.query(
        `insert into tutor_instruments (tutor_id, instrument_id)
         values ($1, $2)`,
        [tutorId, instrumentId],
      );

      // replace teaching formats
      await client.query(
        `delete from tutor_teaching_formats
         where tutor_id = $1`,
        [tutorId],
      );

      // see line 151 in registrationController.mjs in the tutorRegistrationController function for explanation of this code
      if (formatsResult.rows.length > 0) {
        const values = [];
        const params = [tutorId];

        formatsResult.rows.forEach((row, index) => {
          values.push(`($1, $${index + 2})`);
          params.push(row.teaching_format_id);
        });

        await client.query(
          `insert into tutor_teaching_formats (tutor_id, teaching_format_id)
           values ${values.join(",")}`,
          params,
        );
      }

      // replace teaching types
      await client.query(
        `delete from tutor_teaching_types
         where tutor_id = $1`,
        [tutorId],
      );

      if (typesResult.rows.length > 0) {
        const values = [];
        const params = [tutorId];

        typesResult.rows.forEach((row, index) => {
          values.push(`($1, $${index + 2})`);
          params.push(row.teaching_type_id);
        });

        await client.query(
          `insert into tutor_teaching_types (tutor_id, teaching_type_id)
           values ${values.join(",")}`,
          params,
        );
      }

      // replace skill levels
      await client.query(
        `delete from tutor_teaching_levels
         where tutor_id = $1`,
        [tutorId],
      );

      if (skillsResult.rows.length > 0) {
        const values = [];
        const params = [tutorId];

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

      // commit
      await client.query("COMMIT");

      return res.status(200).json({
        message: "Tutor profile updated successfully",
        tutorId,
      });
    } catch (err) {
      // rollback transaction if needed
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.log(
          "Error rolling back transaction in tutorCrudController:",
          rollbackErr,
        );
      }
      console.log("Error in tutorCrudController:", err);
      return next(err);
    } finally {
      client.release();
    }
  } catch (outerError) {
    console.log(
      "Outer error before transaction begins in tutorCrudController:",
      outerError,
    );
    return next(outerError);
  }
};

export const studentCrudController = async (req, res, next) => {};
