import express from "express";
import { signUp } from "../controllers/users";
import { login, validateToken } from "../controllers/auth";
import { check } from "express-validator";
import { verifyToken } from "../middlewares/auth";

const router = express();

router.post(
  "/register",
  [
    check("firstName", "firstName is required").isString(),
    check("lastName", "lastName is required").isString(),
    check("email", "Email is required").isEmail(),
    check("username", "username is required").isString(),
    check("password", "password is required").isString(),
  ],
  signUp
);
router.post(
  "/login",
  [
    check("username", "username is required").isString(),
    check("password", "password is required").isString(),
  ],
  login
);
router.post("/validate-token", verifyToken, validateToken);

export default router;
