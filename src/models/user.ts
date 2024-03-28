import mongoose from "mongoose";
import bcrypt from "bcryptjs";

type UserType = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  profilePic: string;
};

var validateEmail = function (email: string) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const userSchema = new mongoose.Schema<UserType>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validateEmail, "please fill a valid email address"],
  },
  password: { type: String, required: true },
  profilePic: { type: String, default: "" },
});

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
  next();
});

const User = mongoose.model<UserType>("User", userSchema);

export default User;
