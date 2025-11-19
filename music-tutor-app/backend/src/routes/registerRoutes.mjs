import { Router } from "express"
import { tutorRegistrationController } from "../controllers/registrationControllers.mjs";


const router = Router();

router.post('/tutor', tutorRegistrationController);

export default router;