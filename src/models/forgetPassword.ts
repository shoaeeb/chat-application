import mongoose from "mongoose";

type ForgetPasswordType = {
  email: string;
  token: string;
  expireAt: Date;
};

const forgetPasswordSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true },
  expireAt: {
    type: Date,
    default: Date.now,
    required: true,
    index: { expires: "1h" },
  },
});

const ForgetPassword = mongoose.model("ForgetPassword", forgetPasswordSchema);
export default ForgetPassword;
