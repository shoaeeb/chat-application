import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../asyncwrapper/async-wrapper";
import User from "../models/user";
import { BadRequest } from "../errors";
import bcyrpt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import uuid from "uuid";
import nodemailer from "nodemailer";
import { SentMessageInfo } from "nodemailer";
import ForgetPassword from "../models/forgetPassword";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.email,
    pass: process.env.email_password,
  },
});

const login = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      throw new BadRequest("Invalid Credentials");
    }
    const isPasswordCorrect = await bcyrpt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new BadRequest("Invalid Credentials");
    }
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY as string,
      {
        expiresIn: "1d",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, //1d
    });
    res.status(200).json({ message: "User logged in" });
  }
);

const validateToken = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: req.userId });
  }
);

//api/v1/forget-password
const forgetPassword = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequest("Invalid Credentials");
    }
    const token = uuid.v4();
    // tokenStore[token] = { email, expiry: Date.now() + 360000 };
    const tokenStore = new ForgetPassword({
      email,
      token,
      expireAt: Date.now() + 1000 * 60 * 60, //1 hour
    });

    const mailOptions = {
      from: process.env.email,
      to: email,
      subject: "Reset Password",
      html: `Click on the link to reset your password ${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`,
    };
    transporter.sendMail(
      mailOptions,
      (err: Error | null, info: SentMessageInfo) => {
        if (err) {
          console.log(err);
          res
            .status(500)
            .json({ error: "Failed to send password reset email" });
        } else {
          console.log("Email Sent", info.response);
          res.status(200).json({ message: "Email sent" });
        }
      }
    );
  }
);

//api/v1/reset-password?toekn=token&email=email
const resetPassword = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const email = req.query.email?.toString();
    const token = req.query.token?.toString();

    const tokenDoc = await ForgetPassword.findOne({ email, token });
    if (!tokenDoc) {
      throw new BadRequest("Invalid or expired token");
    }
    res.status(200).json({ message: "OK" });
  }
);

//api/v1/update-password?token=token&email=email;
const updatePassword = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const email = req.query.email?.toString();
    const token = req.query.token?.toString();
    const password = req.body.password;
    const tokenDoc = await ForgetPassword.findOneAndDelete({ email, token });
    if (!tokenDoc) {
      throw new BadRequest("Invalid or expired token");
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequest("Invalid Credentials");
    }
    user.password = password;
    await user.save();
    res.status(200).json({ message: "Password Reset Succesfully" });
  }
);

export { login, validateToken };
