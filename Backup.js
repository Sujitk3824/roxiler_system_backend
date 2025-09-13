import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import pool from "./db.js"; // ✅ import your db connection

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Auth routes (signup + login)
app.use("/api/auth", authRoutes);

// ✅ DB Test Route
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "✅ DB connected", time: result.rows[0] });
  } catch (err) {
    console.error("DB test error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Root health check
app.get("/", (req, res) => {
  res.send("✅ Store Rating API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
