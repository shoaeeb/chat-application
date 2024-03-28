import express from "express";
import {
  getConversation,
  getMessages,
  createMessage,
} from "../controllers/messages";
import { verifyToken } from "../middlewares/auth";

const router = express.Router();

router.get(
  "/messages/conversations/:otherUserId",
  verifyToken,
  getConversation
);
router.get("/messages/:conversationId", verifyToken, getMessages);
router.post("/messages/:otherUserId", verifyToken, createMessage);

export default router;
