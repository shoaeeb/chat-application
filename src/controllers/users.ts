import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../asyncwrapper/async-wrapper";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

const signUp = asyncWrapper(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const { firstName, lastName, email, username, password } = req.body;

  const user = new User({
    firstName,
    lastName,
    email,
    username,
    password,
  });
  await user.save();
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
    maxAge: 1000 * 60 * 60 * 24, //1day
  });
  res.status(201).json({ message: "User Created" });
});

export { signUp };
