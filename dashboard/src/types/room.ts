export type Room = {
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
};

export type Device = {
  id: number;
  name: string;
  assigned: boolean;
};