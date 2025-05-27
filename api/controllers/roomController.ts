import { Request, Response } from "express";
import pool from "../db";

export const getAllRooms = async (_req: Request, res: Response) => {
  const result = await pool.query("SELECT * FROM rooms");
  res.status(200).json(
    result.rows.map(room => ({
      ...room,
      time: new Date().toISOString(),
    }))
  );
};

export const getRoomById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid room ID" });

  const result = await pool.query("SELECT * FROM rooms WHERE id = $1", [id]);
  if (result.rows.length === 0)
    return res.status(404).json({ message: "Room not found" });

  const room = result.rows[0];
  res.status(200).json({
    ...room,
    time: new Date().toISOString(),
  });
};

export const createRoom = async (req: Request, res: Response) => {
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
    temperature,
    activity,
    time,
    img,
  } = req.body;

  const result = await pool.query(
    `INSERT INTO rooms 
      (name, description, available, air_quality, screen, floor, chairs, whiteboard, projector, temperature, activity, time, img)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
      temperature,
      activity,
      time,
      img,
    ]
  );

  res.status(201).json(result.rows[0]);
};

export const patchRoom = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid room ID" });

  const fields = Object.keys(req.body);
  if (fields.length === 0)
    return res.status(400).json({ message: "No fields to update" });

  const values = Object.values(req.body);
  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");

  const result = await pool.query(
    `UPDATE rooms SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
    [...values, id]
  );
  if (result.rows.length === 0)
    return res.status(404).json({ message: "Room not found" });

  res.status(200).json(result.rows[0]);
};

export const deleteRoom = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid room ID" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Frikoppla enheter från rummet
    await client.query(
      "UPDATE device_configs SET room_id = NULL WHERE room_id = $1",
      [id]
    );

    // Ta bort rummet
    const result = await client.query(
      "DELETE FROM rooms WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Room not found" });
    }

    await client.query("COMMIT");
    res.status(200).json({ message: "Room deleted", room: result.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting room:", error);
    res.status(500).json({ message: "Failed to delete room" });
  } finally {
    client.release();
  }
};
