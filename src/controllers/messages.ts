import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../asyncwrapper/async-wrapper";
import Conversation from "../models/conversation";
import Message from "../models/message";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

//get route
//api/v1/messages/conversations/:otherUserId
const getConversation = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const ourUserId = req.userId;
    const { otherUserId } = req.params;
    const conversation = await Conversation.findOne({
      participants: {
        $all: [ourUserId, otherUserId],
      },
    });
    if (!conversation) {
      res.status(200).json({
        participants: [ourUserId, otherUserId],
        lastMessage: "",
        sender: "",
      });
    }
    res.status(200).json(conversation);
  }
);

//get route
//api/v1/messages/:conversationId
const getMessages = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { conversationId } = req.params;
    const messages = await Message.findOne({ conversationId });
    if (!messages) {
      res.status(404).json({ message: "Conversation not found" });
      return;
    }
    res.status(200).json(messages);
  }
);

//post route
//api/v1/messages/:otherUserId
const createMessage = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { otherUserId } = req.params;
    const { message } = req.body;
    const sender = req.userId;
    let conversation = await Conversation.findOne({
      participants: {
        $all: [sender, otherUserId],
      },
    });
    if (!conversation) {
      const newConversation = new Conversation({
        participants: [sender, otherUserId],
        lastMessage: message,
        sender,
      });
      await newConversation.save();
      const newMessage = new Message({
        conversationId: newConversation._id,
        sender,
        messages: [{ message, sender }],
      });
      await newMessage.save();
      res.status(201).json(newMessage);
      return;
    }

    conversation = await Conversation.findOneAndUpdate(
      {
        participants: {
          $all: [sender, otherUserId],
        },
      },
      {
        lastMessage: message,
        sender,
      },
      {
        new: true, // This option makes it return the updated document
      }
    );

    const messageModel = await Message.findOneAndUpdate(
      { conversationId: conversation?._id },
      {
        $push: { messages: { message, sender } },
      },
      {
        new: true,
      }
    );
    res.status(201).json(messageModel);
  }
);

export { getMessages, getConversation, createMessage };
