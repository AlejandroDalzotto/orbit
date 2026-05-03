import type { Movement } from "./movements";

export type Group = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
};

export type GroupWithMovements = Group & {
  movements: Movement[];
};

export type AddGroup = {
  name: string;
  description: string | null;
  movement_ids: number[];
};

export type UpdateGroup = {
  name: string;
  description?: string | null;
  movement_ids?: number[];
};
