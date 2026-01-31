import { ProgressCell } from './ProgressCell';
import { DateCell, TextCell } from './GenericCells';
import type { ColumnType, MetadataValue } from '../../types';

interface RegistryProps {
  value: MetadataValue;
  isFocused: boolean;
  onUpdate: (value: MetadataValue) => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onFocus: () => void;
}

/**
 * Registry for column cell types.
 * Provides a central point for rendering different column types
 * based on the schema definition.
 */
export function renderCell(type: ColumnType, props: RegistryProps) {
  switch (type) {
    case 'progress':
      return (
        <ProgressCell
          value={typeof props.value === 'number' ? props.value : 0}
          isFocused={props.isFocused}
          onUpdate={props.onUpdate as (v: number) => void}
          onKeyDown={props.onKeyDown}
          onFocus={props.onFocus}
        />
      );

    case 'date':
      return (
        <DateCell
          value={typeof props.value === 'string' ? props.value : ''}
          onUpdate={props.onUpdate as (v: string) => void}
          onKeyDown={props.onKeyDown}
          onFocus={props.onFocus}
        />
      );

    case 'text':
    default:
      return (
        <TextCell
          value={typeof props.value === 'string' ? props.value : String(props.value ?? '')}
          onUpdate={props.onUpdate as (v: string) => void}
          onKeyDown={props.onKeyDown}
          onFocus={props.onFocus}
        />
      );
  }
}
