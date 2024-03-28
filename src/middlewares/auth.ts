import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../asyncwrapper/async-wrapper";
import jwt, { JwtPayload } from "jsonwebtoken";
import { BadRequest } from "../errors";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

const verifyToken = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies["token"];
    if (!token) {
      throw new BadRequest("Not authorized");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
    const userId = (decoded as JwtPayload).userId;
    req.userId = userId;
    next();
  }
);

export { verifyToken };
