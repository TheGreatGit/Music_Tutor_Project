import { loadSql } from "../queries/loadSql.mjs";
import { query } from "../config/pool.mjs";

const queryString = loadSql("tutors/getBookingsByTutor.sql");

export const getBookingsByTutorId = async (req, res, next) => {
  try {
    // grab tutor id from url and cast as number as it will be in string format in url
    const tutorId = Number(req.params.tutorId);

    if (!Number.isInteger(tutorId) || tutorId <= 0) {
      res.status(400);
      return next(new Error("Invalid tutor id"));
    }

    //attempt query
    const { rows } = await query(queryString, [tutorId]);
    console.log(rows);
    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
};
