import { query } from "../config/pool.mjs";
import { loadSql } from "../queries/loadSql.mjs";

// read-in sql file with parameterised query
const listTutorsSql = loadSql("tutors/getTutors.sql");

// individual queries for getting indidivual tutor details in rthe shape required by frontend
const coreTutorDetailsQuery = loadSql("tutors/getTutorById/coreTutorDetails.sql");
const tutorInstrumentsQuery = loadSql("tutors/getTutorById/tutorInstruments.sql");
const tutorSkillLevelsQuery = loadSql("tutors/getTutorById/tutorSkillLevels.sql");
const tutorTeachingFormatsQuery = loadSql("tutors/getTutorById/tutorTeachingFormats.sql");
const tutorTeachingTypesQuery = loadSql("tutors/getTutorById/tutorTeachingTypes.sql");


// create the actual controller
// this controller also frabs any url params for city or instrument (if present) and adds them to SQL query as params
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

    // gives user id, tutor id, full name, city, and email
    const coreTutorResult = await query(coreTutorDetailsQuery, [tutorId]);
    if(coreTutorResult.rows.length === 0){
      res.status(400);
      return next(new Error('Tutor not found'));
    }
    // console.log(coreTutorResult.rows[0]);

    // start building the 'tutor' object for frontend
    const tutor = coreTutorResult.rows[0];

    // run the remaining queries in paralelle with Promise.all()
    const [
      tutorInstrumentsResult,
      tutorTeachingFormatsResult,
      tutorTeachingTypesResult,
      tutorSkillLevelsResult,
    ] = await Promise.all([
      query(tutorInstrumentsQuery, [tutorId]),
      query(tutorTeachingFormatsQuery, [tutorId]),
      query(tutorTeachingTypesQuery, [tutorId]),
      query(tutorSkillLevelsQuery, [tutorId])
    ]
    )

    // attach the result arrays as properties on the 'tutor' object
    tutor.instruments = tutorInstrumentsResult.rows;
    tutor.teaching_formats = tutorTeachingFormatsResult.rows;
    tutor.teaching_types = tutorTeachingTypesResult.rows;
    tutor.skill_levels = tutorSkillLevelsResult.rows;

    
    return res.status(200).json(tutor)
  } catch (error) {
    console.error("Database error in getTutorById", error);
    return next(error); // use global error handler instead
  }
};
