export interface KeyData {
  code: string;
  en: string;
  km: string;
  kmShift: string;
  label?: string;
  type?: 'char' | 'modifier' | 'action' | 'spacer';
  width?: number; // span units (out of 28 for grid)
  icon?: string;
}

export interface KeyboardState {
  isShift: boolean;
  isCaps: boolean;
  activeKeys: Set<string>;
}