import { Router } from "express";
import { getMessagesFromDB, inboxHistoryHandler } from "../controllers/chatMessageControllers.mjs";
import {protect} from "../middleware/authMiddleware.mjs";

const router = Router();

// these are mounted to http:localhost:3000/api/chat/messages
router.get('/inbox', protect, inboxHistoryHandler);
router.get('/:otherUserId', protect, getMessagesFromDB);



export default router;