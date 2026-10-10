import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// API Routes
app.get("/", (req, res) => {
  res.json({ message: "Event Management API is running smoothly!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "An unexpected server error occurred",
  });
});

const PORT = process.env.PORT || 5001;

// Connect Database & Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export default app;