import { Router } from "express";
import { getBookingsByTutorId } from "../controllers/bookingsController.mjs";

const router = Router();

router.get('/tutors/:tutorId', getBookingsByTutorId);

export default router;