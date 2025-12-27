import { Router } from "express";
import { getBookingsByTutorId, getBookingsByStudentId, makeBooking } from "../controllers/bookingsController.mjs";

const router = Router();

router.get('/tutors/:tutorId', getBookingsByTutorId);
router.get('/students/:studentId', getBookingsByStudentId)
router.post('/makeBooking', makeBooking);

export default router;