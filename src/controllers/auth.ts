import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../asyncwrapper/async-wrapper";
import User from "../models/user";
import { BadRequest } from "../errors";
import bcyrpt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

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
    const isPasswordCorrect = bcyrpt.compare(password, user.password);
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

export { login, validateToken };
