import pool from "../db.js";

// ✅ Add a new store
export const addStore = async (req, res) => {
  try {
    const { store_name, address, overall_rating, user_rating } = req.body;

    if (!store_name || !address) {
      return res.status(400).json({ message: "Store name and address are required" });
    }

    const result = await pool.query(
      `INSERT INTO stores (store_name, address, overall_rating, user_rating) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [store_name, address, overall_rating || 0, user_rating || 0]
    );

    res.status(201).json({ 
      message: "Store added successfully", 
      store: result.rows[0] 
    });
  } catch (err) {
    console.error("Error adding store:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all stores with average rating
export const getStores = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, s.name, s.address, s.owner_id, s.created_at,
        COALESCE(AVG(r.rating), 0)::numeric(3,2) AS overall_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching stores:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


// Rate a store
export const rateStore = async (req, res) => {
  const { storeId } = req.params; // URL se store ka id
  const { userId, rating } = req.body; // body se user id + rating

  try {
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Insert ya update (upsert)
    await pool.query(
      `INSERT INTO ratings (store_id, user_id, rating, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (store_id, user_id)
       DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()`,
      [storeId, userId, rating]
    );

    // Store ka overall rating update karo (fresh average nikal ke)
    const avgResult = await pool.query(
      `SELECT ROUND(AVG(rating), 1) AS avg
       FROM ratings
       WHERE store_id = $1`,
      [storeId]
    );

    const newAverage = avgResult.rows[0].avg || 0;

    // stores table me bhi update kardo
    await pool.query(
      `UPDATE stores
       SET overall_rating = $1
       WHERE id = $2`,
      [newAverage, storeId]
    );

    res.json({
      message: "Rating submitted successfully",
      overall_rating: newAverage,
    });
  } catch (err) {
    console.error("Error rating store:", err.message);
    res.status(500).json({ message: "Server error while rating store" });
  }
};
