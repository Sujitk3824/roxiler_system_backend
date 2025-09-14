// routes/storeRoutes.js
import express from "express";
import {
  addStore,
  getOwnerStores,
  getStores,
  rateStore,
  getStoreList
  
} from "../controllers/storeController.js";

const router = express.Router();

// Add a new store
router.post("/add-store", addStore);

// Get all stores for a specific owner
router.get("/owner/:ownerId", getOwnerStores);

// GET all stores
router.get("/", getStores);

router.get("/list", getStoreList);



// POST/UPDATE rating
router.post("/:storeId/rate", rateStore);

export default router;
