import { Router } from "express"
import { adminRegistrationController, studentRegistrationController, tutorRegistrationController } from "../controllers/registrationControllers.mjs";


const router = Router();

// router.get('/check-email')
router.post('/tutor', tutorRegistrationController);
router.post('/student', studentRegistrationController);
router.post('/admin', adminRegistrationController);

export default router;