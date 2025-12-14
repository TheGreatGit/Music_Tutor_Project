import { Router } from "express";
import { getTutorById, getTutors } from "../controllers/getTutorsController.mjs";

const router = Router();

router.get('/', getTutors);
router.get('/:tutorId', getTutorById);

export default router;