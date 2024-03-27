import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import { server, app } from "./socket/socket";
import userRouter from "./routes/users";
import errorMiddleware from "./middlewares/error-middleware";

const PORT = process.env.PORT || 7000;

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", userRouter);

app.use(errorMiddleware);

server.listen(PORT, () => {
  console.log(`Server is listening in PORT ${PORT}`);
});
