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
  pathHighlightColor: string;
  pathColor: string;
  logoUrl: string;
  edgeType?: 'bezier' | 'smoothstep' | 'step' | 'straight';
}

export const defaultLightTheme: ThemeSettings = {
  fontFamily: 'Inter',
  canvasBg: '#f9fafb',
  textBg: '#ffffff',
  textColor: '#111827',
  decisionColor: '#3b82f6',
  noteColor: '#eab308',
  outcomeGoodColor: '#22c55e',
  outcomeBadColor: '#ef4444',
  outcomeNeutralColor: '#a855f7',
  pathHighlightColor: '#06b6d4',
  pathColor: '#94a3b8',
  logoUrl: '',
  edgeType: 'bezier',
};

export const defaultDarkTheme: ThemeSettings = {
  fontFamily: 'Inter',
  canvasBg: '#111827',
  textBg: '#1f2937',
  textColor: '#f9fafb',
  decisionColor: '#2563eb',
  noteColor: '#ca8a04',
  outcomeGoodColor: '#16a34a',
  outcomeBadColor: '#dc2626',
  outcomeNeutralColor: '#9333ea',
  pathHighlightColor: '#22d3ee',
  pathColor: '#4b5563',
  logoUrl: '',
  edgeType: 'bezier',
};
