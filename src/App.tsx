import "./App.css";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Edit2 } from "lucide-react";
import VirtualKeyboard from "./components/VirtualKeyboard";
import DocumentsSidebar from "./components/DocumentsSidebar";
import Header from "./components/Header";
import EditorToolbar from "./components/EditorToolbar";
import EditorArea from "./components/EditorArea";
import { KEYBOARD_LAYOUT } from "./lib/constants";
import type { KeyboardState, KeyData, Language, Theme } from "./lib/types";
import { translations } from "./lib/translations";

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
  const [isKhmerMode, setIsKhmerMode] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showInvisibles, setShowInvisibles] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("khmer-typewriter-theme") as Theme;
    return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
  });

  // Localization State
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("khmer-typewriter-lang");
    return saved === "en" || saved === "km" || saved === "fr" ? saved : "km";
  });

  // Editor State
  const [currentFont, setCurrentFont] = useState("Kantumruy Pro");
  const [currentSize, setCurrentSize] = useState("3");

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

  const t = translations[language];

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

  // Theme Management
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (targetTheme: Theme) => {
      let effectiveTheme = targetTheme;
      if (targetTheme === "system") {
        effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }

      if (effectiveTheme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }
    };

    applyTheme(theme);
    localStorage.setItem("khmer-typewriter-theme", theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  // Update Language in DOM and Storage
  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("khmer-typewriter-lang", language);
    // Update doc title placeholder if it's the default
    if (docTitle === translations.en.newDocument || docTitle === translations.km.newDocument || docTitle === translations.fr.newDocument) {
      setDocTitle(t.newDocument);
    }
  }, [language, t.newDocument, docTitle]);

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

      // Update font/size state from selection
      try {
        const font = document.queryCommandValue("fontName");
        if (font) setCurrentFont(font.replace(/['"]/g, ""));
        const size = document.queryCommandValue("fontSize");
        if (size) setCurrentSize(size);
      } catch (e) {
        console.log("Error setting font/size.", e);
      }
    }
  };

  // Listen for selection changes to update toolbar state
  useEffect(() => {
    document.addEventListener("selectionchange", updateStats);
    return () => document.removeEventListener("selectionchange", updateStats);
  }, []);

  // --- Document Logic ---

  const saveDocsToStorage = (docs: SavedDoc[]) => {
    localStorage.setItem("khmer-typewriter-docs", JSON.stringify(docs));
  };

  const createNewDocument = () => {
    if (textContent.trim().length > 0) {
      if (!window.confirm(t.confirmNew)) {
        return;
      }
    }

    if (editorRef.current) {
      editorRef.current.innerHTML = "";
      updateStats();
    }
    setCurrentDocId(null);
    setDocTitle(t.newDocument);
    setShowInvisibles(false); // Reset view mode
    if (isSidebarOpen) setIsSidebarOpen(false);
  };

  const saveDocument = () => {
    if (!editorRef.current) return;

    // Ask for document name
    const inputName = prompt(t.enterDocName, docTitle);
    const finalTitle = inputName !== null && inputName.trim() !== "" ? inputName.trim() : docTitle;
    setDocTitle(finalTitle);

    // Ensure we save the 'raw' content without visual helpers for invisibles
    let contentToSave = editorRef.current.innerHTML;
    if (showInvisibles) {
      // Strip the visual spans before saving
      contentToSave = contentToSave.replace(/<span class="invisible-zwsp"[^>]*><\/span>/g, "\u200b");
    }

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
      if (!window.confirm(t.confirmLoad)) {
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
    if (window.confirm(t.confirmDelete)) {
      const updatedDocs = savedDocs.filter((doc) => doc.id !== id);
      setSavedDocs(updatedDocs);
      saveDocsToStorage(updatedDocs);

      if (currentDocId === id) {
        setCurrentDocId(null);
        setDocTitle(t.newDocument);
        // We do not clear content, treating it as an unsaved draft of the deleted file
      }
    }
  };

  const formatDate = (ts: number) => {
    const locale = language === "km" ? "km-KH" : language === "fr" ? "fr-FR" : "en-US";
    return (
      new Date(ts).toLocaleDateString(locale) +
      " " +
      new Date(ts).toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
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
      setKeyboardState((prev) => ({
        ...prev,
        isCaps: e.getModifierState("CapsLock"),
      }));
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

      return {
        ...prev,
        activeKeys: newActive,
        isShift: newShift,
        isRightAlt: newRightAlt,
      };
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

  // --- Toolbar Actions ---

  const copyToClipboard = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      navigator.clipboard.writeText(text);
    }
  };

  const clearText = () => {
    if (window.confirm(t.confirmClear)) {
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

  const cycleTheme = () => {
    const modes: Theme[] = ["system", "light", "dark"];
    const nextIndex = (modes.indexOf(theme) + 1) % modes.length;
    setTheme(modes[nextIndex]);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

      <DocumentsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        savedDocs={savedDocs}
        currentDocId={currentDocId}
        onLoad={loadDocument}
        onDelete={deleteDocument}
        onNew={createNewDocument}
        translations={t}
        formatDate={formatDate}
      />

      {/* Header */}
      {!isFullScreen && (
        <Header
          onSave={saveDocument}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          savedDocsCount={savedDocs.length}
          language={language}
          setLanguage={setLanguage}
          isKhmerMode={isKhmerMode}
          setIsKhmerMode={setIsKhmerMode}
          theme={theme}
          setTheme={setTheme}
          cycleTheme={cycleTheme}
          translations={t}
        />
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
                placeholder={t.enterDocName}
              />
              <Edit2 size={20} className="text-slate-400 opacity-50 shrink-0" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              {currentDocId ? t.saved : t.unsavedDraft}
              {currentDocId && <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">{t.saved}</span>}
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
          <EditorToolbar
            isFullScreen={isFullScreen}
            onSave={saveDocument}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            currentFont={currentFont}
            onFontChange={(val) => executeCommand("fontName", val)}
            currentSize={currentSize}
            onSizeChange={(val) => executeCommand("fontSize", val)}
            onCommand={executeCommand}
            onAddLink={addLink}
            onImageUpload={triggerImageUpload}
            showInvisibles={showInvisibles}
            toggleInvisibles={toggleInvisibles}
            toggleFullScreen={toggleFullScreen}
            onCopy={copyToClipboard}
            onClear={clearText}
            translations={t}
          />

          {/* WYSIWYG Area */}
          <EditorArea
            ref={editorRef}
            isFullScreen={isFullScreen}
            handleComposition={handleComposition}
            handleKeyDown={handleKeyDown}
            handleKeyUp={handleKeyUp}
            updateStats={updateStats}
            placeholder={`${t.placeholder} (${t.virtualKeyboardHint})`}
          />

          {/* Status Bar */}
          <div className="flex items-center justify-end gap-6 px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-900 dark:text-white font-bold">{charCount}</span>
              <span>{t.characters}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-900 dark:text-white font-bold">{wordCount}</span>
              <span>{t.words}</span>
            </div>
          </div>
        </div>

        {/* Virtual Keyboard */}
        {!isFullScreen && <VirtualKeyboard isKhmerMode={isKhmerMode} state={keyboardState} onKeyPress={handleVirtualKeyPress} hintText={t.virtualKeyboardHint} />}
      </main>

      {/* Footer */}
      {!isFullScreen && (
        <footer className="py-6 text-center text-slate-400 dark:text-slate-600 text-sm">
          &copy; {new Date().getFullYear()} {t.footerRights}
        </footer>
      )}
    </div>
  );
};

export default App;
