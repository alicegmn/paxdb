import express, { Request, Response } from "express";
import dotenv from "dotenv";
import pool from "./db";
import cors from "cors";
import limiter from "./middlewares/rateLimiter";
import errorHandler from "./middlewares/errorHandler";
import bcrypt from "bcryptjs";
import asyncHandler from "./middlewares/asyncHandler";

// routes
import setupRoutes from "./routes/setup";
import userRoutes from "./routes/users";
import roomRoutes from "./routes/rooms";
import bookingRoutes from "./routes/bookings";
import authRoutes from "./routes/authRoutes";
import docsRoutes from "./routes/docs";
import deviceConfigRoutes from "./routes/deviceConfig"


dotenv.config();
const app = express();
const port = process.env.PORT || 13000;
app.use(express.json());
app.use(limiter); // allows limiter on all routes

// allow requests from frontend and deployed app
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:8080",
      "http://localhost:8081",
      "https://paxdb.vercel.app",
    ],
    credentials: true,
  })
);

app.use("/", setupRoutes);
app.use("/docs", docsRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/rooms", roomRoutes);
app.use("/bookings", bookingRoutes);
app.use("/config", deviceConfigRoutes);

app.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    return res.send(
      "Welcome to the PAX API - read the docs on https://paxdb.vercel.app/docs!"
    );
  })
);

import testRoutes from "./routes/test";
app.use("/test", testRoutes);
app.use(errorHandler);

app.get("/test-db", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: "Database connection failed" });
  }
});

app.get("/setup", async (_req: Request, res: Response) => {
  console.log("setup starting");
  try {
    // Vänta 5 sekunder för att säkerställa att DB är redo
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Skapa tabell för rooms
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
    projector BOOLEAN DEFAULT FALSE,
    temperature INT DEFAULT 0,
    activity BOOLEAN DEFAULT FALSE,
    time VARCHAR(20),
    img TEXT
  )
`);

    // Skapa tabell för users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'user'
      )
    `);

    await pool.query(`
  CREATE TABLE IF NOT EXISTS device_configs (
    id SERIAL PRIMARY KEY,
    serial_number VARCHAR(255) UNIQUE NOT NULL,
    room_id INT REFERENCES rooms(id)
  )
`);

    // Skapa admin om den inte finns
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
      console.log("✅ Admin user 'admin123' created");
    }

    // Skapa vanlig user om den inte finns
    const normalUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      ["user123"]
    );
    if (normalUser.rows.length === 0) {
      const hashedPassword = await bcrypt.hash("pass123", 10);
      await pool.query(
        "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
        ["user123", hashedPassword, "user"]
      );
      console.log("✅ User 'user123' created");
    }

    console.log("Table setup completed.");
    res.status(200).send("Setup completed");
  } catch (err) {
    console.error("Error during setup:", err);
    res.status(500).send("Error setting up database");
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

//only in dev mode
if (process.env.NODE_ENV !== "production") {
  console.log("DB_USER:", process.env.DB_USER);
  console.log("DB_HOST:", process.env.DB_HOST);
  console.log("DB_NAME:", process.env.DB_NAME);
  console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
  console.log("DB_PORT:", process.env.DB_PORT);
}

export default app; // Export for testing
