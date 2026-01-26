
import { Settings, WordEntry, MissionRecord, GuildProfile, BlackBookEntry } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'boten_gilde_settings',
  DICTIONARY: 'boten_gilde_dictionary',
  RECORDS: 'boten_gilde_records',
  PROFILE: 'boten_gilde_profile',
  BLACK_BOOK: 'boten_gilde_black_book',
};

const safeParse = <T>(data: string | null, fallback: T): T => {
  if (!data) return fallback;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.warn("Data corruption detected, resetting storage key.", e);
    return fallback;
  }
};

export const saveSettings = (settings: Settings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const loadSettings = (): Settings | null => {
  return safeParse<Settings | null>(localStorage.getItem(STORAGE_KEYS.SETTINGS), null);
};

export const saveProfile = (profile: GuildProfile) => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

export const loadProfile = (): GuildProfile => {
  return safeParse<GuildProfile>(
    localStorage.getItem(STORAGE_KEYS.PROFILE), 
    { rankPoints: 0, guildMarks: 0, unlockedRewards: [], inventory: {} }
  );
};

export const saveDictionary = (words: WordEntry[]) => {
  localStorage.setItem(STORAGE_KEYS.DICTIONARY, JSON.stringify(words));
};

export const loadDictionary = (): WordEntry[] => {
  return safeParse<WordEntry[]>(localStorage.getItem(STORAGE_KEYS.DICTIONARY), []);
};

export const saveMissionRecord = (record: MissionRecord) => {
    const existing = loadMissionRecords();
    const updated = [record, ...existing].slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
};

export const updateLastMissionRecord = (updates: Partial<MissionRecord>) => {
    const records = loadMissionRecords();
    if (records.length === 0) return;
    
    // Update the most recent record (index 0)
    const [latest, ...rest] = records;
    const updatedLatest = { ...latest, ...updates };
    
    // Reconstruct array
    const newRecords = [updatedLatest, ...rest];
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(newRecords));
};

// Bulk overwrite for Import
export const overwriteMissionRecords = (records: MissionRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
};

export const loadMissionRecords = (): MissionRecord[] => {
    return safeParse<MissionRecord[]>(localStorage.getItem(STORAGE_KEYS.RECORDS), []);
};

export const saveBlackBook = (entries: BlackBookEntry[]) => {
    localStorage.setItem(STORAGE_KEYS.BLACK_BOOK, JSON.stringify(entries));
};

export const loadBlackBook = (): BlackBookEntry[] => {
    return safeParse<BlackBookEntry[]>(localStorage.getItem(STORAGE_KEYS.BLACK_BOOK), []);
};

export const exportSave = (data: any) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `boten_gilde_save_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importSave = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        let text = e.target?.result as string;
        if (!text) {
            reject(new Error("File is empty"));
            return;
        }

        // 1. Clean whitespace
        text = text.trim();
        
        // 2. Strip BOM (Byte Order Mark) commonly added by Windows Notepad
        if (text.charCodeAt(0) === 0xFEFF) {
            text = text.slice(1);
        }

        // 3. Strategy A: Try direct parsing first (Fastest & Safest)
        try {
            const json = JSON.parse(text);
            resolve(json);
            return;
        } catch (directError) {
            // Ignore error, proceed to Strategy B
        }

        // 4. Strategy B: Locate JSON object bounds (for files with extra headers like "--- START ---")
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const extracted = text.substring(firstBrace, lastBrace + 1);
            try {
                const json = JSON.parse(extracted);
                resolve(json);
                return;
            } catch (extractError) {
                console.error("Extraction parse failed:", extractError);
                reject(new Error("File contains braces but is not valid JSON."));
                return;
            }
        }

        reject(new Error("No valid JSON object structure found in file."));

      } catch (error) {
        console.error("Import Fatal Error:", error);
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file from disk."));
    reader.readAsText(file, 'UTF-8');
  });
};
