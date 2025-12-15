import React from "react";
import { KEYBOARD_LAYOUT } from "../lib/constants";
import type { KeyData, KeyboardState } from "../lib/types";
import Key from "./Key";

interface VirtualKeyboardProps {
  isKhmerMode: boolean;
  state: KeyboardState;
  onKeyPress: (keyData: KeyData) => void;
  hintText: string;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ isKhmerMode, state, onKeyPress, hintText }) => {
  return (
    <div className="w-full mt-6 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-xl shadow-inner border border-slate-200 dark:border-slate-800">
      <div className="grid gap-1.5 max-w-5xl mx-auto" style={{ gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }}>
        {KEYBOARD_LAYOUT.flat().map((keyData: KeyData, index) => {
          // Unique key for React list
          const keyId = `${keyData.code}-${index}`;

          return <Key key={keyId} isKhmerMode={isKhmerMode} data={keyData} isShift={state.isShift} isRightAlt={state.isRightAlt} activeKeys={state.activeKeys} onPress={onKeyPress} />;
        })}
      </div>
      <div className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">{hintText}</div>
    </div>
  );
};

export default VirtualKeyboard;
