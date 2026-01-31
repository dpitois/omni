export type UIMode = 'normal' | 'insert' | 'command';

export type ColumnType = 'text' | 'progress' | 'date';

export interface Column {
  id: string;
  label: string;
  type: ColumnType;
  width: string;
}

export type MetadataValue = string | number | boolean | null;

export interface Node {
  id: string;
  text: string;
  level: number;
  rank: number;
  checked: boolean;
  collapsed: boolean;
  parentId: string | null;
  updatedAt: number;
  docId: string;
  metadata: Record<string, MetadataValue>;
}

export interface TagInfo {
  name: string;
  count: number;
}

export interface SavedFilter {
  id: string;
  label: string;
  query: string;
  tags: string[];
  docId: string;
}
