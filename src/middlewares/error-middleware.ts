import { Request, Response, NextFunction } from "express";
import { CustomAPIError } from "../errors";

type customErrorType = {
  message: string;
  statusCode: number;
};

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
  code?: number;
  keyValue: string;
}

const errorMiddleware = (
  error: ErrorWithStatusCode,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customError: customErrorType = {
    message: error.message || "Server Error",
    statusCode: error.statusCode || 500,
  };
  if (error && error instanceof CustomAPIError) {
    customError.message = error.message;
    customError.statusCode = error.statusCode;
  }
  if (error && error.code === 11000) {
    customError.message = `Duplicate ${Object.keys(error.keyValue)} entered`;
  }

  console.log("error in the middlware stack", error);

  res.status(customError.statusCode).json({ errors: customError.message });
};

export default errorMiddleware;
