import { Router } from "express";
import { studentCrudController, tutorCrudController } from "../controllers/crudControllers.mjs";

const router = Router();

// mounted tohttp://localhost:3000/api
router.patch('/tutors/me', tutorCrudController )
router.patch('/students/me', studentCrudController)

export default router;