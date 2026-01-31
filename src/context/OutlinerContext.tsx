import { createContext } from 'preact';
import { useContext, useMemo } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { Node, TagInfo } from '../types';
import { useOutliner } from '../hooks/useOutliner';
import { outlinerStore } from '../services/store';

interface OutlinerContextType {
  nodes: Node[];
  isLoading: boolean;
  tags: TagInfo[];
  actions: ReturnType<typeof useOutliner>['actions'];
}

const OutlinerContext = createContext<OutlinerContextType | undefined>(undefined);

export const OutlinerProvider = ({ children }: { children: ComponentChildren }) => {
  const { nodes, isLoading, actions } = useOutliner();
  const tags = outlinerStore.tags.value;

  const value = useMemo(
    () => ({
      nodes,
      isLoading,
      tags,
      actions
    }),
    [nodes, isLoading, actions, tags]
  );

  return <OutlinerContext.Provider value={value}>{children}</OutlinerContext.Provider>;
};

export const useOutlinerData = () => {
  const context = useContext(OutlinerContext);
  if (!context) throw new Error('useOutlinerData must be used within OutlinerProvider');
  return {
    nodes: context.nodes,
    isLoading: context.isLoading,
    tags: context.tags
  };
};

export const useOutlinerActions = () => {
  const context = useContext(OutlinerContext);
  if (!context) throw new Error('useOutlinerActions must be used within OutlinerProvider');
  return context.actions;
};
