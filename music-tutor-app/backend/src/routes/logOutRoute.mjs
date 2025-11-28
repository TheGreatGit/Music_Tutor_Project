import { Router } from "express";
import { logout } from "../controllers/authController.mjs";

const router = Router();

router.get('/logout', logout);

export default router;