import express from "express";
import asyncHandler from "../middlewares/asyncHandler";
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  patchRoom,
  deleteRoom,
} from "../controllers/roomController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Room management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         available:
 *           type: boolean
 *         air_quality:
 *           type: integer
 *         screen:
 *           type: boolean
 *         floor:
 *           type: integer
 *         chairs:
 *           type: integer
 *         whiteboard:
 *           type: boolean
 *         projector:
 *           type: boolean
 *         temperature:
 *           type: integer
 *         activity:
 *           type: boolean
 *         time:
 *           type: string
 *         img:
 *           type: string
 *     CreateRoomInput:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - available
 *         - air_quality
 *         - screen
 *         - floor
 *         - chairs
 *         - whiteboard
 *         - projector
 *         - temperature
 *         - activity
 *         - time
 *         - img
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         available:
 *           type: boolean
 *         air_quality:
 *           type: integer
 *         screen:
 *           type: boolean
 *         floor:
 *           type: integer
 *         chairs:
 *           type: integer
 *         whiteboard:
 *           type: boolean
 *         projector:
 *           type: boolean
 *         temperature:
 *           type: integer
 *         activity:
 *           type: boolean
 *         time:
 *           type: string
 *         img:
 *           type: string
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
router.get("/", asyncHandler(getAllRooms));

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
router.get("/:id", asyncHandler(getRoomById));

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
router.post("/", asyncHandler(createRoom));

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
router.patch("/:id", asyncHandler(patchRoom));

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
router.delete("/:id", asyncHandler(deleteRoom));

export default router;
