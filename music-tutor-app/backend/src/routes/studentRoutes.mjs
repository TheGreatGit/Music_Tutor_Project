import { Router } from "express";
import { protect } from "../middleware/authMiddleware.mjs";
import { studentCrudController } from "../controllers/crudControllers.mjs";
import { getMyStudentProfile } from "../controllers/studentControllers.mjs";



const router = Router();

// mounted on http://localhost:3000/api/students
router.get('/me', protect, getMyStudentProfile);
router.patch('/me', protect, studentCrudController); // needs finished

export default router;