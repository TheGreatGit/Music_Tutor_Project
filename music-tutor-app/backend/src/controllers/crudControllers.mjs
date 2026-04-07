import { pool } from "../config/pool.mjs";
import { findUserByUserId } from "../services/userService.mjs";
import { validatePassword } from "../services/userService.mjs";
import { loadSql } from "../queries/loadSql.mjs";
import { query } from "../config/pool.mjs";
import bcrypt from "bcrypt";

const changePasswordSql = loadSql("changePassword.sql");

export const tutorCrudController = async (req, res, next) => {
  // get form data
  const formData = req.body || {};
  const user = req.user;

  if (!user?.user_id) {
    res.status(401);
    return next(new Error("Not authenticated"));
  }

  if (user?.role !== "tutor" || !user?.tutor_id) {
    res.status(403);
    return next(new Error("Tutor profile not found for this user"));
  }
  // get frontend's form data and sanitise!!
  const city = String(formData?.city || "").trim();
  const instrument = String(formData?.instrument || "").trim();
  const teachingFormats = Array.isArray(formData?.teachingFormats)
    ? formData.teachingFormats
    : [];
  const teachingTypes = Array.isArray(formData?.teachingTypes)
    ? formData.teachingTypes
    : [];
  const skillLevels = Array.isArray(formData?.skillLevels)
    ? formData.skillLevels
    : [];

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
  // tutor id is needed for updating all the tutor-x tables
  const tutorId = user.tutor_id;
  // outer try block before transaction
  try {
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

      // check if the teaching formats sent from frontend (in the array) are all found in the DB
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

export const studentCrudController = async (req, res, next) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      res.status(401);
      return next(new Error("Not authenticated"));
    }

    if (req.user?.role !== "student" || !req.user?.student_id) {
      res.status(403);
      return next(new Error("Student profile not found for this user"));
    }

    //scrub frontend data
    const city = String(req.body?.city ?? "").trim();
    if (!city) {
      res.status(400);
      return next(new Error("City is required"));
    }

    // get city_id relating to frontend data
    const data = await query(
      "select city_id from cities  where city_name = $1",
      [city],
    );
    const cityId = data?.rows[0]?.city_id;
    if (!cityId) {
      res.status(400);
      return next(new Error("No matching city found"));
    }

    // update DB
    await query(
      "UPDATE students set city_id = $1, updated_at = now()  where user_id = $2",
      [cityId, userId],
    );

    return res.status(200).json({
      message:'Student profile updated successfully'
    })

  } catch (error) {
    return next(error);
  }
};

export const passwordChangeController = async (req, res, next) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      res.status(401);
      return next(new Error("Unauthorised"));
    }

    // scrub frontend data
    const currentPassword = String(req.body?.currentPassword ?? "").trim();
    const newPassword = String(req.body?.newPassword ?? "").trim();
    const confirmNewPassword = String(
      req.body?.confirmNewPassword ?? "",
    ).trim();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      res.status(400);
      return next(new Error("All fields required"));
    }
    if (newPassword.length < 8 || newPassword.length > 16) {
      res.status(400);
      return next(new Error("Password must be between  8 and 16 characters"));
    }
    if (newPassword === currentPassword) {
      res.status(400);
      return next(new Error("New password must differ from current password"));
    }
    if (newPassword !== confirmNewPassword) {
      res.status(400);
      return next(new Error("New password and confirm password do not match "));
    }

    // all basic checks have passed so now check frontend current password with DB's hashed password
    const userRow = await findUserByUserId(userId);
    if (!userRow) {
      res.status(401);
      return next(new Error("Not authenticated"));
    }
    const dbPasswordHash = userRow?.password_hash;
    if (!dbPasswordHash) {
      res.status(500);
      return next(new Error("Password not found"));
    }

    if (!(await validatePassword(currentPassword, dbPasswordHash))) {
      res.status(400);
      return next(new Error("Current password is incorrect"));
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await query(changePasswordSql, [newPasswordHash, userId]);
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log("error im passwordChangeController", error);
    return next(error);
  }
};
