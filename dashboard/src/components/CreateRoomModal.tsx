import { FC, useState, useEffect } from "react";
import Button from "./Button";

type Room = {
    id: number;
    name: string;
    description?: string;
    available: boolean;
    air_quality: number;
    screen: boolean;
    floor: number;
    chairs: number;
    whiteboard: boolean;
    projector: boolean;
    temperature: number;
    activity: boolean;
};

type Device = {
    id: number;
    serial_number: string;
};

type CreateRoomModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (room: Omit<Room, "id">) => void;
    onEdit?: (room: Room) => void;
    roomToEdit?: Room;
};

const CreateRoomModal: FC<CreateRoomModalProps> = ({
    isOpen,
    onClose,
    onCreate,
    onEdit,
    roomToEdit,
}) => {
    const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
    const [form, setForm] = useState<Omit<Room, "id"> & { deviceId?: number | null }>({
        name: "",
        description: "",
        available: true,
        air_quality: 0,
        screen: false,
        floor: 0,
        chairs: 0,
        whiteboard: false,
        projector: false,
        temperature: 0,
        activity: false,
        deviceId: null,
    });

    // Hämta unassigned enheter när modalen öppnas
    useEffect(() => {
        if (!isOpen) return;

        const fetchDevices = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.warn("Ingen token hittades i localStorage");
                return;
            }

            try {
                const res = await fetch("https://paxdb.vercel.app/config/devices/unassigned", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error("Failed to fetch devices");
                const data: Device[] = await res.json();
                setAvailableDevices(data);
            } catch (error) {
                console.error("Error fetching devices:", error);
            }
        };

        fetchDevices();
    }, [isOpen]);

    // Sätt formvärden om vi redigerar rum
    useEffect(() => {
        if (roomToEdit) {
            const { id, ...rest } = roomToEdit;
            setForm((prev) => ({
                ...rest,
                deviceId: prev.deviceId ?? null,
            }));
        } else {
            setForm({
                name: "",
                description: "",
                available: true,
                air_quality: 0,
                screen: false,
                floor: 0,
                chairs: 0,
                whiteboard: false,
                projector: false,
                temperature: 0,
                activity: false,
                deviceId: null,
            });
        }
    }, [roomToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
        }));
    };

    const handleDeviceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const deviceId = value ? Number(value) : null;

        setForm((prev) => ({
            ...prev,
            deviceId,
        }));

        const token = localStorage.getItem("token");
        if (!token) {
            console.warn("Ingen token hittades i localStorage");
            return;
        }

        // Om vi redigerar befintligt rum (roomToEdit med id), koppla enheten direkt
        if (deviceId && roomToEdit?.id) {
            try {
                // Hitta device för serial_number
                const device = availableDevices.find(d => d.id === deviceId);
                if (!device) {
                    console.error("Device not found");
                    return;
                }

                const res = await fetch(`https://paxdb.vercel.app/config/${device.serial_number}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ roomId: roomToEdit.id }),
                });

                if (!res.ok) {
                    console.error("Failed to assign device to room");
                } else {

                    if (onEdit) {

                        const updatedRoom = { ...roomToEdit, deviceId };
                        onEdit(updatedRoom);
                    }
                }
            } catch (error) {
                console.error("Error assigning device to room:", error);
            }
        }
    };


    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.warn("Ingen token hittades i localStorage");
            return;
        }

        const room: Room = {
            id: roomToEdit?.id ?? Date.now(),
            ...form,
        };

        try {
            if (roomToEdit && onEdit) {
                await onEdit(room);
            } else if (onCreate) {
                await onCreate(room);
            }

            if (form.deviceId) {
                // Hitta device baserat på deviceId
                const device = availableDevices.find((d) => d.id === form.deviceId);
                if (!device) {
                    console.error("Device not found");
                    return;
                }

                const serialNumber = device.serial_number;

                const res = await fetch(`https://paxdb.vercel.app/config/${serialNumber}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ roomId: room.id }),
                });

                if (!res.ok) {
                    console.error("Failed to assign device to room");
                }
            }
            onClose();
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md space-y-4">
                <h2 className="text-xl font-semibold">{roomToEdit ? "Redigera rum" : "Skapa nytt rum"}</h2>

                {/* Namn */}
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Rum Namn
                    </label>
                    <input
                        id="name"
                        className="w-full border rounded p-2"
                        placeholder="Namn"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                    />
                </div>

                {/* Beskrivning */}
                <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Beskrivning
                    </label>
                    <textarea
                        id="description"
                        className="w-full border rounded p-2"
                        placeholder="Beskrivning"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                    />
                </div>

                {/* Våning, Stolar */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <label htmlFor="floor" className="block text-sm font-medium text-gray-700">
                            Våning
                        </label>
                        <input
                            id="floor"
                            type="number"
                            className="border rounded p-2"
                            placeholder="Våning"
                            name="floor"
                            value={form.floor}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="chairs" className="block text-sm font-medium text-gray-700">
                            Stolar
                        </label>
                        <input
                            id="chairs"
                            type="text"
                            className="border rounded p-2"
                            placeholder="Stolar"
                            name="chairs"
                            value={form.chairs}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Checkboxar: Skärm, Whiteboard, Projektor */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" name="screen" checked={form.screen} onChange={handleChange} />
                        <span>Skärm</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" name="whiteboard" checked={form.whiteboard} onChange={handleChange} />
                        <span>Whiteboard</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" name="projector" checked={form.projector} onChange={handleChange} />
                        <span>Projektor</span>
                    </label>
                </div>

                {roomToEdit && (
                    <div className="space-y-2">
                        <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700">
                            Välj enhet (unassigned)
                        </label>
                        <select
                            id="deviceId"
                            name="deviceId"
                            className="w-full border rounded p-2"
                            value={form.deviceId ?? ""}
                            onChange={handleDeviceChange}
                        >
                            <option value="">-- Välj enhet --</option>
                            {availableDevices.map((device) => (
                                <option key={device.id} value={device.id}>
                                    {device.serial_number}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Knapp för att skicka formuläret */}
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={onClose}>
                        Avbryt
                    </Button>
                    <Button onClick={handleSubmit}>{roomToEdit ? "Spara ändringar" : "Skapa"}</Button>
                </div>
            </div>
        </div>
    );
};

export default CreateRoomModal;
