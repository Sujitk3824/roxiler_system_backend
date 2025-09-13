import pool from "../db.js"; // PostgreSQL pool
import bcrypt from "bcryptjs";

// Add new user or admin
export const addUser = async (req, res) => {
  const { name, email, password, address, role } = req.body;

  if (!name || !email || !password || !address || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      "INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role",
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({ message: "User added successfully", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users (for Admin Dashboard)
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, address, role FROM users ORDER BY id DESC");
    res.status(200).json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
