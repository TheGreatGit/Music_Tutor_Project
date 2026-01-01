import { loadSql } from "../queries/loadSql.mjs";
import { query } from "../config/pool.mjs";

const tutorBookingsQuery = loadSql("tutors/getBookingsByTutor.sql");
const studentBookingsQuery = loadSql("getBookingsByStudentId.sql");
const checkConflictsQuery = loadSql("checkForConflicts.sql");
const makeBookingQuery = loadSql("makeBooking.sql");

const MIN_LESSON_DURATION_IN_MINUTES = 30;
const MAX_LESSON_DURATION_IN_MINUTES = 60;


export const getBookingsByTutorId = async (req, res, next) => {
  try {
    // grab tutor id from url and cast as number as it will be in string format in url
    const tutorId = Number(req.params.tutorId);

    if (!Number.isInteger(tutorId) || tutorId <= 0) {
      res.status(400);
      return next(new Error("Invalid tutor id"));
    }

    //attempt query
    const { rows } = await query(tutorBookingsQuery, [tutorId]);
    console.log(rows);
    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
};

export const getBookingsByStudentId = async (req, res, next) => {
  try {
    // grab tutor id from url and cast as number as it will be in string format in url
    const studentId = Number(req.params.studentId);

    if (!Number.isInteger(studentId) || studentId <= 0) {
      res.status(400);
      return next(new Error("Invalid student id"));
    }

    //attempt query
    const { rows } = await query(studentBookingsQuery, [studentId]);
    console.log(rows);
    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
};


export const makeBooking = async(req, res, next)=>{
    try {
      const draftBooking = req.body;
      // set default value to be inserted upon booking
      const booking_status = 1;

      console.log(draftBooking);
      const {tutor_id, student_id, instrument_id, booking_start_time, booking_end_time, title, teaching_format_id, teaching_type_id, skill_level_id, isDraft, client_id} = draftBooking;

      // basic validity check
      if(!tutor_id || !student_id || !instrument_id || !booking_start_time || !booking_end_time || !teaching_format_id || !teaching_type_id || !skill_level_id){
        res.status(400);
        return next(new Error('Missing required booking fields'));
      }

      // check all the IDs
      // put them in an array if obhects in order to apply a standard check in a loop
      const IdArray = [{key: 'tutor_id', value: tutor_id}, {key: 'student_id', value: student_id}, {key: 'instrument_id', value: instrument_id}, {key:'teaching_format_id', value: teaching_format_id}, {key:'teaching_type_id', value: teaching_type_id}, {key:'skill_level_id', value: skill_level_id}];

      // empty object to be used to create validated key-value pairs for DB insertion
      const parsedIds = {};
      // rememebr the {} for key, value as you nmeed to destructure each of IdArray's objects in the for-of loop
      for (const {key, value} of IdArray){
        const parsed = Number(value);
        if(!Number.isInteger(parsed) || parsed <=0){
          res.status(400);
          return next(new Error(`Invalid field: ${key}. ${key} must be a number grater than 0`));
        }
        // add the validated key-value pairs to parsedIds and then use it in the DB query
        parsedIds[key] = parsed
      }

      //* convert booking start and end times in to date objects for comparison checks
      const startTimeAsDate = new Date(booking_start_time);
      const endTimeAsDate = new Date (booking_end_time);

      // check that the Dates are valid. GetTime() returns NaN if the date isn't valid i.e. bad sting supplied to Date comnstructor
      if(Number.isNaN(startTimeAsDate.getTime()) || Number.isNaN(endTimeAsDate.getTime())){
        res.status(400);
        return next(new Error('Invalid booking start or end time'));
      }

      const now = new Date()
      if(startTimeAsDate < now){
        res.status(400);
        return next(new Error('You cannot book appointments in the past'));
      }

      if(endTimeAsDate <= startTimeAsDate) {
        res.status(400);
        return next(new Error('Appointment end point must be after start point'))
      }

      const durationInMinutes = (endTimeAsDate.getTime() - startTimeAsDate.getTime())/(1000*60);
      if(durationInMinutes < MIN_LESSON_DURATION_IN_MINUTES || durationInMinutes > MAX_LESSON_DURATION_IN_MINUTES){
        res.status(400);
        return next(new Error(`Appointments must be between ${MIN_LESSON_DURATION_IN_MINUTES} and ${MAX_LESSON_DURATION_IN_MINUTES} minutes` ))
      }

      // check for appointment conflicts before trying to insert the appointment
      const {rows: conflict} = await query(checkConflictsQuery, [parsedIds.tutor_id, parsedIds.student_id, booking_start_time, booking_end_time]);
      
      if(conflict.length > 0){
        const conflictRow = conflict[0];
        let who="";
        if(conflictRow.tutor_conflict && conflictRow.student_conflict){
          who = 'Tutor and student';
        }else if(conflictRow.tutor_conflict){
          who = 'Tutor';
        }else if(conflictRow.student_conflict){
          who = 'Student';
        }

        res.status(409);
        return next(new Error(`${who} already has a confirmed booking that overlaps this slot`))
      }
      // use the values from parsedIds
      const {rows} = await query(makeBookingQuery, [parsedIds.tutor_id, parsedIds.student_id, parsedIds.instrument_id, booking_start_time, booking_end_time, booking_status, parsedIds.teaching_format_id, parsedIds.teaching_type_id, parsedIds.skill_level_id])
      if(!rows || rows.length === 0){
        res.status(500);
        return next (new Error('Booking insert failed'));
      }
      return res.status(201).json(rows[0]);    
    } catch (error) {
      return next(error);
    }
} 
