// At the very top of storeRoutes.js
import pool from "../db.js"; // adjust path if necessary

// ✅ Add a new store
export const addStore = async (req, res) => {
  try {
    const { store_name, address, overall_rating, user_rating } = req.body;

    if (!store_name || !address) {
      return res
        .status(400)
        .json({ message: "Store name and address are required" });
    }

    const result = await pool.query(
      `INSERT INTO stores (store_name, address, overall_rating, user_rating) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [store_name, address, overall_rating || 0, user_rating || 0]
    );

    res.status(201).json({
      message: "Store added successfully",
      store: result.rows[0],
    });
  } catch (err) {
    console.error("Error adding store:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Get all stores with overall rating
export const getStores = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, s.store_name, s.address, s.overall_rating,
             COALESCE(ROUND(AVG(r.rating)::numeric,1), 0) AS avg_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id
      ORDER BY s.id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching stores:", err.message);
    res.status(500).json({ message: "Server error while fetching stores" });
  }
};

// ✅ Rate a store (used in StoreCard.js)
export const rateStore = async (req, res) => {
  const { storeId } = req.params;
  const { userId, rating } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    // Insert or Update user rating
    await pool.query(
      `
      INSERT INTO ratings (store_id, user_id, rating, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (store_id, user_id)
      DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
      `,
      [storeId, userId, rating]
    );

    // Calculate new average rating
    const avgResult = await pool.query(
      `SELECT ROUND(AVG(rating)::numeric,1) AS avg FROM ratings WHERE store_id=$1`,
      [storeId]
    );

    const overall_rating = parseFloat(avgResult.rows[0].avg || 0);

    // Update in stores table also
    await pool.query(`UPDATE stores SET overall_rating=$1 WHERE id=$2`, [
      overall_rating,
      storeId,
    ]);

    res.json({ overall_rating });
  } catch (err) {
    console.error("Error rating store:", err.message);
    res.status(500).json({ message: "Server error while rating store" });
  }
};



export const getOwnerStores = async (req, res) => {
  const ownerId = parseInt(req.params.ownerId);

  if (!ownerId || isNaN(ownerId)) {
    return res.status(400).json({ message: "Owner ID is required or invalid" });
  }

  try {
    // check if user exists and is a store owner
    const ownerCheck = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND role = 'store owner'`,
      [ownerId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ message: "Store owner not found" });
    }

    // fetch stores
    const storesResult = await pool.query(
      `SELECT id, store_name, address, overall_rating, user_rating
       FROM stores
       WHERE owner_id = $1`,
      [ownerId]
    );

    const stores = storesResult.rows;

    // fetch ratings for each store
    for (let store of stores) {
      const ratingsResult = await pool.query(
        `SELECT u.id AS user_id, u.name AS user_name, r.rating
         FROM ratings r
         JOIN users u ON u.id = r.user_id
         WHERE r.store_id = $1`,
        [store.id]
      );
      store.rated_users = ratingsResult.rows;
    }

    res.json(stores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};