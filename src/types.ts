export interface Node {
  id: string;
  text: string;
  level: number;
  checked: boolean;
  collapsed?: boolean; // New property
  parentId: string | null;
  updatedAt: number;
}