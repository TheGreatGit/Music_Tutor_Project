import { query } from "../config/pool.mjs";
import { loadSql } from "../queries/loadSql.mjs";

// read-in sql file with parameterised query
const listTutorsSql = loadSql("tutors/getTutors.sql");
const tutorByIdSql = loadSql("tutors/getTutorById.sql");

// create the actual controller
// this controller also frabs any url params for coty or instrument (if present) and adds them to SQL query as params
export const getTutors = async (req, res, next) => {
  try {
    // attempt to grab url query params from front-end (anything after the'?' in url)
    const { instrument, city } = req.query || {};
    const instrumentSearchParam = instrument ? `%${instrument.trim()}%` : null; // the '%' are added before and after the param as the actual sql query is using ILIKE rather than exact matching
    const citySearchParam = city ? `%${city.trim()}%` : null;

    // supply sql text then add search params in an array
    const { rows } = await query(listTutorsSql, [
      instrumentSearchParam,
      citySearchParam,
    ]);
    return res.json(rows);
  } catch (error) {
    console.error("Database error (get tutors):", error);
   // res.status(500).json({ message: "database error" });
    return next(error) // use global error handler
  }
};

// this is for the personalised tutor profiles after clicking on a tutor's profile card in the 'find a tutor' page
export const getTutorById = async (req, res, next) => {
  try {
    // grab tutor id from url and cast as number as it will be in string format in url
    const tutorId = Number(req.params.tutorId);

    // handles invalid input in url
    if (!Number.isInteger(tutorId) || tutorId <= 0) {
      res.status(400);
      return next(new Error('Invalid tutor id'));
    }

    const { rows } = await query(tutorByIdSql, [tutorId]);
    // if client gives valid input but tutorId doesn't exists e.g '9999'
    if (rows.length === 0) {
      res.status(404);
      return next(new Error('Tutor not found'));
    }
    console.log(rows[0]);
    
    return res.json(rows[0]);
  } catch (error) {
    console.error("Database error in getTutorById", error);
    return next(error); // use global error handler instead
  }
};
