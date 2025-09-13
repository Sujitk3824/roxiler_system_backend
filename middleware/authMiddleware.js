import jwt from "jsonwebtoken";
import pool from "../db.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Only allow admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admins only" });
  }
  next();
};


export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Optional: get user from DB
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Token invalid" });
  }
};