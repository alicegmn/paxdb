import express from "express";
import dotenv from "dotenv";
import pool from "../db/db";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../swagger/export-swagger";
import cors from "cors";
import limiter from "./middlewares/rateLimiter";
import errorHandler from "./middlewares/errorHandler";
import bcrypt from "bcryptjs";

import userRoutes from "./routes/users";
import roomRoutes from "./routes/rooms";
import bookingRoutes from "./routes/bookings";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
app.use(express.json()); // for parsing application/json
app.use(limiter); // allows limiter on all routes
// allow requests from frontend (localhost:5173)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/rooms", roomRoutes);
app.use("/bookings", bookingRoutes);

//Error handler
app.use(errorHandler);

// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//only in dev mode
if (process.env.NODE_ENV !== "production") {
  console.log("DB_USER:", process.env.DB_USER);
  console.log("DB_HOST:", process.env.DB_HOST);
  console.log("DB_NAME:", process.env.DB_NAME);
  console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
  console.log("DB_PORT:", process.env.DB_PORT);
}

export default app; // export för Vercel serverless
