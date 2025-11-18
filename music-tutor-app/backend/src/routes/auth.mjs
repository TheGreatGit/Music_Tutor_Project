import { Router } from "express";
import { registerAsTutor, login, logout, getCurrentUser } from "../controllers/authController.mjs";
import { protect } from "../middleware/authMiddleware.mjs";

//create router instance
const router = Router();

// mount route and handler
router.post('/register/tutor', registerAsTutor);
// router.post('/register/checkemails, ')
router.post('/login', login);

// logout has a post request rather than get request because get requests are meant to be read-only and not change anything on the server e.g. clearing cookies
router.post('/logout', logout);
router.get('/currentUser', protect, getCurrentUser);

export default router;