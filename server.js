// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors()); // enable CORS for all origins
app.use(express.json()); // parse JSON body
app.use(express.urlencoded({ extended: true })); // parse URL-encoded body

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/user", userRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Store Rating API running...");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
