import { CEFRLevel, Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  language: 'de',
  targetLevel: CEFRLevel.B1
};

export const INITIAL_TRUST_SCORE = 50;

export const THEME = {
  colors: {
    parchment: 'bg-[#f3e5ab]',
    parchmentDark: 'bg-[#d4c59a]',
    ink: 'text-[#2c1810]',
    seal: 'bg-[#8a1c1c]',
    accent: 'text-[#8a1c1c]'
  }
};
