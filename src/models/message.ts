import mongoose from "mongoose";

type MessageType = {
  _id: string;
  conversationId: string;
  messages: [
    {
      sender: string;
      message: string;
    }
  ];
};

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, required: true },
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, required: true },
      message: { type: String, required: true },
    },
  ],
});

const Message = mongoose.model<MessageType>("Message", messageSchema);
export default Message;
