import pool from "../db.js";

//  Get summary stats
export const getDashboardStats = async (req, res) => {
  try {
    const usersResult = await pool.query("SELECT COUNT(*) FROM users");
    const storesResult = await pool.query("SELECT COUNT(*) FROM stores");
    const ratingsResult = await pool.query(
      "SELECT COUNT(*) FROM ratings" // better than counting user_rating > 0
    );

    res.json({
      users: parseInt(usersResult.rows[0].count, 10),
      stores: parseInt(storesResult.rows[0].count, 10),
      ratings: parseInt(ratingsResult.rows[0].count, 10),
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
