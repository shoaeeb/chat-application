import express from "express";
import { getUserProfile, signUp, updateProfile } from "../controllers/users";
import { login, validateToken } from "../controllers/auth";
import { check, param } from "express-validator";
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
router.get(
  "/profile/:username",
  [param("username", "username is required").notEmpty()],
  getUserProfile
);
router.put(
  "/profile/:id",
  verifyToken,
  [
    check("firstName", "firstName is required").isString(),
    check("lastName", "lastName is required").isString(),
    check("email", "Email is required").isEmail(),
    check("password", "password is required").isString(),
    check("profilePic", "profilePic is required").isString(),
  ],
  updateProfile
);

export default router;
