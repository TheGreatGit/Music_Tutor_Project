import { Router } from "express";
import { getAllTutors } from "../controllers/getAllTutorsController.mjs";

const router = Router();

router.get('/', getAllTutors);

export default router;