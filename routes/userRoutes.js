import express from "express";
import { addUser, getUsers, getUserDetails} from "../controllers/userController.js";
// import {  isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add user/admin (protected route)
router.post("/add",addUser);

// Get all users (for admin dashboard)
router.get("/", getUsers);

router.get("/details", getUserDetails);

export default router;
