import express, { Request, Response } from "express";
import pool from "../db";
import asyncHandler from "../middlewares/asyncHandler";
import authenticateToken from "../middlewares/authMiddleware";

const router = express.Router();

interface Booking {
  id: number;
  room_id: number;
  user_id: number;
  start_time: string;
  end_time: string;
}

type CreateBookingInput = Omit<Booking, "id">;

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking system endpoints
 */

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings with room name and user email
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: A list of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   start_time:
 *                     type: string
 *                     format: date-time
 *                   end_time:
 *                     type: string
 *                     format: date-time
 *                   room_name:
 *                     type: string
 *                   user_email:
 *                     type: string
 *       500:
 *         description: Internal server error
 */

// GET all bookings with room name and user email
router.get(
  "/",
  authenticateToken,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await pool.query(`
      SELECT 
        b.id, b.start_time, b.end_time,
        r.name AS room_name,
        u.email AS user_email
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN users u ON b.user_id = u.id
    `);

    res.status(200).json(result.rows);
  })
);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get a booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking found
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */

// GET a single booking by ID
router.get(
  "/:id",
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM bookings WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json(result.rows[0]);
  })
);

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [room_id, user_id, start_time, end_time]
 *             properties:
 *               room_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Invalid room_id or user_id
 *       500:
 *         description: Internal server error
 */

// POST a new booking with foreign key validation
router.post(
  "/",
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { room_id, user_id, start_time, end_time }: CreateBookingInput =
      req.body;

    const roomCheck = await pool.query("SELECT id FROM rooms WHERE id = $1", [
      room_id,
    ]);
    if (roomCheck.rows.length === 0) {
      return res.status(400).json({ error: "Invalid room_id" });
    }

    const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [
      user_id,
    ]);
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: "Invalid user_id" });
    }

    const result = await pool.query(
      "INSERT INTO bookings (room_id, user_id, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *",
      [room_id, user_id, start_time, end_time]
    );

    res.status(201).json(result.rows[0]);
  })
);
/**
 * @swagger
 * /bookings/{id}:
 *   patch:
 *     summary: Update a booking (partial update)
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               room_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       400:
 *         description: Invalid room_id or user_id
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */

// PUT update booking
router.patch(
  "/:id",
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { room_id, user_id, start_time, end_time } = req.body;

    // Kontrollera om något alls skickats in
    if (!room_id && !user_id && !start_time && !end_time) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (room_id) {
      const roomCheck = await pool.query("SELECT id FROM rooms WHERE id = $1", [
        room_id,
      ]);
      if (roomCheck.rows.length === 0) {
        return res.status(400).json({ error: "Invalid room_id" });
      }
      updates.push("room_id = $" + (values.length + 1));
      values.push(room_id);
    }

    if (user_id) {
      const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [
        user_id,
      ]);
      if (userCheck.rows.length === 0) {
        return res.status(400).json({ error: "Invalid user_id" });
      }
      updates.push("user_id = $" + (values.length + 1));
      values.push(user_id);
    }

    if (start_time) {
      updates.push("start_time = $" + (values.length + 1));
      values.push(start_time);
    }

    if (end_time) {
      updates.push("end_time = $" + (values.length + 1));
      values.push(end_time);
    }

    values.push(id); // För WHERE-id

    const query = `UPDATE bookings SET ${updates.join(", ")} WHERE id = $${
      values.length
    } RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json(result.rows[0]);
  })
);

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Delete a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Booking deleted successfully
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */

// DELETE a booking
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM bookings WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(204).send();
  })
);

export default router;
