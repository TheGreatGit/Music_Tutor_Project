import { Router } from "express";
import { getMessagesFromDB } from "../controllers/chatMessageControllers.mjs";
import {protect} from "../middleware/authMiddleware.mjs";

const router = Router();

// these are mounted to http:localhost:3000/api/chat/messages
router.get('/', protect, getMessagesFromDB);


export default router;