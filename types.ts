export interface KeyData {
  code: string;
  en: string;
  enShift: string;
  km: string;
  kmShift: string;
  kmAlt?: string;
  label?: string;
  type?: "char" | "modifier" | "action" | "spacer";
  width?: number; // span units (out of 28 for grid)
  icon?: string;
}

export interface KeyboardState {
  isShift: boolean;
  isRightAlt: boolean;
  isCaps: boolean;
  activeKeys: Set<string>;
}
