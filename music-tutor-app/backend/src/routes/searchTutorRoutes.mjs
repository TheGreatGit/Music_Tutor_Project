import { Router } from "express";
import { getTutors } from "../controllers/getTutorsController.mjs";

const router = Router();

router.get('/', getTutors);

export default router;