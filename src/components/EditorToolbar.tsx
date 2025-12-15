import React from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  Copy,
  Trash2,
  Save,
  FolderOpen,
} from "lucide-react";
import { ToolbarButton, ToolbarSelect, Divider } from "./ui/ToolbarHelpers";

interface EditorToolbarProps {
  isFullScreen: boolean;
  onSave?: () => void;
  onOpenSidebar?: () => void;
  currentFont: string;
  onFontChange: (val: string) => void;
  currentSize: string;
  onSizeChange: (val: string) => void;
  onCommand: (cmd: string, val?: string) => void;
  onAddLink: () => void;
  onImageUpload: () => void;
  showInvisibles: boolean;
  toggleInvisibles: () => void;
  toggleFullScreen: () => void;
  onCopy: () => void;
  onClear: () => void;
  translations: Record<string, string>;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  isFullScreen,
  onSave,
  onOpenSidebar,
  currentFont,
  onFontChange,
  currentSize,
  onSizeChange,
  onCommand,
  onAddLink,
  onImageUpload,
  showInvisibles,
  toggleInvisibles,
  toggleFullScreen,
  onCopy,
  onClear,
  translations: t,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-0.5 sm:gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
      {isFullScreen && (
        <>
          <ToolbarButton onClick={onSave || (() => {})} icon={Save} title={t.save} />
          <ToolbarButton onClick={onOpenSidebar || (() => {})} icon={FolderOpen} title={t.docs} />
          <Divider />
        </>
      )}

      {/* Font & Size Selects */}
      <ToolbarSelect
        title={t.font}
        value={currentFont}
        onSelect={(val) => onFontChange(val)}
        options={[
          { value: "Kantumruy Pro", label: "Kantumruy Pro" },
          { value: "Noto Sans Khmer", label: "Noto Sans Khmer" },
          { value: "Inter", label: "Inter" },
        ]}
      />
      <ToolbarSelect
        title={t.size}
        value={currentSize}
        onSelect={(val) => onSizeChange(val)}
        options={[
          { value: "1", label: "10px" },
          { value: "2", label: "13px" },
          { value: "3", label: "16px" },
          { value: "4", label: "18px" },
          { value: "5", label: "24px" },
          { value: "6", label: "32px" },
          { value: "7", label: "48px" },
        ]}
      />

      <Divider />

      <ToolbarButton onClick={() => onCommand("bold")} icon={Bold} title={t.bold} />
      <ToolbarButton onClick={() => onCommand("italic")} icon={Italic} title={t.italic} />
      <ToolbarButton onClick={() => onCommand("underline")} icon={Underline} title={t.underline} />
      <ToolbarButton onClick={() => onCommand("strikeThrough")} icon={Strikethrough} title={t.strikethrough} />
      <ToolbarButton onClick={() => onCommand("backColor", "yellow")} icon={Highlighter} title={t.highlight} />

      <Divider />

      <ToolbarButton onClick={() => onCommand("justifyLeft")} icon={AlignLeft} title={t.alignLeft} />
      <ToolbarButton onClick={() => onCommand("justifyCenter")} icon={AlignCenter} title={t.alignCenter} />
      <ToolbarButton onClick={() => onCommand("justifyRight")} icon={AlignRight} title={t.alignRight} />
      <ToolbarButton onClick={() => onCommand("justifyFull")} icon={AlignJustify} title={t.justify} />

      <Divider />

      <ToolbarButton onClick={() => onCommand("insertUnorderedList")} icon={List} title={t.bulletList} />
      <ToolbarButton onClick={() => onCommand("insertOrderedList")} icon={ListOrdered} title={t.orderedList} />

      <Divider />

      <ToolbarButton onClick={onAddLink} icon={LinkIcon} title={t.insertLink} />
      <ToolbarButton onClick={onImageUpload} icon={ImageIcon} title={t.insertImage} />

      <Divider />

      <ToolbarButton onClick={toggleInvisibles} icon={showInvisibles ? Eye : EyeOff} title={showInvisibles ? t.hideInvisibles : t.showInvisibles} active={showInvisibles} />

      <ToolbarButton onClick={toggleFullScreen} icon={isFullScreen ? Minimize : Maximize} title={isFullScreen ? t.exitFullScreen : t.fullScreen} />

      <div className="flex-1 min-w-2.5"></div>

      <button
        onClick={onCopy}
        onMouseDown={(e) => e.preventDefault()}
        className="flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors ml-1"
        title={t.copy}
      >
        <Copy size={16} />
        <span className="hidden sm:inline">{t.copy}</span>
      </button>
      <button
        onClick={onClear}
        onMouseDown={(e) => e.preventDefault()}
        className="flex items-center justify-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
        title={t.clear}
      >
        <Trash2 size={16} />
        <span className="hidden sm:inline">{t.clear}</span>
      </button>
    </div>
  );
};

export default EditorToolbar;
