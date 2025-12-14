import "./App.css";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Copy,
  Trash2,
  Moon,
  Sun,
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
  Image as ImageIcon,
  Link as LinkIcon,
  Globe,
  Languages,
  Maximize,
  Minimize,
  Save,
  FolderOpen,
  FilePlus,
  Eye,
  EyeOff,
  X,
  Clock,
  Edit2,
} from "lucide-react";
import VirtualKeyboard from "./components/VirtualKeyboard";
import { KEYBOARD_LAYOUT } from "./lib/constants";
import type { KeyboardState, KeyData } from "./lib/types";

interface SavedDoc {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

const App: React.FC = () => {
  // --- State ---
  const [textContent, setTextContent] = useState("");
  const [docTitle, setDocTitle] = useState("New Document");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isKhmerMode, setIsKhmerMode] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showInvisibles, setShowInvisibles] = useState(false);

  // Document Management State
  const [savedDocs, setSavedDocs] = useState<SavedDoc[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);

  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isShift: false,
    isRightAlt: false,
    isCaps: false,
    activeKeys: new Set(),
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Initialization & Effects ---

  // Flatten keyboard layout for O(1) lookup
  const keyMap = useMemo(() => {
    const map = new Map<string, KeyData>();
    KEYBOARD_LAYOUT.flat().forEach((key) => map.set(key.code, key));
    return map;
  }, []);

  // Load Saved Docs from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem("khmer-typewriter-docs");
    if (stored) {
      try {
        setSavedDocs(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved docs", e);
      }
    }
  }, []);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Warn users before refresh
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // required for Safari
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // Statistics
  const charCount = textContent.length;
  // Simple word count approximation for mixed text
  const wordCount = textContent.trim() === "" ? 0 : textContent.trim().split(/\s+/).length;

  const updateStats = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      setTextContent(text);
    }
  };

  // --- Document Logic ---

  const saveDocsToStorage = (docs: SavedDoc[]) => {
    localStorage.setItem("khmer-typewriter-docs", JSON.stringify(docs));
  };

  const createNewDocument = () => {
    if (textContent.trim().length > 0) {
      if (!window.confirm("Start a new document? Unsaved changes will be lost.")) {
        return;
      }
    }

    if (editorRef.current) {
      editorRef.current.innerHTML = "";
      updateStats();
    }
    setCurrentDocId(null);
    setDocTitle("New Document");
    setShowInvisibles(false); // Reset view mode
    if (isSidebarOpen) setIsSidebarOpen(false);
  };

  const saveDocument = () => {
    if (!editorRef.current) return;

    // Ask for document name
    const inputName = prompt("Enter document name:", docTitle);
    const finalTitle = inputName !== null && inputName.trim() !== "" ? inputName.trim() : docTitle;
    setDocTitle(finalTitle);

    // Ensure we save the 'raw' content without visual helpers for invisibles
    let contentToSave = editorRef.current.innerHTML;
    if (showInvisibles) {
      // Strip the visual spans before saving
      contentToSave = contentToSave.replace(/<span class="invisible-zwsp"[^>]*><\/span>/g, "\u200b");
    }

    // eslint-disable-next-line react-hooks/purity
    const timestamp = Date.now();

    let updatedDocs: SavedDoc[];

    if (currentDocId) {
      // Update existing
      updatedDocs = savedDocs.map((doc) => (doc.id === currentDocId ? { ...doc, title: finalTitle, content: contentToSave, timestamp } : doc));
    } else {
      // Create new
      const newId = crypto.randomUUID();
      const newDoc: SavedDoc = {
        id: newId,
        title: finalTitle,
        content: contentToSave,
        timestamp,
      };
      updatedDocs = [newDoc, ...savedDocs];
      setCurrentDocId(newId);
    }

    setSavedDocs(updatedDocs);
    saveDocsToStorage(updatedDocs);
  };

  const loadDocument = (doc: SavedDoc) => {
    if (textContent.trim().length > 0 && doc.id !== currentDocId) {
      if (!window.confirm("Load document? Current unsaved changes might be lost.")) {
        return;
      }
    }

    if (editorRef.current) {
      editorRef.current.innerHTML = doc.content;
      // If invisibles mode is ON, we need to re-apply the visualization
      if (showInvisibles) {
        applyInvisiblesVisuals();
      }
      updateStats();
    }
    setCurrentDocId(doc.id);
    setDocTitle(doc.title);
    setIsSidebarOpen(false);
  };

  const deleteDocument = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this document?")) {
      const updatedDocs = savedDocs.filter((doc) => doc.id !== id);
      setSavedDocs(updatedDocs);
      saveDocsToStorage(updatedDocs);

      if (currentDocId === id) {
        setCurrentDocId(null);
        setDocTitle("New Document");
        // We do not clear content, treating it as an unsaved draft of the deleted file
      }
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString() + " " + new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // --- Invisible Characters Logic ---

  const applyInvisiblesVisuals = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    if (!html.includes("invisible-zwsp")) {
      const newHtml = html.replace(/\u200b/g, '<span class="invisible-zwsp" contenteditable="false"></span>');
      if (newHtml !== html) {
        editorRef.current.innerHTML = newHtml;
      }
    }
  };

  const removeInvisiblesVisuals = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const newHtml = html.replace(/<span class="invisible-zwsp"[^>]*><\/span>/g, "\u200b");
    if (newHtml !== html) {
      editorRef.current.innerHTML = newHtml;
    }
  };

  const toggleInvisibles = () => {
    const newState = !showInvisibles;
    setShowInvisibles(newState);

    if (newState) {
      applyInvisiblesVisuals();
    } else {
      removeInvisiblesVisuals();
    }
    editorRef.current?.focus();
  };

  // --- Editor Commands ---

  const executeCommand = useCallback((command: string, value: string | undefined = undefined) => {
    if (document.activeElement !== editorRef.current) {
      editorRef.current?.focus();
    }
    document.execCommand(command, false, value);
    updateStats();
  }, []);

  // --- Keyboard Handling ---
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOSWebKit = (): boolean => {
    if (typeof navigator === "undefined") return false;

    const ua = navigator.userAgent;
    const platform = navigator.platform;
    const maxTouchPoints = navigator.maxTouchPoints || 0;

    // iPhone, iPod, iPad (iPadOS 13+ reports as MacIntel)
    const isIOS = /iP(ad|hone|od)/.test(ua) || (platform === "MacIntel" && maxTouchPoints > 1);

    return isIOS;
  };

  const insertCharacter = useCallback(
    (char: string) => {
      if (document.activeElement !== editorRef.current) {
        editorRef.current?.focus();
      }

      // If we are in "Show Invisibles" mode and inserting a ZWSP (\u200b),
      // we should insert the visual span instead of the raw char to maintain consistency
      if (showInvisibles && char === "\u200b") {
        const spanHTML = '<span class="invisible-zwsp" contenteditable="false"></span>';
        document.execCommand("insertHTML", false, spanHTML);
      } else {
        document.execCommand("insertText", false, char);
      }

      updateStats();
    },
    [showInvisibles]
  );

  const deleteCharacter = useCallback(() => {
    if (document.activeElement !== editorRef.current) {
      editorRef.current?.focus();
    }
    document.execCommand("delete");
    updateStats();
  }, []);

  const findParentSpan = (node: Node, root: HTMLElement): HTMLSpanElement | null => {
    while (node && node !== root) {
      if (node.nodeType === 1 && node instanceof HTMLElement && node.tagName === "SPAN") {
        return node as HTMLSpanElement;
      }
      node = node.parentNode as Node;
    }
    return null;
  };

  const placeCaretAfter = (node: Node) => {
    const range = document.createRange();
    const sel = window.getSelection()!;

    if (node.nodeType === Node.TEXT_NODE) {
      range.setStart(node, node.textContent?.length ?? 0);
    } else {
      range.setStartAfter(node);
    }

    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const deleteSpan = useCallback((span: HTMLSpanElement) => {
    const parent = span.parentNode!;
    let caretNode: Node | null = span.previousSibling;

    span.remove();

    if (!caretNode) {
      caretNode = parent;
    }

    placeCaretAfter(caretNode);
  }, []);

  const isCaretAtStartOfSpan = (range: Range, span: Node) => {
    // Caret is inside a text node inside span
    if (range.startContainer !== span && span.contains(range.startContainer)) {
      return range.startOffset === 0;
    }

    // Caret directly inside span (no text node)
    if (range.startContainer === span && range.startOffset === 0) {
      return true;
    }

    return false;
  };

  function getPreviousSiblingSpan(node: Node, offset: number): HTMLSpanElement | null {
    // caret inside text node
    if (node.nodeType === Node.TEXT_NODE) {
      if (offset > 0) return null;

      let prev = node.previousSibling;
      while (prev) {
        if (prev instanceof HTMLElement && prev.tagName === "SPAN") {
          return prev as HTMLSpanElement;
        }
        prev = prev.previousSibling;
      }
      return null;
    }

    // caret inside element
    if (node instanceof HTMLElement) {
      const prev = node.childNodes[offset - 1];
      if (prev instanceof HTMLElement && prev.tagName === "SPAN") {
        return prev as HTMLSpanElement;
      }
    }

    return null;
  }

  const deleteSpanIfPossible = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (document.activeElement !== editorRef.current) {
        editorRef.current?.focus();
      }
      const selection = window.getSelection();
      if (!selection?.rangeCount) return;
      const range = selection.getRangeAt(0);
      if (!range.collapsed) return;

      const node = range.startContainer;
      const offset = range.startOffset;

      const parentSpan = findParentSpan(node, editorRef.current!);
      if (parentSpan) {
        if (isCaretAtStartOfSpan(range, parentSpan)) {
          e.preventDefault();
          deleteSpan(parentSpan);
          updateStats();
        }
        return;
      }

      // Try deleting previous span if caret is immediately after it
      const prevSpan = getPreviousSiblingSpan(node, offset);
      if (prevSpan) {
        e.preventDefault();
        deleteSpan(prevSpan);
        updateStats();
      }
    },
    [deleteSpan]
  );

  const insertParagraph = useCallback(() => {
    if (document.activeElement !== editorRef.current) {
      editorRef.current?.focus();
    }
    document.execCommand("insertParagraph");
    updateStats();
  }, []);

  const moveCursor = useCallback((direction: "forward" | "backward", granularity: "character" | "line") => {
    if (document.activeElement !== editorRef.current) {
      editorRef.current?.focus();
    }
    const selection = window.getSelection();
    // Using non-standard but widely supported selection.modify
    if (selection?.modify) {
      selection.modify("move", direction, granularity);
      updateStats(); // Update logic dependent on cursor pos if needed
    }
  }, []);

  const handleVirtualKeyPress = (keyData: KeyData) => {
    if (keyData.code === "ShiftLeft" || keyData.code === "ShiftRight") {
      setKeyboardState((prev) => ({ ...prev, isShift: !prev.isShift }));
      return;
    }

    if (keyData.code === "AltRight") {
      setKeyboardState((prev) => ({ ...prev, isRightAlt: !prev.isRightAlt }));
      return;
    }

    if (keyData.code === "CapsLock") {
      setKeyboardState((prev) => ({ ...prev, isCaps: !prev.isCaps }));
      return;
    }

    if (keyData.code === "Backspace") {
      deleteCharacter();
      return;
    }

    // if (keyData.code === "Space") {
    //   insertCharacter(" ");
    //   return;
    // }

    if (keyData.code === "Tab") {
      insertCharacter("\t");
      return;
    }

    if (keyData.code === "Enter") {
      insertParagraph();
      return;
    }

    if (keyData.code === "ArrowLeft") {
      moveCursor("backward", "character");
      return;
    }
    if (keyData.code === "ArrowRight") {
      moveCursor("forward", "character");
      return;
    }
    if (keyData.code === "ArrowUp") {
      moveCursor("backward", "line");
      return;
    }
    if (keyData.code === "ArrowDown") {
      moveCursor("forward", "line");
      return;
    }

    if (keyData.type === "modifier" || keyData.type === "action") {
      return;
    }

    // Insert Character Logic
    const isNumberRow = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal"].includes(keyData.code);
    let charToInsert;
    if (keyboardState.isShift || (keyboardState.isCaps && !isNumberRow)) {
      charToInsert = keyData.kmShift;
    } else if (keyboardState.isRightAlt) {
      charToInsert = keyData.kmAlt;
    } else {
      charToInsert = keyData.km;
    }

    if (charToInsert) {
      insertCharacter(charToInsert);
      if (keyboardState.isShift) {
        setKeyboardState((prev) => ({ ...prev, isShift: false }));
      }

      if (keyboardState.isRightAlt) {
        setKeyboardState((prev) => ({ ...prev, isRightAlt: false }));
      }
    }
  };

  // Physical Keyboard Handling
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // console.log("handleKeyDown", e);

      const code = e.code;
      const isRightAlt = e.getModifierState("AltGraph") || e.altKey;

      // Update visual state
      setKeyboardState((prev) => {
        const newActive = new Set(prev.activeKeys);
        newActive.add(code);

        let newShift = prev.isShift;
        if (code === "ShiftLeft" || code === "ShiftRight") {
          newShift = true;
        }

        let newRightAlt = prev.isRightAlt;
        if (isRightAlt) {
          newRightAlt = true;
          // On many keyboard layouts, AltGr is internally treated by the OS as a combination of Ctrl+Alt
          // So we need to remove the "ControlLeft" key from the active keys for visual consistency
          newActive.delete("ControlLeft");
        }

        return {
          ...prev,
          activeKeys: newActive,
          isShift: newShift,
          isRightAlt: newRightAlt,
        };
      });

      // Auto-focus logic
      if (document.activeElement !== editorRef.current && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        editorRef.current?.focus();
      }

      // IME Logic
      if (isKhmerMode && !e.ctrlKey) {
        const keyData = keyMap.get(code);
        if (keyData) {
          const isTypingKey = (!keyData.type || keyData.type === "char") && (keyData.km || keyData.kmShift || keyData.kmAlt);

          if (isTypingKey) {
            e.preventDefault();

            const isShift = e.shiftKey;
            const isCaps = e.getModifierState("CapsLock");
            const isNumberRow = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal"].includes(code);

            let char;
            if (isShift || (isCaps && !isNumberRow)) {
              char = keyData.kmShift;
            } else if (isRightAlt || e.metaKey) {
              char = keyData.kmAlt;
            } else {
              char = keyData.km;
            }

            // console.log("char", char);
            if (char) {
              if (e.key === "Dead" && isKhmerMode && (isSafari || isIOSWebKit())) {
                setTimeout(() => {
                  insertCharacter(char);
                });
              } else {
                insertCharacter(char);
              }
            }
          }
        }
      }

      if (e.key === "Backspace" && !isRightAlt && !e.metaKey && !e.ctrlKey) {
        deleteSpanIfPossible(e);
      }

      setTimeout(() => {
        if (editorRef.current) {
          updateStats();
        }
      }, 0);
    },
    [isKhmerMode, keyMap, isSafari, insertCharacter, deleteSpanIfPossible]
  );

  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const code = e.code;
    if (code === "CapsLock") {
      setKeyboardState((prev) => ({ ...prev, isCaps: e.getModifierState("CapsLock") }));
    }
    setKeyboardState((prev) => {
      const newActive = new Set(prev.activeKeys);
      newActive.delete(code);

      let newShift = prev.isShift;
      if (code === "ShiftLeft" || code === "ShiftRight") {
        newShift = false;
      }

      let newRightAlt = prev.isRightAlt;
      if (!e.getModifierState("AltGraph") && !e.altKey) {
        newRightAlt = false;
      }

      return { ...prev, activeKeys: newActive, isShift: newShift, isRightAlt: newRightAlt };
    });
  }, []);

  const handleComposition = useCallback(
    (event: React.CompositionEvent<HTMLDivElement>) => {
      // console.log(`${event.type}: ${event.data}`);
      if (isKhmerMode && isMac) {
        (event.target as HTMLElement)?.setAttribute("contentEditable", "false");
        setTimeout(function () {
          (event.target as HTMLElement)?.setAttribute("contentEditable", "true");
          if (document.activeElement !== editorRef.current) {
            editorRef.current?.focus();
          }
        });
      }
    },
    [isKhmerMode, isMac]
  );

  const handleInput = useCallback((_event: React.InputEvent<HTMLDivElement>) => {
    // console.log("handleInput", event);
  }, []);

  // --- Toolbar Actions ---

  const copyToClipboard = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      navigator.clipboard.writeText(text);
    }
  };

  const clearText = () => {
    if (window.confirm("Are you sure you want to clear all text?")) {
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
        updateStats();
        editorRef.current.focus();
      }
    }
  };

  const addLink = () => {
    const url = prompt("Enter the URL:");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        executeCommand("insertImage", result);
      };
      reader.readAsDataURL(file);
    }
    if (event.target) event.target.value = "";
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const ToolbarButton = ({ onClick, icon: Icon, title, active = false, className = "" }: { onClick: () => void; icon: React.ElementType; title: string; active?: boolean; className?: string }) => (
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

  const Divider = () => <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>;

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

      {/* Sidebar Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-60 transition-opacity" onClick={() => setIsSidebarOpen(false)} />}

      {/* Documents Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-70 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderOpen size={20} className="text-primary" />
            Saved Documents
          </h2>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedDocs.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <p>No saved documents.</p>
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
                onClick={() => loadDocument(doc)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 text-sm leading-tight font-khmer">{doc.title}</h3>
                  <button
                    onClick={(e) => deleteDocument(e, doc.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete"
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
            onClick={createNewDocument}
            className="w-full py-2 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
          >
            <FilePlus size={18} />
            New Document
          </button>
        </div>
      </div>

      {/* Header */}
      {!isFullScreen && (
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 text-primary flex items-center justify-center bg-primary/10 rounded-lg">
              {/* <Keyboard size={20} /> */}
              <img src="./khmer-typewriter.svg" alt="Khmer Typewriter" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">Khmer Typewriter</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Document Controls (Desktop) */}
            <div className="flex items-center gap-2 mr-2">
              <button
                onClick={saveDocument}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                title="Save Document"
              >
                <Save size={20} />
                <span className="text-sm font-medium hidden lg:inline">Save</span>
              </button>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 relative"
                title="My Documents"
              >
                <FolderOpen size={20} />
                <span className="text-sm font-medium hidden lg:inline">Docs</span>
                {savedDocs.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>}
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

            {/* Keyboard Mode Toggle */}
            <button
              onClick={() => setIsKhmerMode(!isKhmerMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isKhmerMode ? "bg-primary/10 text-primary border border-primary/20" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent"
              }`}
              title={isKhmerMode ? "Switch to System Keyboard" : "Switch to Khmer Keyboard"}
            >
              {isKhmerMode ? <Languages size={18} /> : <Globe size={18} />}
              <span className="hidden sm:inline">{isKhmerMode ? "Khmer" : "System"}</span>
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-500 hover:text-primary transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 w-full mx-auto flex flex-col ${isFullScreen ? "" : "max-w-5xl p-4 sm:p-6 lg:p-8 gap-6"}`}>
        {!isFullScreen && (
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center gap-2">
              <input
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight bg-transparent border-none focus:ring-0 p-0 placeholder-slate-400 w-full"
                placeholder="Document Title"
              />
              <Edit2 size={20} className="text-slate-400 opacity-50 shrink-0" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              {currentDocId ? "Saved Document" : "Unsaved Draft"}
              {currentDocId && <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Saved</span>}
            </p>
          </div>
        )}

        {/* Editor Container */}
        <div
          className={`flex flex-col bg-white dark:bg-slate-800 overflow-hidden transition-all ${
            isFullScreen
              ? "fixed inset-0 z-50 h-screen w-screen border-0 rounded-none"
              : "border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"
          }`}
        >
          {/* Formatting Toolbar */}
          <div className="flex flex-wrap items-center gap-0.5 sm:gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            {isFullScreen && (
              <>
                <ToolbarButton onClick={saveDocument} icon={Save} title="Save" />
                <ToolbarButton onClick={() => setIsSidebarOpen(true)} icon={FolderOpen} title="Docs" />
                <Divider />
              </>
            )}

            <ToolbarButton onClick={() => executeCommand("bold")} icon={Bold} title="Bold" />
            <ToolbarButton onClick={() => executeCommand("italic")} icon={Italic} title="Italic" />
            <ToolbarButton onClick={() => executeCommand("underline")} icon={Underline} title="Underline" />
            <ToolbarButton onClick={() => executeCommand("strikeThrough")} icon={Strikethrough} title="Strikethrough" />
            <ToolbarButton onClick={() => executeCommand("backColor", "yellow")} icon={Highlighter} title="Highlight" />

            <Divider />

            <ToolbarButton onClick={() => executeCommand("justifyLeft")} icon={AlignLeft} title="Align Left" />
            <ToolbarButton onClick={() => executeCommand("justifyCenter")} icon={AlignCenter} title="Align Center" />
            <ToolbarButton onClick={() => executeCommand("justifyRight")} icon={AlignRight} title="Align Right" />
            <ToolbarButton onClick={() => executeCommand("justifyFull")} icon={AlignJustify} title="Justify" />

            <Divider />

            <ToolbarButton onClick={() => executeCommand("insertUnorderedList")} icon={List} title="Bullet List" />
            <ToolbarButton onClick={() => executeCommand("insertOrderedList")} icon={ListOrdered} title="Numbered List" />

            <Divider />

            <ToolbarButton onClick={addLink} icon={LinkIcon} title="Insert Link" />
            <ToolbarButton onClick={triggerImageUpload} icon={ImageIcon} title="Insert Image" />

            <Divider />

            <ToolbarButton onClick={toggleInvisibles} icon={showInvisibles ? Eye : EyeOff} title={showInvisibles ? "Hide Invisible Characters" : "Show Invisible Characters"} active={showInvisibles} />

            <ToolbarButton onClick={toggleFullScreen} icon={isFullScreen ? Minimize : Maximize} title={isFullScreen ? "Exit Full Screen" : "Full Screen"} />

            <div className="flex-1 min-w-2.5"></div>

            <button
              onClick={copyToClipboard}
              onMouseDown={(e) => e.preventDefault()}
              className="flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors ml-1"
              title="Copy text"
            >
              <Copy size={16} />
              <span className="hidden sm:inline">Copy</span>
            </button>
            <button
              onClick={clearText}
              onMouseDown={(e) => e.preventDefault()}
              className="flex items-center justify-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
              title="Clear all"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>

          {/* WYSIWYG Area */}
          <div
            ref={editorRef}
            contentEditable
            onCompositionStart={handleComposition}
            onCompositionUpdate={handleComposition}
            onBeforeInput={handleInput}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onInput={updateStats}
            className={`w-full p-6 bg-white dark:bg-slate-800 text-xl sm:text-2xl font-khmer leading-relaxed outline-hidden overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 dark:empty:before:text-slate-500 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_a]:text-blue-500 [&_a]:underline [&_img]:max-w-full [&_img]:rounded-lg [&_img]:inline-block ${
              isFullScreen ? "flex-1 h-full" : "h-64 sm:h-80"
            }`}
            data-placeholder="ចាប់ផ្តើមវាយអក្សរខ្មែរនៅទីនេះ... (Start typing Khmer here...)"
            spellCheck={true}
          />

          {/* Status Bar */}
          <div className="flex items-center justify-end gap-6 px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-900 dark:text-white font-bold">{charCount}</span>
              <span>Characters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-900 dark:text-white font-bold">{wordCount}</span>
              <span>Words</span>
            </div>
          </div>
        </div>

        {/* Virtual Keyboard */}
        {!isFullScreen && <VirtualKeyboard isKhmerMode={isKhmerMode} state={keyboardState} onKeyPress={handleVirtualKeyPress} />}
      </main>

      {/* Footer */}
      {!isFullScreen && <footer className="py-6 text-center text-slate-400 dark:text-slate-600 text-sm">&copy; {new Date().getFullYear()} Khmer Typewriter. All rights reserved.</footer>}
    </div>
  );
};

export default App;
