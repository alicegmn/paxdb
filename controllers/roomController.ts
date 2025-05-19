import { Request, Response } from "express";
import pool from "../db/db"; // justera sökvägen om den är annorlunda hos dig

// GET all rooms
export const getAllRooms = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = await pool.query("SELECT * FROM rooms");
    res.status(200).json(data.rows);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).send("Internal Server Error");
  }
};

// GET one room by ID
export const getRoomById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query("SELECT * FROM rooms WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST create a new room
export const createRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    name,
    description,
    available,
    air_quality,
    screen,
    floor,
    chairs,
    whiteboard,
    projector,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO rooms 
        (name, description, available, air_quality, screen, floor, chairs, whiteboard, projector)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name,
        description,
        available,
        air_quality,
        screen,
        floor,
        chairs,
        whiteboard,
        projector,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).send("Error creating room");
  }
};

// PUT update room
export const updateRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id);
  const {
    name,
    description,
    available,
    air_quality,
    screen,
    floor,
    chairs,
    whiteboard,
    projector,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE rooms SET 
        name = $1,
        description = $2,
        available = $3,
        air_quality = $4,
        screen = $5,
        floor = $6,
        chairs = $7,
        whiteboard = $8,
        projector = $9
      WHERE id = $10
      RETURNING *`,
      [
        name,
        description,
        available,
        air_quality,
        screen,
        floor,
        chairs,
        whiteboard,
        projector,
        id,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Room not found" });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE room
export const deleteRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id);

  try {
    const result = await pool.query(
      "DELETE FROM rooms WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Room not found" });
      return;
    }

    res.status(200).json({ message: "Room deleted", room: result.rows[0] });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
