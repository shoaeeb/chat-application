import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../asyncwrapper/async-wrapper";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { v2 as cloudinary } from "cloudinary";
import { BadRequest } from "../errors";
import { profile } from "console";

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

const getUserProfile = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  }
);

const updateProfile = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    let { firstName, lastName, email, password, profilePic } = req.body;

    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      throw new BadRequest("User Not Found");
    }
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.password = password || user.password;

    if (profilePic) {
      if (user.profilePic) {
        const imageId = user.profilePic.split("/").pop();
        await cloudinary.uploader.destroy(imageId as string);
      }
      const result = await cloudinary.uploader.upload(profilePic);
      profilePic = result.secure_url;
    }
    user.profilePic = profilePic || user.profilePic;
    await user.save();
    res.status(200).json(user);
  }
);

export { signUp, getUserProfile, updateProfile };
