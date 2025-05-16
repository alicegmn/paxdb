import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../../db/db";
import asyncHandler from "../middlewares/asyncHandler";
import { JwtPayload } from "jsonwebtoken";
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

// POST /auth/register
router.post(
  "/register",
  asyncHandler(async (req: Request, res: Response) => {
    const {
      username,
      password,
      role,
    }: { username: string; password: string; role?: string } = req.body;

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Ogiltig roll. Tillåtna roller är: admin, user, moderator.",
      });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "Användarnamnet är redan taget" });
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
      message: "Användare registrerad",
      token,
      user: newUser,
    });
  })
);

// POST /auth/login
router.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    const { username, password }: { username: string; password: string } =
      req.body;

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const dbUser: DbUser | undefined = result.rows[0];

    if (!dbUser) {
      return res
        .status(401)
        .json({ message: "Felaktiga inloggningsuppgifter" });
    }

    const isPasswordValid = await bcrypt.compare(password, dbUser.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Felaktiga inloggningsuppgifter" });
    }

    const token = jwt.sign(
      {
        id: dbUser.id,
        username: dbUser.username,
        role: dbUser.role,
      } as JwtPayload,
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Inloggning lyckades",
      token,
      role: dbUser.role,
    });
  })
);

export default router;
