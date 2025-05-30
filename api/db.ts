import pkg from "pg";
const { Pool } = pkg;

import dotenv from "dotenv";

// Ladda .env endast i utvecklingsläge
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default pool;
