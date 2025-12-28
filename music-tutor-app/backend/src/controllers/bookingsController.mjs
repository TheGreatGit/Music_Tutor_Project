import { loadSql } from "../queries/loadSql.mjs";
import { query } from "../config/pool.mjs";

const tutorBookingsQuery = loadSql("tutors/getBookingsByTutor.sql");
const studentBookingsQuery = loadSql("getBookingsByStudentId.sql");
const makeBookingQuery = loadSql("makeBooking.sql");


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

      const {rows} = await query(makeBookingQuery, [tutor_id,student_id, instrument_id, booking_start_time, booking_end_time,booking_status, teaching_format_id, teaching_type_id,skill_level_id])
      if(!rows || rows.length === 0){
        res.status(500);
        return next (new Error('Booking insert failed'));
      }
      return res.status(201).json(rows[0]);    
    } catch (error) {
      return next(error);
    }
    

} 
