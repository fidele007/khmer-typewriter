import React, { useState, useRef, useEffect } from "react";
import { Save, FolderOpen, Globe, ChevronDown, Check, Languages, Sun, Moon, Monitor } from "lucide-react";
import type { Language, Theme } from "../lib/types";

interface HeaderProps {
  onSave: () => void;
  onOpenSidebar: () => void;
  savedDocsCount: number;
  language: Language;
  setLanguage: (lang: Language) => void;
  isKhmerMode: boolean;
  setIsKhmerMode: (v: boolean) => void;
  theme: Theme;
  cycleTheme: () => void;
  setTheme?: (theme: Theme) => void;
  translations: Record<string, string>;
}

const Header: React.FC<HeaderProps> = ({ onSave, onOpenSidebar, savedDocsCount, language, setLanguage, isKhmerMode, setIsKhmerMode, theme, setTheme, translations: t }) => {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const languagesList = [
    { code: "km", label: "ខ្មែរ", flag: "🇰🇭" },
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
  ] as const;

  const themesList = [
    { code: "light", label: t.themeLight, icon: Sun },
    { code: "dark", label: t.themeDark, icon: Moon },
    { code: "system", label: t.themeSystem, icon: Monitor },
  ] as const;

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCurrentThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun size={18} />;
      case "dark":
        return <Moon size={18} />;
      case "system":
        return <Monitor size={18} />;
    }
  };

  const getCurrentThemeLabel = () => {
    switch (theme) {
      case "light":
        return t.themeLight;
      case "dark":
        return t.themeDark;
      case "system":
        return t.themeSystem;
    }
  };

  const handleSetTheme = (newTheme: Theme) => {
    if (setTheme) {
      setTheme(newTheme);
    }
    setIsThemeMenuOpen(false);
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 text-primary flex items-center justify-center bg-primary/10 rounded-lg">
          <img src="./khmer-typewriter.svg" alt="Khmer Typewriter" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">{t.appTitle}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Document Controls (Desktop) */}
        <div className="flex items-center gap-2 mr-2">
          <button
            onClick={onSave}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
            title={t.save}
          >
            <Save size={20} />
            <span className="text-sm font-medium hidden lg:inline">{t.save}</span>
          </button>
          <button
            onClick={onOpenSidebar}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 relative"
            title={t.savedDocuments}
          >
            <FolderOpen size={20} />
            <span className="text-sm font-medium hidden lg:inline">{t.docs}</span>
            {savedDocsCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>}
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

        {/* Language Selector */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isLangMenuOpen ? "bg-slate-100 dark:bg-slate-800 text-primary ring-2 ring-primary/10" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Select Language"
          >
            <Globe size={18} />
            <span className="hidden sm:inline">{languagesList.find((l) => l.code === language)?.label}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 opacity-50 ${isLangMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {isLangMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-40 py-1 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
              {languagesList.map((langOption) => (
                <button
                  key={langOption.code}
                  onClick={() => {
                    setLanguage(langOption.code as Language);
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                    language === langOption.code ? "bg-primary/5 text-primary font-medium" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{langOption.flag}</span>
                    {langOption.label}
                  </span>
                  {language === langOption.code && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Keyboard Mode Toggle */}
        <button
          onClick={() => setIsKhmerMode(!isKhmerMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            isKhmerMode ? "bg-primary/10 text-primary border border-primary/20" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent"
          }`}
          title={isKhmerMode ? "Switch to System Keyboard" : "Switch to Khmer Keyboard"}
        >
          {isKhmerMode ? <Languages size={18} /> : <Globe size={18} />}
          <span className="hidden sm:inline">{isKhmerMode ? t.khmer : t.system}</span>
        </button>

        {/* Theme Dropdown */}
        <div className="relative" ref={themeMenuRef}>
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isThemeMenuOpen ? "bg-slate-100 dark:bg-slate-800 text-primary ring-2 ring-primary/10" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title={getCurrentThemeLabel()}
          >
            {getCurrentThemeIcon()}
            <span className="hidden sm:inline">{getCurrentThemeLabel()}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 opacity-50 ${isThemeMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {isThemeMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-40 py-1 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
              {themesList.map((tOption) => (
                <button
                  key={tOption.code}
                  onClick={() => handleSetTheme(tOption.code as Theme)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                    theme === tOption.code ? "bg-primary/5 text-primary font-medium" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <tOption.icon size={16} />
                    {tOption.label}
                  </span>
                  {theme === tOption.code && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
