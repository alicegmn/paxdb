import express from "express";
import {
  registerDevice,
  assignRoomToDevice,
  getDeviceConfig,
  patchDeviceRoomData,
  getUnassignedDevices,
} from "../controllers/deviceConfigController";
import {
  checkDeviceExists,
  checkRoomAvailability,
} from "../middlewares/deviceHandler";
import asyncHandler from "../middlewares/asyncHandler";
import authenticateToken from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Config
 *   description: Manage device-room configuration
 *
 */
router.get(
  "/devices/unassigned",
  authenticateToken,
  asyncHandler(getUnassignedDevices)
);
/**
 * @swagger
 * /config/{serialNumber}:
 *   post:
 *     summary: Register a device
 *     tags: [DeviceConfig]
 *     parameters:
 *       - in: path
 *         name: serialNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Device registered successfully
 *       400:
 *         description: Invalid serial number
 *       500:
 *         description: Server error
 */

router.post(
  "/:serialNumber",
  authenticateToken,
  checkDeviceExists,
  asyncHandler(registerDevice)
);

/**
 * @swagger
 * /config/{serialNumber}:
 *   put:
 *     summary: Assign a room to a device
 *     tags: [DeviceConfig]
 *     parameters:
 *       - in: path
 *         name: serialNumber
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [room_id]
 *             properties:
 *               room_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Room assigned to device
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */

router.put(
  "/:serialNumber",
  authenticateToken,
  checkRoomAvailability,
  asyncHandler(assignRoomToDevice)
);

/**
 * @swagger
 * /config/{serialNumber}:
 *   get:
 *     summary: Get configuration for a device
 *     tags: [Config]
 *     parameters:
 *       - in: path
 *         name: serialNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Device configuration retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 device:
 *                   type: object
 *                 room:
 *                   type: object
 *       404:
 *         description: Device not found
 *       500:
 *         description: Server error
 */

router.get("/:serialNumber", authenticateToken, asyncHandler(getDeviceConfig));

router.patch(
  "/:serialNumber",
  authenticateToken,
  asyncHandler(patchDeviceRoomData)
);

export default router;
