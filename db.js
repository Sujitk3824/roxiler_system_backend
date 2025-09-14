import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: String(process.env.DB_PASS ),
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

export default pool;
