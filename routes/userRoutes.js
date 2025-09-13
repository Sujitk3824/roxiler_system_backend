import express from "express";
import { addUser, getAllUsers } from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add user/admin (protected route)
router.post("/add", verifyToken, isAdmin, addUser);

// Get all users (for admin dashboard)
router.get("/", verifyToken, isAdmin, getAllUsers);

export default router;
