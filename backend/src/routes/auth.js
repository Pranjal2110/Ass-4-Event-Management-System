import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", authenticateUser, getMe);

export default router;
