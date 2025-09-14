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




export const getUsers = async (req, res) => {
  try {
    const { name, email, address, role } = req.query;

    let query = "SELECT id, name, email, address, role FROM users WHERE 1=1";
    let params = [];

    if (name) {
      params.push(`%${name}%`);
      query += ` AND name ILIKE $${params.length}`;
    }
    if (email) {
      params.push(`%${email}%`);
      query += ` AND email ILIKE $${params.length}`;
    }
    if (address) {
      params.push(`%${address}%`);
      query += ` AND address ILIKE $${params.length}`;
    }
    if (role) {
      params.push(role);
      query += ` AND role = $${params.length}`;
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};  
