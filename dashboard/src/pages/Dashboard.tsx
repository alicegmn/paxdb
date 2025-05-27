import { useState, useEffect } from "react";
import RoomCard from "@/components/RoomCard";
import { Room } from "../types/room";
import Button from "@/components/Button";
import CreateRoomModal from "@/components/CreateRoomModal";

const Dashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const API_BASE_URL = "https://paxdb.vercel.app";

  // // Mock room data
  // const [rooms, setRooms] = useState<Room[]>([
  //   {
  //     id: 1,
  //     name: "Stora Konferensrummet",
  //     description: "Rymligt rum med plats för 20 personer.",
  //     available: true,
  //     air_quality: 95,
  //     screen: true,
  //     floor: 2,
  //     chairs: 20,
  //     whiteboard: true,
  //     projector: true,
  //   },
  //   {
  //     id: 2,
  //     name: "Lilla Mötesrummet",
  //     description: "Perfekt för mindre möten.",
  //     available: false,
  //     air_quality: 87,
  //     screen: false,
  //     floor: 1,
  //     chairs: 6,
  //     whiteboard: false,
  //     projector: false,
  //   },
  //   {
  //     id: 3,
  //     name: "Workshoprummet",
  //     description: "Flexibelt rum med bra utrustning.",
  //     available: true,
  //     air_quality: 92,
  //     screen: true,
  //     floor: 3,
  //     chairs: 15,
  //     whiteboard: true,
  //     projector: false,
  //   },
  // ]);

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("Ingen token hittades i localStorage");
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/rooms`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
        const data = await res.json();
        console.log("Fetched rooms:", data);
        setRooms(data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
  }, []);

  // Create a new room
  const handleCreateRoom = async (roomData: Omit<Room, "id">) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("Ingen token hittades i localStorage");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      });

      if (!res.ok) throw new Error("Failed to create room");
      const newRoom = await res.json();
      setRooms((prev) => [...prev, newRoom]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  function getChangedFields<T>(original: T, updated: Partial<T>): Partial<T> {
    const changed: Partial<T> = {};
    for (const key in updated) {
      if (updated[key] !== original[key]) {
        changed[key] = updated[key];
      }
    }
    return changed;
  }

  const handleUpdateRoom = async (updatedRoomData: Partial<Room>) => {
    if (!editingRoom) {
      console.warn("Inget rum valt för redigering");
      return;
    }

    const changedFields = getChangedFields(editingRoom, updatedRoomData);

    if (Object.keys(changedFields).length === 0) {
      setIsModalOpen(false);
      setEditingRoom(null);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("Ingen token hittades i localStorage");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${editingRoom.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(changedFields),
      });

      if (!res.ok) throw new Error("Failed to update room");

      const updatedRoom = await res.json();
      setRooms((prev) =>
        prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r))
      );
    } catch (error) {
      console.error("Error updating room:", error);
    } finally {
      setEditingRoom(null);
      setIsModalOpen(false);
    }
  };


  // Delete a room
  const handleDeleteRoom = async (id: number) => {
    if (!window.confirm("Är du säker på att du vill ta bort detta rum?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("Ingen token hittades i localStorage");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete room");
      setRooms((prev) => prev.filter((room) => room.id !== id));
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };


  return (
    <main className="flex flex-col flex-grow bg-gray-300 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => setIsModalOpen(true)}>+ Skapa nytt rum</Button>
      </div>
      <h2 className="text-xl font-semibold mb-4">Alla rum</h2>
      {rooms.length === 0 ? (
        <p className="text-gray-500">Inga rum ännu. Skapa ett nytt rum!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={() => {
                setEditingRoom(room);
                setIsModalOpen(true);
              }}
              onDelete={() => handleDeleteRoom(room.id)}
            />
          ))}
        </div>
      )}
      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRoom(null);
        }}
        onCreate={handleCreateRoom}
        onEdit={handleUpdateRoom}
        roomToEdit={editingRoom || undefined}
      />
    </main>
  );
};

export default Dashboard;
