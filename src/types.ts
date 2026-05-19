export interface ThemeSettings {
  fontFamily: string;
  canvasBg: string;
  textBg: string;
  textColor: string;
  decisionColor: string;
  noteColor: string;
  outcomeGoodColor: string;
  outcomeBadColor: string;
  outcomeNeutralColor: string;
}

export const defaultLightTheme: ThemeSettings = {
  fontFamily: 'Inter',
  canvasBg: '#f9fafb', // gray-50
  textBg: '#ffffff',
  textColor: '#111827', // gray-900
  decisionColor: '#3b82f6', // blue-500
  noteColor: '#eab308', // yellow-500
  outcomeGoodColor: '#22c55e', // green-500
  outcomeBadColor: '#ef4444', // red-500
  outcomeNeutralColor: '#a855f7', // purple-500
};

export const defaultDarkTheme: ThemeSettings = {
  fontFamily: 'Inter',
  canvasBg: '#111827', // gray-900
  textBg: '#1f2937', // gray-800
  textColor: '#f9fafb', // gray-50
  decisionColor: '#2563eb', // blue-600
  noteColor: '#ca8a04', // yellow-600
  outcomeGoodColor: '#16a34a', // green-600
  outcomeBadColor: '#dc2626', // red-600
  outcomeNeutralColor: '#9333ea', // purple-600
};
