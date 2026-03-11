import { Router } from "express";
import { getTutorByTutorId, getTutors } from "../controllers/getTutorsController.mjs";

const router = Router();
// mounted on route http://localhost:3000/api/tutors
router.get('/', getTutors);
router.get('/:tutorId', getTutorByTutorId);

export default router;