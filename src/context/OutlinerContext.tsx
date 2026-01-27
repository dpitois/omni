import { createContext, type ComponentChildren } from 'preact';
import { useContext, useMemo } from 'preact/hooks';
import { useOutliner } from '../hooks/useOutliner';
import { useTags } from '../hooks/useTags';
import type { Node } from '../types';

interface OutlinerData {
  nodes: Node[];
  tags: { name: string; count: number }[];
  isLoading: boolean;
}

interface OutlinerActions {
  addNode: (afterId: string) => string;
  updateNode: (id: string, updates: Partial<Node>) => void;
  updateMetadata: (id: string, columnId: string, value: any) => void;
  toggleCheck: (id: string) => void;
  toggleCollapse: (id: string) => void;
  deleteNode: (id: string) => void;
  indentNode: (id: string) => void;
  outdentNode: (id: string) => void;
  moveNodeUp: (id: string) => void;
  moveNodeDown: (id: string) => void;
  renameTag: (oldTag: string, newTag: string) => void;
}

const DataContext = createContext<OutlinerData | undefined>(undefined);
const ActionsContext = createContext<OutlinerActions | undefined>(undefined);

export function OutlinerProvider({ children }: { children: ComponentChildren }) {
  const { nodes, isLoading, ...actions } = useOutliner();
  const { tags } = useTags(nodes);

  const memoActions = useMemo(() => actions, []);

  return (
    <DataContext.Provider value={{ nodes, tags, isLoading }}>
      <ActionsContext.Provider value={memoActions}>
        {children}
      </ActionsContext.Provider>
    </DataContext.Provider>
  );
}

export const useOutlinerData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useOutlinerData must be used within OutlinerProvider');
  return context;
};

export const useOutlinerActions = () => {
  const context = useContext(ActionsContext);
  if (!context) throw new Error('useOutlinerActions must be used within OutlinerProvider');
  return context;
};
