import express, { Request, Response } from "express";
import pool from "../db";
import bcrypt from "bcryptjs";

const router = express.Router();

router.get("/setup", async (_req: Request, res: Response) => {
  try {
    console.log("🔧 Running setup script...");

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        surname VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator', 'devices'))
      );
    `);

    // Rooms table
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

    // Bookings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL
      );
    `);

    // Devices table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS device_configs (
        id SERIAL PRIMARY KEY,
        serial_number VARCHAR(100) UNIQUE NOT NULL,
        room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL
      );
    `);

    // Users to seed
    const usersToCreate = [
      {
        name: "Admin",
        surname: "User",
        email: "admin@pax.com",
        password: "admin123",
        role: "admin",
      },
      {
        name: "Device",
        surname: "Admin",
        email: "devices@pax.com",
        password: "device123",
        role: "devices",
      },
      {
        name: "Mod",
        surname: "User",
        email: "moderator@pax.com",
        password: "mod123",
        role: "moderator",
      },
      {
        name: "Regular",
        surname: "User",
        email: "user@pax.com",
        password: "user123",
        role: "user",
      },
    ];

    for (const user of usersToCreate) {
      const existing = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [user.email]
      );
      if (existing.rows.length === 0) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await pool.query(
          `INSERT INTO users (name, surname, email, password, role)
           VALUES ($1, $2, $3, $4, $5)`,
          [user.name, user.surname, user.email, hashedPassword, user.role]
        );
        console.log(
          `${user.role} user created (${user.email} / ${user.password})`
        );
      }
    }

    console.log("Tables created and users seeded.");
    res.status(200).send("Setup complete: Tables created and users added.");
  } catch (err) {
    console.error("Setup error:", err);
    res.status(500).send("Setup failed. See server logs.");
  }
});

export default router;
