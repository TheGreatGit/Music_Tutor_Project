import { Router } from "express";
import { getCitiesController, getInstrumentsController } from "../controllers/filterControllers.mjs";

const router = Router();

router.get('/cities', getCitiesController);
router.get('/instruments', getInstrumentsController);
export default router;