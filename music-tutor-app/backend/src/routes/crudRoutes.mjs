import { Router } from "express";
import { passwordChangeController } from "../controllers/crudControllers.mjs";
import { protect } from "../middleware/authMiddleware.mjs";

const router = Router();

// mounted to http://localhost:3000/api
// for UPDATING user profiles
//router.patch('/tutors/me',protect, tutorCrudController );
// router.patch('/students/me', protect, studentCrudController);
router.patch("/user/changePassword", protect, passwordChangeController);

export default router;
