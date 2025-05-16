import dotenv from "dotenv";
import pool from "../db/db";
import bcrypt from "bcryptjs";

dotenv.config();

async function setupDatabase() {
  console.log("Starting DB setup...");

  try {
    // Skapa tabellen för rooms
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        available BOOLEAN DEFAULT TRUE,
        air_quality INT DEFAULT 0,
        screen BOOLEAN DEFAULT FALSE,
        floor INT DEFAULT 0,
        chairs INT DEFAULT 0,
        whiteboard BOOLEAN DEFAULT FALSE,
        projector BOOLEAN DEFAULT FALSE
      )
    `);

    // Skapa tabellen för users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'user'
      )
    `);

    // Lägg till admin-användare om den inte finns
    const adminUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      ["admin123"]
    );

    if (adminUser.rows.length === 0) {
      const hashedPassword = await bcrypt.hash("pass123", 10);
      await pool.query(
        "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
        ["admin123", hashedPassword, "admin"]
      );
      console.log("Admin user 'admin123' created successfully");
    } else {
      console.log("Admin user already exists");
    }

    console.log("DB setup complete.");
    process.exit(0);
  } catch (err) {
    console.error("DB setup failed:", err);
    process.exit(1);
  }
}

setupDatabase();
