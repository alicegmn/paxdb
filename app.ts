import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/users";
import roomRoutes from "./routes/rooms";
import bookingRoutes from "./routes/bookings";
import authRoutes from "./routes/authRoutes";
import errorHandler from "./middlewares/errorHandler";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/export-swagger";

dotenv.config();

const app = express();

app.use(express.json());
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

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling middleware
app.use(errorHandler);

export default app;
