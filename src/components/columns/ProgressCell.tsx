import { useRef } from 'preact/hooks';

interface ProgressCellProps {
  value: number;
  isFocused: boolean;
  onUpdate: (val: number) => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onFocus: () => void;
}

export function ProgressCell({
  value,
  isFocused,
  onUpdate,
  onKeyDown,
  onFocus
}: ProgressCellProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleLocalKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onUpdate(Math.min(100, value + 5));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onUpdate(Math.max(0, value - 5));
    } else {
      onKeyDown(e);
    }
  };

  return (
    <div
      ref={ref}
      tabIndex={0}
      onKeyDown={handleLocalKeyDown}
      onFocus={onFocus}
      className={`w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full relative cursor-pointer outline-none group/slider transition-all ${isFocused ? 'ring-4 ring-blue-500/20 bg-black/20 dark:bg-white/20' : ''}`}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const val = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        onUpdate(val);
      }}
    >
      <div
        className={`h-full bg-blue-500 rounded-full transition-all duration-300`}
        style={{ width: `${value}%` }}
      />
      <div
        className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-500 transition-opacity ${isFocused ? 'opacity-100' : 'opacity-0 group-hover/slider:opacity-100'}`}
      >
        {value}%
      </div>
    </div>
  );
}
