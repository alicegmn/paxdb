import { Request, Response, NextFunction } from "express";
import pool from "../db";

export const checkDeviceExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { serialNumber } = req.params;
  try {
    const result = await pool.query(
      "SELECT 1 FROM device_configs WHERE serial_number = $1",
      [serialNumber]
    );
    if (result.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "Device with this serial number already exists" });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

export const checkRoomAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { roomId } = req.body;

  if (!roomId) {
    return res.status(400).json({ message: "roomId is required" });
  }

  try {
    // Kolla om det finns en enhet redan kopplad till det rummet
    const existingDevice = await pool.query(
      "SELECT serial_number FROM device_configs WHERE room_id = $1",
      [roomId]
    );

    if (existingDevice.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "Room already has a device assigned" });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to check room availability" });
  }
};
