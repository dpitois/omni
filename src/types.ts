export type ColumnType = 'text' | 'progress' | 'date';

export interface Column {
  id: string;
  label: string;
  type: ColumnType;
  width: string; // e.g., '1fr' or '120px'
}

export interface Node {
  id: string;
  text: string;
  level: number;
  rank: number;
  checked: boolean;
  collapsed?: boolean;
  parentId: string | null;
  updatedAt: number;
  metadata?: Record<string, any>; // For custom column data
}
