import express from "express";
import pool from "../db";

const router = express.Router();

// Submit or update a rating
router.post("/add", async (req, res) => {
  const { user_id, store_id, rating } = req.body;

  if (!user_id || !store_id || !rating) {
    return res.status(400).json({ message: "user_id, store_id, and rating are required" });
  }

  try {
    // Upsert: insert new rating or update existing rating
    const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id)
       DO UPDATE SET rating = $3
       RETURNING *`,
      [user_id, store_id, rating]
    );

    // Calculate new average for the store
    const avgRes = await pool.query(
      `SELECT AVG(rating)::numeric(3,2) AS average_rating FROM ratings WHERE store_id = $1`,
      [store_id]
    );

    res.status(200).json({
      message: "Rating submitted successfully",
      rating: result.rows[0],
      newAverage: avgRes.rows[0].average_rating,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
