import { Calendar } from 'lucide-preact';

interface DateCellProps {
  value: string;
  onUpdate: (val: string) => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onFocus: () => void;
}

export function DateCell({ value, onUpdate, onKeyDown, onFocus }: DateCellProps) {
  return (
    <div className="relative w-full flex items-center group/date">
      <Calendar size={12} className={`absolute left-0 transition-colors ${value ? 'text-blue-500' : 'text-text-dim/30 group-hover/date:text-text-dim'}`} />
      <input 
          type="date"
          value={value}
          onInput={(e) => onUpdate(e.currentTarget.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          className="w-full bg-transparent border-none outline-none text-[11px] font-mono pl-5 text-text-main appearance-none cursor-pointer"
      />
    </div>
  );
}

interface TextCellProps {
  value: string;
  onUpdate: (val: string) => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onFocus: () => void;
}

import { Type } from 'lucide-preact';

export function TextCell({ value, onUpdate, onKeyDown, onFocus }: TextCellProps) {
  return (
    <div className="relative w-full flex items-center group/textcol">
      <Type size={12} className="absolute left-0 text-text-dim/20 group-hover/textcol:text-text-dim/40 transition-colors" />
      <input 
          type="text"
          placeholder="..."
          value={value}
          onInput={(e) => onUpdate(e.currentTarget.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          className="w-full bg-transparent border-none outline-none text-[11px] pl-5 text-text-main placeholder:text-text-dim/20"
      />
    </div>
  );
}
