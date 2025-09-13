import pool from "../db.js";
import bcrypt from "bcryptjs";

/**
 * Signup only for Normal User
 */
export const signup = async (req, res) => {
  try {
    const { name, address, email, password } = req.body;

    // ✅ Validation
    if (!name || name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: "Name must be 20–60 characters." });
    }
    if (!address || address.length > 400) {
      return res
        .status(400)
        .json({ message: "Address is required and ≤ 400 characters." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email." });
    }
    if (
      password.length < 8 ||
      password.length > 16 ||
      !/[A-Z]/.test(password) ||
      !/[!@#$%^&*]/.test(password)
    ) {
      return res.status(400).json({
        message:
          "Password must be 8–16 chars, include at least 1 uppercase & 1 special char.",
      });
    }

    // ✅ Check if user already exists
    const existing = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert as Normal User only
    const result = await pool.query(
      `INSERT INTO users (name, address, email, password, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role`,
      [name, address, email, hashedPassword, "user"]
    );

    res.status(201).json({
      message: "Signup successful",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * User Login (for admin, store owner, normal user)
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Success: return user info (without password)
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};



export const updatePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Email and passwords are required" });
    } 

    // 1️⃣ Fetch user from DB
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2️⃣ Compare old password
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(400).json({ message: "Old password is incorrect" });

    // 3️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4️⃣ Update DB
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [hashedPassword, email]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Update password error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};