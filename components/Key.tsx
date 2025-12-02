import React from 'react';
import { KeyData } from '../types';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface KeyProps {
  data: KeyData;
  isShift: boolean;
  isActive: boolean;
  onPress: (data: KeyData) => void;
}

const Key: React.FC<KeyProps> = ({ data, isShift, isActive, onPress }) => {
  // Dynamic Styles
  const baseStyles = "relative flex items-center justify-center rounded-lg shadow-sm border-b-4 border-slate-300 dark:border-slate-900 transition-all duration-100 select-none active:border-b active:translate-y-[3px]";
  const activeStyles = isActive 
    ? "bg-primary text-white border-primary-hover dark:border-blue-900 translate-y-[2px] border-b-2" 
    : "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600";
  
  // Custom styling for special keys
  const isSpecial = data.type === 'action' || data.type === 'modifier';
  const fontSize = isSpecial ? 'text-sm font-medium' : 'text-xl font-khmer';

  // Render Icons if present
  const renderIcon = () => {
    if (data.icon === 'ChevronLeft') return <ChevronLeft size={20} />;
    if (data.icon === 'ChevronRight') return <ChevronRight size={20} />;
    if (data.icon === 'ChevronsUpDown') return (
        <div className="flex flex-col items-center justify-center -space-y-1">
            <ChevronUp size={16} />
            <ChevronDown size={16} />
        </div>
    );
    return null;
  };

  // Content Rendering
  let content;
  if (data.icon) {
    content = renderIcon();
  } else if (data.label) {
    content = <span>{data.label}</span>;
  } else {
    content = (
      <>
        {/* Khmer Character (Center/Primary) */}
        <span className={`z-10 ${isShift ? 'hidden' : 'block'}`}>{data.km}</span>
        <span className={`z-10 ${isShift ? 'block' : 'hidden'}`}>{data.kmShift}</span>

        {/* Top Left (Shift Char hint) */}
        <span className="absolute top-1 left-1.5 text-[0.65rem] opacity-60 font-khmer leading-none">
          {data.kmShift}
        </span>
        
        {/* Bottom Right (English Char hint) */}
        <span className="absolute bottom-1 right-1.5 text-[0.65rem] opacity-60 font-sans font-bold leading-none">
          {data.en}
        </span>
      </>
    );
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onPress(data);
  };
  
  // Use inline style for precise grid spanning
  const span = data.width || 2;

  return (
    <button
      onMouseDown={handleMouseDown}
      className={`${baseStyles} ${activeStyles} ${fontSize} h-14`}
      style={{ gridColumn: `span ${span} / span ${span}` }}
      type="button"
    >
      {content}
    </button>
  );
};

export default Key;