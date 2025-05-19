import { Request, Response } from "express";
import pool from "../db/db"; // Justera sökväg om nödvändigt

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

// Create a new user
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { firstname, lastname, email, password, role } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO users (firstname, lastname, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, firstname, lastname, email, role`,
      [firstname, lastname, email, password, role || "user"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Error creating user" });
  }
};

// Get all users
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await pool.query(
      "SELECT id, firstname, lastname, email, role FROM users"
    );
    res.json(result.rows as User[]);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Error fetching users" });
  }
};

// Get a user by ID
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT id, firstname, lastname, email, role FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(result.rows[0] as User);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Error fetching user" });
  }
};

// Update a user
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { firstname, lastname, email, role } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET firstname = $1, lastname = $2, email = $3, role = $4
       WHERE id = $5 
       RETURNING id, firstname, lastname, email, role`,
      [firstname, lastname, email, role, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(result.rows[0] as User);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Error updating user" });
  }
};

// Delete a user
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, firstname, lastname, email, role",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ message: "User deleted", user: result.rows[0] as User });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Error deleting user" });
  }
};
