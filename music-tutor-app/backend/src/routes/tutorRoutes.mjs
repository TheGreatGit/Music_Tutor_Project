import { Router } from "express";
import {getTutors, getMyTutorProfile, getTutorByTutorId  } from "../controllers/tutorControllers.mjs";
import { protect } from "../middleware/authMiddleware.mjs";
import { tutorCrudController } from "../controllers/crudControllers.mjs";

const router = Router();
// mounted on route http://localhost:3000/api/tutors
router.get('/', getTutors);
router.get('/me', protect, getMyTutorProfile);
router.get('/:tutorId', getTutorByTutorId);
router.patch('/me',protect, tutorCrudController );
export default router;