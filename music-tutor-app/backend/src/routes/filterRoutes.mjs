import { Router } from "express";
import { getInstruments, getCities } from "../controllers/filterControllers.mjs";

const router = Router();

router.get('/instruments', getInstruments);
router.get('/cities', getCities);

export default router;