import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db";
import { JwtPayload } from "jsonwebtoken";
import asyncHandler from "../middlewares/asyncHandler";

const router = express.Router();

interface User {
  id: number;
  username: string;
  role: string;
}

interface DbUser extends User {
  password: string;
}

const allowedRoles = ["admin", "user", "moderator"];

// POST /register
router.post(
  "/register",
  asyncHandler(async (req: Request, res: Response) => {
    const {
      username,
      password,
      role,
    }: { username: string; password: string; role?: string } = req.body;

    // Validate role
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Allowed roles are: admin, user, moderator.",
      });
    }

    try {
      const existingUser = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      if (existingUser.rows.length > 0) {
        return res.status(409).json({ message: "Username is already taken" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role",
        [username, hashedPassword, role || "user"]
      );

      const newUser: User = result.rows[0];

      const token = jwt.sign(
        {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
        } as JwtPayload,
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: newUser,
      });
    } catch (err: any) {
      console.error("Registration error:", err);
      res
        .status(500)
        .json({ message: "Registration failed", error: err.message });
    }
  })
);

// POST /login
router.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    const { username, password }: { username: string; password: string } =
      req.body;

    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      const dbUser: DbUser | undefined = result.rows[0];

      if (!dbUser) {
        return res.status(401).json({ message: "Invalid login credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, dbUser.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid login credentials" });
      }

      const user: User = {
        id: dbUser.id,
        username: dbUser.username,
        role: dbUser.role,
      };

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role } as JwtPayload,
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      res.json({
        message: "Login successful",
        token,
        role: user.role,
      });
    } catch (err: any) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Login failed", error: err.message });
    }
  })
);

export default router;
