import React, { forwardRef } from "react";

interface EditorAreaProps {
  isFullScreen: boolean;
  handleComposition: (event: React.CompositionEvent<HTMLDivElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  handleKeyUp: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  updateStats: () => void;
  placeholder: string;
}

const EditorArea = forwardRef<HTMLDivElement, EditorAreaProps>(({ isFullScreen, handleComposition, handleKeyDown, handleKeyUp, updateStats, placeholder }, ref) => {
  return (
    <div
      ref={ref}
      contentEditable
      onCompositionStart={handleComposition}
      onCompositionUpdate={handleComposition}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onInput={updateStats}
      className={`w-full p-6 bg-white dark:bg-slate-800 text-xl sm:text-2xl font-khmer leading-relaxed outline-hidden overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 dark:empty:before:text-slate-500 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_a]:text-blue-500 [&_a]:underline [&_img]:max-w-full [&_img]:rounded-lg [&_img]:inline-block ${
        isFullScreen ? "flex-1 h-full" : "h-64 sm:h-80"
      }`}
      data-placeholder={placeholder}
      spellCheck={true}
    />
  );
});

EditorArea.displayName = "EditorArea";

export default EditorArea;
