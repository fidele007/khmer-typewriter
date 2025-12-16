import type { KeyData } from "./types";

export const PREF_KEYS = {
  theme: "theme",
  lang: "lang",
  docs: "docs",
};

// Based on a 30-column grid system for better alignment
// Regular keys are 2 cols wide.
export const KEYBOARD_LAYOUT: KeyData[][] = [
  // Row 1: Numbers (Total 30: 13*2 + 4)
  [
    { code: "Backquote", en: "`", enShift: "~", km: "«", kmShift: "»", kmAlt: "‍", width: 2 },
    { code: "Digit1", en: "1", enShift: "!", km: "១", kmShift: "!", kmAlt: "‌", width: 2 },
    { code: "Digit2", en: "2", enShift: "@", km: "២", kmShift: "ៗ", kmAlt: "@", width: 2 },
    { code: "Digit3", en: "3", enShift: "#", km: "៣", kmShift: '"', kmAlt: "៑", width: 2 },
    { code: "Digit4", en: "4", enShift: "$", km: "៤", kmShift: "៛", kmAlt: "$", width: 2 },
    { code: "Digit5", en: "5", enShift: "%", km: "៥", kmShift: "%", kmAlt: "€", width: 2 },
    { code: "Digit6", en: "6", enShift: "^", km: "៦", kmShift: "៍", kmAlt: "៙", width: 2 },
    { code: "Digit7", en: "7", enShift: "&", km: "៧", kmShift: "័", kmAlt: "៚", width: 2 },
    { code: "Digit8", en: "8", enShift: "*", km: "៨", kmShift: "៏", kmAlt: "*", width: 2 },
    { code: "Digit9", en: "9", enShift: "(", km: "៩", kmShift: "(", kmAlt: "{", width: 2 },
    { code: "Digit0", en: "0", enShift: ")", km: "០", kmShift: ")", kmAlt: "}", width: 2 },
    { code: "Minus", en: "-", enShift: "_", km: "ឥ", kmShift: "៌", kmAlt: "×", width: 2 },
    { code: "Equal", en: "=", enShift: "+", km: "ឲ", kmShift: "=", kmAlt: "៎", width: 2 },
    { code: "Backspace", en: "", enShift: "", km: "", kmShift: "", label: "Backspace", type: "action", width: 4 },
  ],
  // Row 2: QWERTY (Total 30: 3 + 12*2 + 3)
  [
    { code: "Tab", en: "", enShift: "", km: "", kmShift: "", label: "Tab", type: "action", width: 3 },
    { code: "KeyQ", en: "Q", enShift: "Q", km: "ឆ", kmShift: "ឈ", width: 2 },
    { code: "KeyW", en: "W", enShift: "W", km: "ឹ", kmShift: "ឺ", width: 2 },
    { code: "KeyE", en: "E", enShift: "E", km: "េ", kmShift: "ែ", kmAlt: "ឯ", width: 2 },
    { code: "KeyR", en: "R", enShift: "R", km: "រ", kmShift: "ឬ", kmAlt: "ឫ", width: 2 },
    { code: "KeyT", en: "T", enShift: "T", km: "ត", kmShift: "ទ", width: 2 },
    { code: "KeyY", en: "Y", enShift: "Y", km: "យ", kmShift: "ួ", width: 2 },
    { code: "KeyU", en: "U", enShift: "U", km: "ុ", kmShift: "ូ", width: 2 },
    { code: "KeyI", en: "I", enShift: "I", km: "ិ", kmShift: "ី", kmAlt: "ឦ", width: 2 },
    { code: "KeyO", en: "O", enShift: "O", km: "ោ", kmShift: "ៅ", kmAlt: "ឱ", width: 2 },
    { code: "KeyP", en: "P", enShift: "P", km: "ផ", kmShift: "ភ", kmAlt: "ឰ", width: 2 },
    { code: "BracketLeft", en: "[", enShift: "{", km: "ៀ", kmShift: "ឿ", kmAlt: "ឩ", width: 2 },
    { code: "BracketRight", en: "]", enShift: "}", km: "ឪ", kmShift: "ឧ", kmAlt: "ឳ", width: 2 },
    { code: "Backslash", en: "\\", enShift: "|", km: "ឮ", kmShift: "ឭ", kmAlt: "\\", width: 3 },
  ],
  // Row 3: ASDFGH (Total 30: 4 + 11*2 + 4)
  [
    { code: "CapsLock", en: "", enShift: "", km: "", kmShift: "", label: "Caps Lock", type: "action", width: 4 },
    { code: "KeyA", en: "A", enShift: "A", km: "ា", kmShift: "ាំ", width: 2 },
    { code: "KeyS", en: "S", enShift: "S", km: "ស", kmShift: "ៃ", width: 2 },
    { code: "KeyD", en: "D", enShift: "D", km: "ដ", kmShift: "ឌ", width: 2 },
    { code: "KeyF", en: "F", enShift: "F", km: "ថ", kmShift: "ធ", width: 2 },
    { code: "KeyG", en: "G", enShift: "G", km: "ង", kmShift: "អ", width: 2 },
    { code: "KeyH", en: "H", enShift: "H", km: "ហ", kmShift: "ះ", width: 2 },
    { code: "KeyJ", en: "J", enShift: "J", km: "្", kmShift: "ញ", width: 2 },
    { code: "KeyK", en: "K", enShift: "K", km: "ក", kmShift: "គ", width: 2 },
    { code: "KeyL", en: "L", enShift: "L", km: "ល", kmShift: "ឡ", width: 2 },
    { code: "Semicolon", en: ";", enShift: ":", km: "ើ", kmShift: "ោះ", kmAlt: "៖", width: 2 },
    { code: "Quote", en: "'", enShift: '"', km: "់", kmShift: "៉", kmAlt: "ៈ", width: 2 },
    { code: "Enter", en: "", enShift: "", km: "", kmShift: "", label: "Enter", type: "action", width: 4 },
  ],
  // Row 4: ZXCVBN (Total 30: 5 + 10*2 + 5)
  [
    { code: "ShiftLeft", en: "", enShift: "", km: "", kmShift: "", label: "Shift", type: "modifier", width: 5 },
    { code: "KeyZ", en: "Z", enShift: "Z", km: "ឋ", kmShift: "ឍ", width: 2 },
    { code: "KeyX", en: "X", enShift: "X", km: "ខ", kmShift: "ឃ", width: 2 },
    { code: "KeyC", en: "C", enShift: "C", km: "ច", kmShift: "ជ", width: 2 },
    { code: "KeyV", en: "V", enShift: "V", km: "វ", kmShift: "េះ", width: 2 },
    { code: "KeyB", en: "B", enShift: "B", km: "ប", kmShift: "ព", width: 2 },
    { code: "KeyN", en: "N", enShift: "N", km: "ន", kmShift: "ណ", width: 2 },
    { code: "KeyM", en: "M", enShift: "M", km: "ម", kmShift: "ំ", width: 2 },
    { code: "Comma", en: ",", enShift: "<", km: "ុំ", kmShift: "ុះ", kmAlt: ",", width: 2 },
    { code: "Period", en: ".", enShift: ">", km: "។", kmShift: "៕", kmAlt: ".", width: 2 },
    { code: "Slash", en: "/", enShift: "?", km: "៊", kmShift: "?", kmAlt: "/", width: 2 },
    { code: "ShiftRight", en: "", enShift: "", km: "", kmShift: "", label: "Shift", type: "modifier", width: 5 },
  ],
  // Row 5: Bottom (Total 30)
  [
    { code: "ControlLeft", en: "", enShift: "", km: "", kmShift: "", label: "Ctrl", type: "modifier", width: 3 },
    { code: "Fn", en: "", km: "", enShift: "", kmShift: "", label: "Fn", type: "modifier", width: 2 },
    { code: "MetaLeft", en: "", enShift: "", km: "", kmShift: "", label: "Win", type: "modifier", width: 3 },
    { code: "AltLeft", en: "", enShift: "", km: "", kmShift: "", label: "Alt", type: "modifier", width: 3 },
    { code: "Space", en: " ", enShift: " ", km: "​", kmShift: " ", label: "Space", type: "char", width: 10 },
    { code: "AltRight", en: "", enShift: "", km: "", kmShift: "", label: "Alt", type: "modifier", width: 3 },
    { code: "ControlRight", en: "", enShift: "", km: "", kmShift: "", label: "Ctrl", type: "modifier", width: 3 },
    { code: "ArrowLeft", en: "", enShift: "", km: "", kmShift: "", label: "", type: "action", icon: "ChevronLeft", width: 1 },
    { code: "ArrowUpDown", en: "", enShift: "", km: "", kmShift: "", label: "", type: "action", width: 1 },
    { code: "ArrowRight", en: "", enShift: "", km: "", kmShift: "", label: "", type: "action", icon: "ChevronRight", width: 1 },
  ],
];
