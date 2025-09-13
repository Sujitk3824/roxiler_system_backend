import express from "express";
import { getStores, rateStore, addStore } from "../controllers/storeController.js";

const router = express.Router();

// Add new store
router.post("/add-store", addStore);

// Get all stores
router.get("/all", getStores);

// Rate a store
router.post("/:storeId/rate", rateStore);

export default router;