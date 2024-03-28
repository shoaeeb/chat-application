import mongoose from "mongoose";
type ConversationType = {
  _id: string;
  participants: mongoose.Types.ObjectId[];
  lastMessage: string;
  sender: mongoose.Types.ObjectId;
};

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
      ref: "User",
    },
    lastMessage: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model<ConversationType>(
  "Conversation",
  conversationSchema
);

export default Conversation;
