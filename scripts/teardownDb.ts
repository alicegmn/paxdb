import dotenv from "dotenv";
import pool from "../db/db";

dotenv.config();

async function teardownDatabase() {
  console.log("🧨 Dropping tables...");

  try {
    // ❗ Du kan använda TRUNCATE om du bara vill rensa innehåll utan att ta bort tabeller:
    // await pool.query(`TRUNCATE TABLE bookings, rooms, users RESTART IDENTITY CASCADE`);

    // Tar bort tabeller helt:
    await pool.query(`DROP TABLE IF EXISTS bookings`);
    await pool.query(`DROP TABLE IF EXISTS rooms`);
    await pool.query(`DROP TABLE IF EXISTS users`);

    console.log("✅ Tables dropped successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to drop tables:", err);
    process.exit(1);
  }
}

teardownDatabase();
