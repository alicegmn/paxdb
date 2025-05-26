import express, { Request, Response } from "express";
import pool from "../db";
import bcrypt from "bcryptjs";

const router = express.Router();

/**
 * @swagger
 * /setup:
 *   get:
 *     summary: Initialize database and create tables
 *     description: Creates tables for users, rooms, bookings, and devices if they don't exist. Also seeds a default admin user.
 *     tags: [Setup]
 *     responses:
 *       200:
 *         description: Setup complete
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "✅ Setup complete: Tables created and default admin checked."
 *       500:
 *         description: Setup failed
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "❌ Setup failed. See server logs."
 */

router.get("/setup", async (_req: Request, res: Response) => {
  try {
    console.log("🔧 Running setup script...");

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        surname VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator'))
      );
    `);

    // Create rooms table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        available BOOLEAN DEFAULT TRUE,
        air_quality INTEGER DEFAULT 0,
        screen BOOLEAN DEFAULT FALSE,
        floor INTEGER DEFAULT 0,
        chairs INTEGER DEFAULT 0,
        whiteboard BOOLEAN DEFAULT FALSE,
        projector BOOLEAN DEFAULT FALSE,
        temperature NUMERIC,
        activity BOOLEAN,
        time VARCHAR(100),
        img TEXT
      );
    `);

    // Create bookings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL
      );
    `);

    // Create devices table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS device_configs (
        id SERIAL PRIMARY KEY,
        serial_number VARCHAR(100) UNIQUE NOT NULL,
        room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL
      );
    `);

    // Create default admin if not exists
    const adminEmail = "admin@pax.com";
    const adminCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [adminEmail]
    );
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await pool.query(
        `INSERT INTO users (name, surname, email, password, role)
         VALUES ($1, $2, $3, $4, $5)`,
        ["Admin", "User", adminEmail, hashedPassword, "admin"]
      );
      console.log("✅ Default admin user created (admin@pax.com / admin123)");
    }

    console.log("✅ Tables created (if not already existing).");
    res
      .status(200)
      .send("✅ Setup complete: Tables created and default admin checked.");
  } catch (err) {
    console.error("❌ Setup error:", err);
    res.status(500).send("❌ Setup failed. See server logs.");
  }
});

export default router;
