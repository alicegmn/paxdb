import { Request, Response } from "express";
import pool from "../db";

export const createUser = async (req: Request, res: Response) => {
  const { name, surname, email, password, role } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO users (name, surname, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, surname, email, password, role`,
      [name, surname, email, password, role || "user"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Error creating user" });
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, name, surname, email, role FROM users"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Error fetching users" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT id, name, surname, email, role FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Error fetching user" });
  }
};

export const patchUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const fields = ["name", "surname", "email", "role"];
  const updates: string[] = [];
  const values: any[] = [];

  fields.forEach((field, index) => {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = $${values.length + 1}`);
      values.push(req.body[field]);
    }
  });

  if (updates.length === 0) {
    return res
      .status(400)
      .json({ error: "No valid fields provided to update" });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${
        values.length + 1
      } RETURNING id, name, surname, email, role`,
      [...values, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error patching user:", err);
    res.status(500).json({ error: "Error patching user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, name, surname, email, password, role",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted", user: result.rows[0] });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Error deleting user" });
  }
};
