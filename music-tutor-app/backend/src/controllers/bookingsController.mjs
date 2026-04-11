import { loadSql } from "../queries/loadSql.mjs";
import { query } from "../config/pool.mjs";

const tutorBookingsQuery = loadSql("tutors/getBookingsByTutor.sql");
const studentBookingsQuery = loadSql("getBookingsByStudentId.sql");
const checkConflictsQuery = loadSql("checkForConflicts.sql");
const makeBookingQuery = loadSql("makeBooking.sql");
const getBookingByIdQuery = loadSql('getBookingByBookingId.sql');
const cancelBookingByIdQuery = loadSql('cancelBookingById.sql');

const MIN_LESSON_DURATION_IN_MINUTES = 30;
const MAX_LESSON_DURATION_IN_MINUTES = 60;
const DAY_IN_MS = 1000 * 60 * 60 * 24;


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
      const {tutor_id, student_id, instrument_id, booking_start_time, booking_end_time, title, teaching_format_id, teaching_type_id, skill_level_id, isDraft} = draftBooking;

      // basic validity check
      if(!tutor_id || !student_id || !instrument_id || !booking_start_time || !booking_end_time || !teaching_format_id || !teaching_type_id || !skill_level_id){
        res.status(400);
        return next(new Error('Missing required booking fields'));
      }

      // check all the IDs
      // put them in an array if obhects in order to apply a standard check in a loop rather than writing 6 individual checks
      const IdArray = [{key: 'tutor_id', value: tutor_id}, {key: 'student_id', value: student_id}, {key: 'instrument_id', value: instrument_id}, {key:'teaching_format_id', value: teaching_format_id}, {key:'teaching_type_id', value: teaching_type_id}, {key:'skill_level_id', value: skill_level_id}];

      // empty object to be used to create validated IDArray key-value pairs for DB insertion
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

export const getBookingByBookingId = async(req, res, next) =>{
  try {
    // booking ID will be received as string so it needs to be cast to an integer
    const bookingId = Number(req.params.bookingId);
    if(!Number.isInteger(bookingId) || bookingId <= 0){
      res.status(400);
      return next(new Error('Invalid booking Id'));
    }
    console.log('get booking by id sql query is', getBookingByIdQuery);
    
    console.log('booking id requested is:', bookingId);
    
    const {rows} = await query(getBookingByIdQuery, [bookingId]); 
    if(rows.length === 0){
      res.status(404);
      // the return is essential to prevent a 'headers already sent' error in node - this is caused by the res.json(rows) call being fired!
      return next(new Error( 'No booking found with that id'));
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return next(error);
  }

}

export const cancelBookingById = async(req, res, next) =>{
  try {
    const bookingId = Number(req?.params?.bookingId);
    const userId = Number(req?.user?.user_id);

    if(!Number.isInteger(bookingId) || bookingId <=0){
      res.status(400);
      return next(new Error('Invalid booking id'));
    }
    if(!Number.isInteger(userId) || userId <=0){
      res.status(401);
      return next(new Error('You must be logged in to cancel a booking'));
    }

    // cancel SQL query looks for given booking id where current booking status is 1(confirmed) and the start time is >24 hours away and returns booking id and status
    const cancelResult = await query(cancelBookingByIdQuery, [bookingId, userId]);
    if(cancelResult.rows.length >0){
      // send message for frontend to display
      // also send the result from the query (the booking id and status) in case I want frontend to use that info later
      return res.status(200).json({message: 'Appointment cancelled', booking: cancelResult.rows[0]});
    }

    // reaching this code means that rows.length === 0; i.e. that the booking that was requested to  be cancelled did not fit cancel criteria or doesn't exist or some error
    // do other checks to determine what has happened

    // 1st, just check to see if any bookings match the booking id at all
    // didn't want to create another separate sql file for this right now!
    const checkResult = await query(`
      select
        tutor_id,
        student_id,
        booking_status, 
        booking_start_time, 
        booking_start_time <= NOW() as started_or_passed,
        booking_start_time <=(NOW() + interval '24 hours') as within_24h 
      from bookings 
      where booking_id = $1`, 
      [bookingId]);

    if(checkResult.rows.length === 0){
      res.status(404);
      return next(new Error('Booking not found in cancel booking attempt'));
    }

    // here means that a booking whose id matches with that contained in the cancel request from frontend has been found but it doesn't meet cancel criteria
    const booking = checkResult.rows[0];

    // booking status of 1 means confirmed, 2 means pending( not used yet) and 3 means cancelled
    if(booking.booking_status !==1){// assume that if not equal to 1, it is equal to 3
      res.status(409);
      return next(new Error('Booking is not confirmedd and cannot be cancelled'));
    }

    //NEW CHECK
    if(!(booking.tutor_id === userId || booking.student_id === userId)){
      res.status(403);
      return next(new Error('Only participants can cancel a booking'));
    }

    // booking exists and has not been cancelled, but does not fit other crtieria of initial cancel SQL clauses i.e. is not > 24 hours away
    if(booking.started_or_passed){
      res.status(409);
      return next(new Error('LEsson has already passed or begun and cannot be cancelled'));
    }

    if(booking.within_24h){
      res.status(409);
      return next(new Error('Bookings cannot be cancelled within 24 hours of start time'));
    }

    // general catch-all as a fallback- should not be reachable but add just in case
    res.status(409);
    return next(new Error('Booking could not be cancelled'));
  } catch (error) {
    next(error);
  }

};