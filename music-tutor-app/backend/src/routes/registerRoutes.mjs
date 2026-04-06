import { Router } from "express"
import { adminRegistrationController, studentRegistrationController, tutorRegistrationController } from "../controllers/registrationControllers.mjs";


const router = Router();

router.post('/tutor', tutorRegistrationController);
router.post('/student', studentRegistrationController);
router.post('/admin', adminRegistrationController);

export default router;