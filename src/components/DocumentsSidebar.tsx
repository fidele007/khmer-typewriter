import React from "react";
import { FolderOpen, X, Trash2, Clock, FilePlus } from "lucide-react";

interface SavedDoc {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

interface DocumentsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  savedDocs: SavedDoc[];
  currentDocId: string | null;
  onLoad: (doc: SavedDoc) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onNew: () => void;
  translations: Record<string, string>;
  formatDate: (ts: number) => string;
}

const DocumentsSidebar: React.FC<DocumentsSidebarProps> = ({ isOpen, onClose, savedDocs, currentDocId, onLoad, onDelete, onNew, translations: t, formatDate }) => {
  return (
    <>
      {/* Sidebar Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-60 transition-opacity" onClick={onClose} />}

      {/* Documents Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-70 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderOpen size={20} className="text-primary" />
            {t.savedDocuments}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedDocs.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <p>{t.savedDocuments === "Saved Documents" ? "No saved documents." : "គ្មានឯកសារបានរក្សាទុក។"}</p>
            </div>
          ) : (
            savedDocs.map((doc) => (
              <div
                key={doc.id}
                className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                  currentDocId === doc.id
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : "border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-md bg-white dark:bg-slate-800"
                }`}
                onClick={() => onLoad(doc)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 text-sm leading-tight font-khmer">{doc.title}</h3>
                  <button
                    onClick={(e) => onDelete(e, doc.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title={t.delete}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <Clock size={12} />
                  {formatDate(doc.timestamp)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onNew}
            className="w-full py-2 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
          >
            <FilePlus size={18} />
            {t.newDocument}
          </button>
        </div>
      </div>
    </>
  );
};

export default DocumentsSidebar;
