
import React, { createContext, useContext, useState } from 'react';
import { WordEntry } from '../types';
import { loadDictionary, saveDictionary } from '../utils/storageUtils';

interface DictionaryContextType {
  words: WordEntry[];
  addWord: (entry: WordEntry) => void;
  removeWord: (id: string) => void;
  updateWord: (id: string, updates: Partial<WordEntry>) => void;
  importDictionary: (newWords: WordEntry[]) => void;
}

const DictionaryContext = createContext<DictionaryContextType | undefined>(undefined);

export const DictionaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lazy initialization
  const [words, setWords] = useState<WordEntry[]>(() => loadDictionary());

  const addWord = (entry: WordEntry) => {
    setWords(prev => {
      // Avoid duplicates
      if (prev.some(w => w.word.toLowerCase() === entry.word.toLowerCase())) {
          return prev;
      }
      const updated = [entry, ...prev];
      saveDictionary(updated);
      return updated;
    });
  };

  const updateWord = (id: string, updates: Partial<WordEntry>) => {
    setWords(prev => {
        const updated = prev.map(w => w.id === id ? { ...w, ...updates } : w);
        saveDictionary(updated);
        return updated;
    });
  };

  const removeWord = (id: string) => {
    setWords(prev => {
      const updated = prev.filter(w => w.id !== id);
      saveDictionary(updated);
      return updated;
    });
  };

  const importDictionary = (newWords: WordEntry[]) => {
      setWords(newWords);
      saveDictionary(newWords);
  };

  return (
    <DictionaryContext.Provider value={{ words, addWord, removeWord, updateWord, importDictionary }}>
      {children}
    </DictionaryContext.Provider>
  );
};

export const useDictionary = () => {
  const context = useContext(DictionaryContext);
  if (!context) throw new Error("useDictionary must be used within DictionaryProvider");
  return context;
};
