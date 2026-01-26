
import React, { createContext, useContext, useState } from 'react';
import { GuildProfile, BlackBookEntry } from '../types';
import { loadProfile, saveProfile, loadBlackBook, saveBlackBook } from '../utils/storageUtils';
import { ShopItem, SHOP_ITEMS } from '../constants/shopItems';

interface GuildContextType {
  profile: GuildProfile;
  updateProfile: (newProfile: Partial<GuildProfile>) => void;
  addGuildMarks: (amount: number) => void;
  purchaseItem: (item: ShopItem) => boolean;
  consumeItem: (itemId: string) => boolean;
  equipTheme: (themeId: string | undefined) => void;
  blackBookEntries: BlackBookEntry[];
  addToBlackBook: (original: string, correction: string, source: 'speaking' | 'writing', note?: string) => void;
  removeFromBlackBook: (id: string) => void;
  updateBlackBookEntry: (id: string, updates: Partial<BlackBookEntry>) => void;
  importGuildData: (newProfile: GuildProfile, newBlackBook: BlackBookEntry[]) => void;
}

const GuildContext = createContext<GuildContextType | undefined>(undefined);

export const GuildProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lazy initialization ensures we read from localStorage before the first render
  const [profile, setProfile] = useState<GuildProfile>(() => {
    const loadedProfile = loadProfile();
    // Ensure inventory exists for legacy saves
    if (!loadedProfile.inventory) loadedProfile.inventory = {};
    return loadedProfile;
  });

  const [blackBookEntries, setBlackBookEntries] = useState<BlackBookEntry[]>(() => loadBlackBook());

  const updateProfile = (newProfile: Partial<GuildProfile>) => {
    const updated = { ...profile, ...newProfile };
    setProfile(updated);
    saveProfile(updated);
  };

  const addGuildMarks = (amount: number) => {
    updateProfile({ guildMarks: profile.guildMarks + amount, rankPoints: profile.rankPoints + amount });
  };

  const purchaseItem = (item: ShopItem): boolean => {
    // REQUESTED CHANGE: Removed logic for "First Origin Free". Items are always full cost.
    const effectiveCost = item.cost;

    if (profile.guildMarks < effectiveCost) return false;

    const newMarks = profile.guildMarks - effectiveCost;
    const newProfile = { ...profile, guildMarks: newMarks };

    if (item.type === 'consumable') {
      // Add to inventory
      const currentQty = newProfile.inventory[item.id] || 0;
      newProfile.inventory = {
        ...newProfile.inventory,
        [item.id]: currentQty + 1
      };
    } else {
      // Unlock item (Origin, Theme, Badge)
      if (!newProfile.unlockedRewards.includes(item.id)) {
        newProfile.unlockedRewards = [...newProfile.unlockedRewards, item.id];
      } else {
        // Already owned non-consumable
        return false;
      }
    }

    updateProfile(newProfile);
    return true;
  };

  const consumeItem = (itemId: string): boolean => {
    const currentQty = profile.inventory[itemId] || 0;
    if (currentQty <= 0) return false;

    const newInventory = { ...profile.inventory };
    newInventory[itemId] = currentQty - 1;

    updateProfile({ inventory: newInventory });
    return true;
  };

  const equipTheme = (themeId: string | undefined) => {
    // Validate ownership if setting a theme
    if (themeId && !profile.unlockedRewards.includes(themeId)) return;
    updateProfile({ activeThemeId: themeId });
  };

  const addToBlackBook = (original: string, correction: string, source: 'speaking' | 'writing', note?: string) => {
    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

    const newEntry: BlackBookEntry = {
      id: generateId(),
      original,
      correction,
      source,
      note,
      timestamp: Date.now()
    };
    setBlackBookEntries(prev => {
      const updated = [newEntry, ...prev];
      saveBlackBook(updated);
      return updated;
    });
  };

  const removeFromBlackBook = (id: string) => {
    setBlackBookEntries(prev => {
      const updated = prev.filter(e => e.id !== id);
      saveBlackBook(updated);
      return updated;
    });
  };

  const importGuildData = (newProfile: GuildProfile, newBlackBook: BlackBookEntry[]) => {
    setProfile(newProfile);
    saveProfile(newProfile);
    setBlackBookEntries(newBlackBook);
    saveBlackBook(newBlackBook);
  };

  return (
    <GuildContext.Provider value={{
      profile,
      updateProfile,
      addGuildMarks,
      purchaseItem,
      consumeItem,
      equipTheme,
      blackBookEntries,
      addToBlackBook,
      removeFromBlackBook,
      updateBlackBookEntry: (id: string, updates: Partial<BlackBookEntry>) => {
        setBlackBookEntries(prev => {
          const updated = prev.map(e => e.id === id ? { ...e, ...updates } : e);
          saveBlackBook(updated);
          return updated;
        });
      },
      importGuildData
    }}>
      {children}
    </GuildContext.Provider>
  );
};

export const useGuild = () => {
  const context = useContext(GuildContext);
  if (!context) throw new Error("useGuild must be used within GuildProvider");
  return context;
};
