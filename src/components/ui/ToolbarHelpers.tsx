import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

export const ToolbarButton = ({
  onClick,
  icon: Icon,
  title,
  active = false,
  className = "",
}: {
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  active?: boolean;
  className?: string;
}) => (
  <button
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
    className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
      active ? "bg-slate-200 dark:bg-slate-700 text-primary" : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
    } ${className}`}
    title={title}
  >
    <Icon size={18} />
  </button>
);

export const ToolbarSelect = ({ value, onSelect, options, title }: { value: string; onSelect: (value: string) => void; options: { value: string; label: string }[]; title: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || value;

  return (
    <div className="relative" ref={containerRef} title={title}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-1.5 h-9 pl-3 pr-2 rounded-lg text-sm font-medium transition-all border border-transparent ${
          isOpen ? "bg-slate-200 dark:bg-slate-700 text-primary" : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
        }`}
      >
        <span className="truncate max-w-[100px] text-left">{selectedLabel}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 opacity-50 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-[140px] max-h-[300px] overflow-y-auto py-1 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onSelect(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                value === opt.value ? "bg-primary/5 text-primary font-medium" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span className={opt.value === value ? "font-semibold" : ""}>{opt.label}</span>
              {value === opt.value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const Divider = () => <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>;
