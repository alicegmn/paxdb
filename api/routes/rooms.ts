import express, { Request, Response } from "express";
import pool from "../db";
import asyncHandler from "../middlewares/asyncHandler";

const router = express.Router();

interface Room {
  id: number;
  name: string;
  description: string;
  available: boolean;
  air_quality: number;
  screen: boolean;
  floor: number;
  chairs: number;
  whiteboard: boolean;
  projector: boolean;
  temperature: number;
  activity: boolean;
  time: string;
  img: string;
}

type CreateRoomInput = Omit<Room, "id">;

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Room management endpoints
 */

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Get all rooms
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: A list of rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 */

// GET all rooms
router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await pool.query("SELECT * FROM rooms");
    res.status(200).json(result.rows);
  })
);

/**
 * @swagger
 * /rooms/{id}:
 *   get:
 *     summary: Get a room by ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Room found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       400:
 *         description: Invalid room ID
 *       404:
 *         description: Room not found
 */

// GET room by ID
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const result = await pool.query("SELECT * FROM rooms WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(result.rows[0]);
  })
);

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Create a new room
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoomInput'
 *     responses:
 *       201:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 */

// POST create new room
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
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
    } = req.body as CreateRoomInput;

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
  })
);

/**
 * @swagger
 * /rooms/{id}:
 *   patch:
 *     summary: Partially update a room by ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the room to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               available:
 *                 type: boolean
 *               air_quality:
 *                 type: number
 *               screen:
 *                 type: boolean
 *               floor:
 *                 type: integer
 *               chairs:
 *                 type: integer
 *               whiteboard:
 *                 type: boolean
 *               projector:
 *                 type: boolean
 *               temperature:
 *                 type: number
 *               activity:
 *                 type: boolean
 *               time:
 *                 type: string
 *               img:
 *                 type: string
 *           example:
 *             floor: 3
 *             available: false
 *     responses:
 *       200:
 *         description: Room updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       400:
 *         description: Invalid room ID or no valid fields provided
 *       404:
 *         description: Room not found
 */

// PATCH update room
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const fields = req.body;
    const allowedFields = [
      "name",
      "description",
      "available",
      "air_quality",
      "screen",
      "floor",
      "chairs",
      "whiteboard",
      "projector",
      "temperature",
      "activity",
      "time",
      "img",
    ];

    const updates = [];
    const values = [];
    let paramIndex = 1;

    for (const key of allowedFields) {
      if (key in fields) {
        updates.push(`${key} = $${paramIndex}`);
        values.push(fields[key]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No valid fields provided" });
    }

    values.push(id);
    const query = `UPDATE rooms SET ${updates.join(
      ", "
    )} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(result.rows[0]);
  })
);

/**
 * @swagger
 * /rooms/{id}:
 *   delete:
 *     summary: Delete a room
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 room:
 *                   $ref: '#/components/schemas/Room'
 *       400:
 *         description: Invalid room ID
 *       404:
 *         description: Room not found
 */

// DELETE room
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const result = await pool.query(
      "DELETE FROM rooms WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({ message: "Room deleted", room: result.rows[0] });
  })
);

export default router;
