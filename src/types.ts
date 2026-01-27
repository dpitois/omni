export interface Node {
  id: string;
  text: string;
  level: number;
  rank: number; // New field for ordering in IndexedDB
  checked: boolean;
  collapsed?: boolean;
  parentId: string | null;
  updatedAt: number;
}
