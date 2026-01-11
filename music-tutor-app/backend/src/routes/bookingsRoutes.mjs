import { Router } from "express";
import { getBookingsByTutorId, getBookingsByStudentId, makeBooking, getBookingByBookingId, cancelBookingById } from "../controllers/bookingsController.mjs";

const router = Router();
// these are mounted to http://localhost:3000/api/bookings
router.get('/tutors/:tutorId', getBookingsByTutorId);
router.get('/students/:studentId', getBookingsByStudentId)
router.get('/getBookings/:bookingId', getBookingByBookingId);
router.post('/makeBooking', makeBooking);
router.patch('/cancelBooking/:bookingId', cancelBookingById );

export default router;