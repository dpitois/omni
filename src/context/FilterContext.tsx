import { createContext, type ComponentChildren } from 'preact';
import { useContext } from 'preact/hooks';
import { useOutlinerFilter } from '../hooks/useOutlinerFilter';
import { useOutlinerData } from './OutlinerContext';
import type { Node } from '../types';

interface FilterState {
  activeTag: string | null;
  searchQuery: string;
  visibleNodesInfo: { node: Node; isDimmed: boolean; hasChildren: boolean }[];
  visibleNodes: Node[];
}

interface FilterActions {
  setActiveTag: (tag: string | null) => void;
  setSearchQuery: (query: string) => void;
}

const FilterStateContext = createContext<FilterState | undefined>(undefined);
const FilterActionsContext = createContext<FilterActions | undefined>(undefined);

export function FilterProvider({ children }: { children: ComponentChildren }) {
  const { nodes } = useOutlinerData();
  const filter = useOutlinerFilter(nodes);

  return (
    <FilterStateContext.Provider value={{
      activeTag: filter.activeTag,
      searchQuery: filter.searchQuery,
      visibleNodesInfo: filter.visibleNodesInfo,
      visibleNodes: filter.visibleNodes
    }}>
      <FilterActionsContext.Provider value={{
        setActiveTag: filter.setActiveTag,
        setSearchQuery: filter.setSearchQuery
      }}>
        {children}
      </FilterActionsContext.Provider>
    </FilterStateContext.Provider>
  );
}

export const useFilterState = () => {
  const context = useContext(FilterStateContext);
  if (!context) throw new Error('useFilterState must be used within FilterProvider');
  return context;
};

export const useFilterActions = () => {
  const context = useContext(FilterActionsContext);
  if (!context) throw new Error('useFilterActions must be used within FilterProvider');
  return context;
};
