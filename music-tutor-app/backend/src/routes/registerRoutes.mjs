import { Router } from "express"
import { studentRegistrationController, tutorRegistrationController } from "../controllers/registrationControllers.mjs";


const router = Router();

// router.get('/check-email')
router.post('/tutor', tutorRegistrationController);
router.post('/student', studentRegistrationController)

export default router;