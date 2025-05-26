import { Request, Response } from "express";
import pool from "../db";

export const registerDevice = async (req: Request, res: Response) => {
    const { serialNumber } = req.params;
    try {
        const result = await pool.query(
            `INSERT INTO device_configs (serial_number)
       VALUES ($1)
       ON CONFLICT DO NOTHING
       RETURNING *`,
            [serialNumber]
        );
        res.status(201).json({ message: "Device registered", data: result.rows[0] || {} });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Device registration failed" });
    }
};

export const assignRoomToDevice = async (req: Request, res: Response): Promise<void> => {
    const { serialNumber } = req.params;
    const { roomId } = req.body;
    try {
        await pool.query(
            `UPDATE device_configs
       SET room_id = $1
       WHERE serial_number = $2`,
            [roomId, serialNumber]
        );

        const roomResult = await pool.query(
            `SELECT air_quality, temperature, activity FROM rooms WHERE id = $1`,
            [roomId]
        );

        if (roomResult.rows.length === 0) {
            return res.status(404).json({ message: "Room not found" });
        }

        const roomData = roomResult.rows[0];

        res.json({
            message: "Room assigned",
            roomId,
            air_quality: roomData.air_quality,
            temperature: roomData.temperature,
            activity: roomData.activity,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Room assignment failed" });
    }
};

export const getUnassignedDevices = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT serial_number, id FROM device_configs WHERE room_id IS NULL`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch unassigned devices" });
    }
};

export const getDeviceConfig = async (req: Request, res: Response): Promise<void> => {
    const { serialNumber } = req.params;
    try {
        const deviceResult = await pool.query(
            `SELECT room_id FROM device_configs WHERE serial_number = $1`,
            [serialNumber]
        );

        const deviceRow = deviceResult.rows[0];
        if (!deviceRow || !deviceRow.room_id) {
            res.json({});
            return;
        }

        const roomId = deviceRow.room_id;

        const roomResult = await pool.query(
            `SELECT air_quality, temperature, activity FROM rooms WHERE id = $1`,
            [roomId]
        );

        if (roomResult.rows.length === 0) {
            res.json({});
            return;
        }

        const roomData = roomResult.rows[0];

        res.json({
            message: "Room assigned",
            roomId,
            air_quality: roomData.air_quality,
            temperature: roomData.temperature,
            activity: roomData.activity,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch config" });
    }
};

export const patchDeviceRoomData = async (req: Request, res: Response): Promise<void> => {
    const { serialNumber } = req.params;
    const updates = req.body;

    try {
        const deviceResult = await pool.query(
            "SELECT room_id FROM device_configs WHERE serial_number = $1",
            [serialNumber]
        );

        if (deviceResult.rows.length === 0 || !deviceResult.rows[0].room_id) {
            res.status(404).json({ message: "Device or room not found" });
            return;
        }

        const roomId = deviceResult.rows[0].room_id;

        if (typeof updates.activity === "boolean") {
            updates.available = !updates.activity;
        }

        const fields = Object.keys(updates);
        if (fields.length === 0) {
            res.status(400).json({ message: "No fields provided to update" });
            return;
        }

        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(", ");
        const values = fields.map((field) => updates[field]);
        values.push(roomId);

        const query = `UPDATE rooms SET ${setClause} WHERE id = $${values.length} RETURNING ${fields.join(", ")}`;
        const updateResult = await pool.query(query, values);

        res.json({
            message: "Room updated",
            roomId,
            ...updateResult.rows[0],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update room data" });
    }
};
