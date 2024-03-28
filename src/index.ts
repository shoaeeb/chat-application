import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import { server, app } from "./socket/socket";
import userRouter from "./routes/users";
import messageRoute from "./routes/messages";
import errorMiddleware from "./middlewares/error-middleware";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

const PORT = process.env.PORT || 7000;

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", userRouter);
app.use("/api/v1", messageRoute);

app.use(errorMiddleware);

server.listen(PORT, () => {
  console.log(`Server is listening in PORT ${PORT}`);
});
