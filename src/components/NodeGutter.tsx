import { ChevronRight, ChevronDown, Check, Minus } from 'lucide-preact';

interface NodeGutterProps {
  hasChildren: boolean;
  collapsed: boolean;
  checked: boolean;
  isIndeterminate: boolean;
  onToggleCollapse: () => void;
  onToggleCheck: () => void;
}

export function NodeGutter({ 
  hasChildren, collapsed, checked, isIndeterminate, onToggleCollapse, onToggleCheck 
}: NodeGutterProps) {
  return (
    <div className="flex items-start flex-shrink-0">
      {/* Folding Toggle / Bullet */}
      <div className="w-8 h-8 flex items-center justify-center relative">
         {hasChildren ? (
           <button 
            onClick={onToggleCollapse}
            className="p-0.5 rounded hover:bg-item-hover text-text-dim hover:text-text-main transition-all"
           >
             {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
           </button>
         ) : (
           <div className="w-1.5 h-1.5 rounded-full bg-text-dim/30 group-hover:bg-text-dim/60 transition-colors" />
         )}
         {collapsed && hasChildren && (
             <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500/20 text-blue-500 text-[10px] flex items-center justify-center rounded-full font-bold">
                +
             </div>
         )}
      </div>

      {/* Checkbox */}
      <div className="pt-2 px-1">
        <button 
          onClick={onToggleCheck}
          className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all duration-200
            ${checked 
              ? 'bg-blue-500 border-blue-500 text-white' 
              : isIndeterminate 
                ? 'bg-blue-500/30 border-blue-500 text-blue-500' 
                : 'border-border-subtle hover:border-text-dim bg-transparent'
            }
          `}
        >
          {checked && <Check size={12} strokeWidth={4} />}
          {isIndeterminate && !checked && <Minus size={10} strokeWidth={4} />}
        </button>
      </div>
    </div>
  );
}