import { Router } from "express";
import { getCurrentUser } from "../controllers/authController.mjs";

const router = Router();

router.get('/reauth',getCurrentUser);

export default router;