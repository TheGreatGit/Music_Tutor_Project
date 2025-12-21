import { Router } from "express";
import { getBookingsByTutorId, getBookingsByStudentId } from "../controllers/bookingsController.mjs";

const router = Router();

router.get('/tutors/:tutorId', getBookingsByTutorId);
router.get('/students/:studentId', getBookingsByStudentId)

export default router;