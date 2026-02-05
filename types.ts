
export enum CEFRLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1'
}

export enum GamePhase {
  MENU = 'MENU',
  LOADING = 'LOADING',
  LEVEL_1 = 'LEVEL_1', // Reading
  LEVEL_2 = 'LEVEL_2', // Speaking
  LEVEL_3 = 'LEVEL_3', // Writing
  EPILOGUE = 'EPILOGUE'
}

export type GameMode = 'CAMPAIGN' | 'TRAINING';

export const getPhaseOrder = (phase: GamePhase): number => {
  const order = {
    [GamePhase.MENU]: 0,
    [GamePhase.LOADING]: 1,
    [GamePhase.LEVEL_1]: 2,
    [GamePhase.LEVEL_2]: 3,
    [GamePhase.LEVEL_3]: 4,
    [GamePhase.EPILOGUE]: 5
  };
  return order[phase];
};

export interface Settings {
  apiKey: string;
  language: 'de' | 'zh';
  targetLevel: CEFRLevel;
}

export interface GuildProfile {
  rankPoints: number;
  guildMarks: number;
  unlockedRewards: string[]; // For one-time items (Origins, Themes, Badges)
  inventory: Record<string, number>; // For consumables (ID -> Quantity)
  activeThemeId?: string; // Currently equipped theme
}

export interface BlackBookEntry {
  id: string;
  original: string;
  correction: string;
  note?: string;
  timestamp: number;
  source: 'speaking' | 'writing';
}

export interface WordEntry {
  id: string;
  word: string;
  context: string;
  notes: string;
  tags: string[];
  timestamp: number;
}

export interface Objective {
  id: string;
  description: string;
  isMain: boolean;
}

export interface ClozeItem {
  id: string;
  textBefore: string;
  answer: string;
  distractors: string[];
  textAfter: string;
}

export interface ReadingQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

// Demo Mode Specific Types
export interface ScriptStep {
  step: number;
  npcText: string;
  userRaw: string;   // Simulated imperfect input
  correction: string; // The feedback/grammar correction
  trustGain: number;
  hint?: string;
  finalReveal?: boolean;
  npcTranslation?: string; // Pre-defined translation for demo
  audioUrl?: string; // Pre-recorded audio path
}

export interface NpcAttributes {
  roleId: string;
  backgroundId: string;
  personalityId: string;
}

export interface MissionData {
  level: CEFRLevel; // Snapshot of the difficulty level when generated
  title: string;
  scenarioDescription: string;
  minWordCount?: number;
  decryptedMessage?: {
    fullText: string;
    segments: ClozeItem[];
    readingQuestions?: ReadingQuestion[];
  };
  negotiation?: {
    npcName: string;
    npcRole: string; // Descriptive text (e.g. "A tired guard")
    npcVoice?: string;
    npcAttributes?: NpcAttributes; // Structured IDs for logic
    npcTraits?: string[]; // Legacy/Fallback traits
    relationship?: string;
    initialStatement: string;
    initialStatementTranslation?: string; // Pre-defined translation for demo
    initialStatementAudio?: string; // Pre-recorded audio path for demo
    goal: string;
    objectives: Objective[];
    // Added for Demo Mode
    script?: ScriptStep[];
  };
  reportPrompt?: string;
  historicalFact?: {
    title: string;
    content: string;
    source: string;
  };
  // Added for Demo Mode
  mockFeedback?: {
    correction: string;
    score: number;
    outcome: string;
  };
  illustrationUrl?: string;
  // DLC Support
  dlcManifest?: DLCManifest;
}

export interface DLCManifest {
  id: string;
  name: string; // Internal name or ID
  displayTitle: { de: string; zh: string };
  summary: { de: string; zh: string };
  tags: string[];
  estimatedPlaytime: string;
}

export interface DLCData {
  id: string;
  inventoryItem: {
    id: string;
    containerId?: string; // If this item belongs inside a container
  };
  manifest: DLCManifest;
  // ... other DLC fields (context, stages) omitted for now as they are handled by logic
}

export interface MissionRecord {
  id: string;
  date: number;
  title: string;
  level: CEFRLevel;
  trustScore: number;
  reportScore: number;
  grade: string;
  outcome: string;
  corrections?: string;
}

export interface Level1State {
  answers: Record<string, string>; // For Cloze
  mcqAnswers: Record<string, string>; // For Reading Questions
  showResults: boolean;
  mistakes: { original: string, correct: string, context: string }[];
}

export interface ChatMessage {
  role: 'npc' | 'player';
  text: string;
}

export interface GameState {
  gameMode: GameMode;
  currentPhase: GamePhase;
  maxPhaseReached: GamePhase;
  mission: MissionData | null;
  audioUrl: string | null;
  trustScore: number;
  playerReport: string;
  feedback: any | null;
  level1State: Level1State;
  chatHistory: ChatMessage[];
  lastNegotiationFeedback: string | null; // Persist feedback
  audioCache: Record<number, string>;
  metObjectiveIds: string[];
  illustrationUrl?: string;
  playerIdentityId?: string; // The ID of the selected origin (e.g., 'origin_merchant')
}

// Complete Save File Structure
export interface SaveFile {
  version: number;
  timestamp: number;
  settings: Settings;
  profile: GuildProfile;
  dictionary: WordEntry[];
  blackBook: BlackBookEntry[];
  missionRecords: MissionRecord[];
}
