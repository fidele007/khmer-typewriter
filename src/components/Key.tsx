import React from "react";
import type { KeyData } from "../lib/types";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

interface KeyProps {
  isKhmerMode: boolean;
  data: KeyData;
  isShift: boolean;
  isRightAlt: boolean;
  activeKeys: Set<string>;
  onPress: (data: KeyData) => void;
}

const Key: React.FC<KeyProps> = ({ isKhmerMode, data, isShift, isRightAlt, activeKeys, onPress }) => {
  // Common Styles
  const baseStyles = "relative flex items-center justify-center rounded-lg shadow-xs transition-all duration-100 select-none active:translate-y-[1px]";
  const normalKeyBase = "border-b-4 border-slate-300 dark:border-slate-900 active:border-b-2";

  const getActiveStyles = (isActive: boolean) => {
    return isActive
      ? "bg-primary text-white border-primary-hover dark:border-blue-900 translate-y-[2px] border-b-2"
      : "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600";
  };

  const span = data.width || 2;

  // --- Handle ArrowUpDown (Split Key) ---
  if (data.code === "ArrowUpDown") {
    const isUpActive = activeKeys.has("ArrowUp");
    const isDownActive = activeKeys.has("ArrowDown");

    return (
      <div className="flex flex-col gap-1 h-14" style={{ gridColumn: `span ${span} / span ${span}` }}>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            onPress({ ...data, code: "ArrowUp" });
          }}
          className={`flex-1 flex items-center justify-center rounded-t-md rounded-b-sm shadow-xs border-b-2 border-slate-300 dark:border-slate-900 active:border-b active:translate-y-[1px] ${
            isUpActive
              ? "bg-primary text-white border-primary-hover dark:border-blue-900"
              : "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600"
          }`}
        >
          <ChevronUp size={14} />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            onPress({ ...data, code: "ArrowDown" });
          }}
          className={`flex-1 flex items-center justify-center rounded-t-sm rounded-b-md shadow-xs border-b-2 border-slate-300 dark:border-slate-900 active:border-b active:translate-y-[1px] ${
            isDownActive
              ? "bg-primary text-white border-primary-hover dark:border-blue-900"
              : "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600"
          }`}
        >
          <ChevronDown size={14} />
        </button>
      </div>
    );
  }

  // --- Normal Keys ---

  const isActive =
    activeKeys.has(data.code) ||
    (data.code === "ShiftLeft" && isShift) ||
    (data.code === "ShiftRight" && isShift) ||
    (data.code === "AltRight" && isRightAlt) ||
    (data.code === "CapsLock" && activeKeys.has("CapsLock")); // CapsLock usually tracked via modifier state, but here simplified

  const activeStyleClass = getActiveStyles(isActive);

  // Custom styling for special keys
  const isSpecial = data.type === "action" || data.type === "modifier";
  const fontSize = isSpecial ? "text-sm font-medium" : "text-xl font-khmer";

  // Render Icons if present
  const renderIcon = () => {
    if (data.icon === "ChevronLeft") return <ChevronLeft size={20} />;
    if (data.icon === "ChevronRight") return <ChevronRight size={20} />;
    if (data.icon === "ChevronUp") return <ChevronUp size={20} />;
    if (data.icon === "ChevronDown") return <ChevronDown size={20} />;
    return null;
  };

  // Content Rendering
  let content;
  if (data.icon) {
    content = renderIcon();
  } else if (data.label) {
    content = <span>{data.label}</span>;
  } else {
    content = isKhmerMode ? (
      <>
        {/* Khmer Character (Center/Primary) */}
        <span className={`z-10 ${isShift || isRightAlt ? "hidden" : "block"}`}>{data.km}</span>
        <span className={`z-10 ${isShift ? "block" : "hidden"}`}>{data.kmShift}</span>
        <span className={`z-10 ${isRightAlt ? "block" : "hidden"}`}>{data.kmAlt}</span>

        {/* Top Left (AltGr Char hint) */}
        <span className="absolute top-1 left-1.5 text-[0.65rem] opacity-60 font-khmer leading-none">{data.kmAlt}</span>

        {/* Top Right (Shift Char hint) */}
        <span className="absolute top-1 right-1.5 text-[0.65rem] opacity-60 font-khmer leading-none">{data.kmShift}</span>

        {/* Bottom Right (English Char hint) */}
        <span className="absolute bottom-1 right-1.5 text-[0.65rem] opacity-60 font-sans font-bold leading-none">{data.en}</span>
      </>
    ) : (
      <>
        {/* English Character (Center/Primary) */}
        <span className={`z-10 ${isShift ? "hidden" : "block"}`}>{data.en}</span>
        <span className={`z-10 ${isShift ? "block" : "hidden"}`}>{data.enShift}</span>

        {/* Top Right (Shift Char hint) */}
        <span className="absolute top-1 right-1.5 text-[0.65rem] opacity-60 font-khmer leading-none">{data.enShift}</span>
      </>
    );
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onPress(data);
  };

  return (
    <button onMouseDown={handleMouseDown} className={`${baseStyles} ${normalKeyBase} ${activeStyleClass} ${fontSize} h-14`} style={{ gridColumn: `span ${span} / span ${span}` }} type="button">
      {content}
    </button>
  );
};

export default Key;
