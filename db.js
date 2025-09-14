import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "store_rating_db",
  password: String(process.env.DB_PASS || "Sujit@123"),
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL");
});

export default pool;
