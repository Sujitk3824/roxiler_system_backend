import express from "express";
import { signup, login, updatePassword } from "../controllers/authController.js";

const router = express.Router();

// Normal user signup
router.post("/signup", signup);

// Login (for all roles)
router.post("/login", login);

router.put("/update-password", updatePassword);


export default router;
