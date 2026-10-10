import express from "express";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
} from "../controllers/eventController.js";
import { authenticateUser, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllEvents);

// Authenticated user registrations (Must come before /:id)
router.get("/my-registrations", authenticateUser, getMyRegistrations);

router.get("/:id", getEventById);

// Admin-only CRUD operations
router.post("/", authenticateUser, requireAdmin, createEvent);
router.put("/:id", authenticateUser, requireAdmin, updateEvent);
router.delete("/:id", authenticateUser, requireAdmin, deleteEvent);

// User event registration actions
router.post("/:id/register", authenticateUser, registerForEvent);
router.delete("/:id/register", authenticateUser, cancelRegistration);

export default router;