
import React, { useState, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useDictionary } from '../contexts/DictionaryContext';
import { useGame } from '../contexts/GameContext';
import { useGuild } from '../contexts/GuildContext';
import { CEFRLevel, GamePhase, SaveFile } from '../types';
import { FantasyButton } from './ui/FantasyButton';
import { ParchmentContainer } from './ui/ParchmentContainer';
import { Icons } from './ui/Icons';
import { translations } from '../utils/translations';
import {
  exportSave,
  importSave,
  loadMissionRecords,
  overwriteMissionRecords
} from '../utils/storageUtils';

export const SettingsModal: React.FC<{ onClose: () => void, onStartDemo: () => void }> = ({ onClose, onStartDemo }) => {
  const { settings, updateSettings } = useSettings();
  const { words, importDictionary } = useDictionary();
  const { gameState, abandonMission } = useGame(); // Import abandonMission
  const { profile, blackBookEntries, importGuildData } = useGuild();

  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [level, setLevel] = useState(settings.targetLevel);
  const [language, setLanguage] = useState<'de' | 'zh'>(settings.language);

  // Tabs: 'certificate' (General) | 'mission' (Mission Status)
  const [activeTab, setActiveTab] = useState<'certificate' | 'mission'>('certificate');

  // UI States for Import Button
  const [importStatus, setImportStatus] = useState<'idle' | 'reading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];

  // Google API keys typically start with "AIza"
  const isKeyFormatValid = apiKey.trim().length === 0 || apiKey.trim().startsWith('AIza');

  // Check if mission is active (not in Menu and not in Epilogue)
  const isMissionActive = gameState.currentPhase !== GamePhase.MENU && gameState.currentPhase !== GamePhase.EPILOGUE;

  const handleSave = () => {
    if (!isKeyFormatValid && apiKey.trim().length > 0) return;
    updateSettings({ apiKey, targetLevel: level, language });
    onClose();
  };

  const handleGuestMode = () => {
    // Check if a game is in progress
    if (isMissionActive) {
      // Note: window.confirm removed for sandbox safety, assuming user intent
      // if (!window.confirm(t.confirmExitMission)) return;
    }
    onStartDemo();
    onClose();
  };

  const handleAbandon = () => {
    if (window.confirm(t.confirmAbandon)) {
      abandonMission();
      onClose();
    }
  };

  const handleExport = () => {
    // Create a full snapshot of the game state
    const missionRecords = loadMissionRecords();

    const saveData: SaveFile = {
      version: 1,
      timestamp: Date.now(),
      settings: { ...settings, apiKey, targetLevel: level, language },
      dictionary: words,
      profile: profile,
      blackBook: blackBookEntries,
      missionRecords: missionRecords
    };

    exportSave(saveData);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportStatus('reading');

    const file = e.target.files?.[0];
    if (!file) {
      setImportStatus('idle');
      return;
    }

    try {
      console.log("Starting import for:", file.name);
      const data = await importSave(file);

      if (!data || typeof data !== 'object') {
        throw new Error("Invalid file structure: Not a JSON object");
      }

      // Check for at least one valid key
      if (!data.profile && !data.settings && !data.dictionary) {
        throw new Error("File contains no recognizable Guild data.");
      }

      // --- SOFT RELOAD (Update Contexts Directly) ---
      // This avoids window.location.reload() which can crash iframes/previews

      let updateCount = 0;

      // 1. Settings
      if (data.settings) {
        // Validations
        const newKey = data.settings.apiKey || '';
        const newLevel = data.settings.targetLevel || CEFRLevel.B1;
        const newLang = (data.settings.language === 'de' || data.settings.language === 'zh')
          ? data.settings.language
          : 'de';

        // Update React Context (which also saves to localStorage internally)
        updateSettings({
          apiKey: newKey,
          targetLevel: newLevel,
          language: newLang
        });

        // Update Local Modal State immediately
        setApiKey(newKey);
        setLevel(newLevel);
        setLanguage(newLang);
        updateCount++;
      }

      // 2. Dictionary
      if (data.dictionary && Array.isArray(data.dictionary)) {
        importDictionary(data.dictionary);
        updateCount++;
      }

      // 3. Guild Data (Profile & BlackBook)
      if (data.profile || data.blackBook) {
        const safeProfile = data.profile ? {
          ...data.profile,
          inventory: data.profile.inventory || {},
          unlockedRewards: data.profile.unlockedRewards || []
        } : profile;

        const safeBlackBook = (data.blackBook && Array.isArray(data.blackBook))
          ? data.blackBook
          : blackBookEntries;

        importGuildData(safeProfile, safeBlackBook);
        updateCount++;
      }

      // 4. Mission Records (Not in Context, direct storage)
      if (data.missionRecords && Array.isArray(data.missionRecords)) {
        overwriteMissionRecords(data.missionRecords);
        updateCount++;
      }

      if (updateCount > 0) {
        setImportStatus('success');
        alert(t.importSuccessMsg);
        // Close modal automatically to show results? Optional.
        // onClose(); 
      } else {
        throw new Error("Data structure valid but no updates applied.");
      }

    } catch (err: any) {
      console.error("Import failed:", err);
      setImportStatus('error');
      alert(`${t.importErrorMsg} ${err.message}`);
      setTimeout(() => setImportStatus('idle'), 3000);
    } finally {
      // Reset input to allow re-selecting same file
      e.target.value = '';
    }
  };

  // --- Render Sections ---

  const renderCertificateTab = () => (
    <div className="space-y-4 animate-in fade-in">
      <div>
        <label className="block font-bold mb-1">{t.interfaceLanguage}</label>
        <div className="flex space-x-2">
          <button
            onClick={() => setLanguage('de')}
            className={`flex-1 p-2 rounded border ${language === 'de' ? 'bg-[#8a1c1c] text-white border-[#2c1810]' : 'bg-white/30 border-black/30'}`}
          >
            Deutsch
          </button>
          <button
            onClick={() => setLanguage('zh')}
            className={`flex-1 p-2 rounded border ${language === 'zh' ? 'bg-[#8a1c1c] text-white border-[#2c1810]' : 'bg-white/30 border-black/30'}`}
          >
            繁體中文
          </button>
        </div>
      </div>

      <div>
        <label className="block font-bold mb-1">{t.apiKeyLabel}</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className={`w-full p-2 border rounded font-mono transition-colors ${!isKeyFormatValid ? 'bg-red-50 border-red-500 text-red-900' : 'bg-white/50 border-black/30'}`}
          placeholder="AIza..."
        />
        {!isKeyFormatValid && (
          <p className="text-red-700 text-xs font-bold mt-1 animate-pulse">{t.apiKeyInvalidFormat}</p>
        )}
        <p className="text-xs mt-1 opacity-70">
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-bold">{t.apiKeyLink}</a>
        </p>
      </div>

      <div>
        <label className="block font-bold mb-1">
          {t.targetProficiency}
          {isMissionActive && <span className="text-[10px] text-red-700 ml-2 font-normal uppercase">(Locked during mission)</span>}
        </label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as CEFRLevel)}
          disabled={isMissionActive}
          className={`w-full p-2 bg-white/50 border border-black/30 rounded ${isMissionActive ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}`}
        >
          {Object.values(CEFRLevel).map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="pt-4 border-t border-black/10">
        <label className="block font-bold mb-2">{t.archiveData}</label>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 py-2 bg-[#2c1810] text-[#f3e5ab] text-sm font-fantasy rounded hover:bg-black transition-colors"
          >
            {t.export}
          </button>

          <button
            onClick={() => {
              if (importStatus === 'idle' || importStatus === 'error' || importStatus === 'success') {
                fileInputRef.current?.click();
              }
            }}
            disabled={importStatus === 'reading'}
            className={`flex-1 py-2 text-sm font-fantasy rounded transition-all duration-300 border-2 ${importStatus === 'success' ? 'bg-green-700 text-white border-green-500 shadow-[0_0_15px_rgba(0,255,0,0.5)]' :
              importStatus === 'error' ? 'bg-red-700 text-white border-red-500 animate-shake' :
                importStatus === 'reading' ? 'bg-yellow-600 text-white border-yellow-400 animate-pulse' :
                  'bg-[#2c1810] text-[#f3e5ab] border-[#8a1c1c] hover:bg-black'
              }`}
          >
            {importStatus === 'reading' ? t.deciphering :
              importStatus === 'success' ? t.importSuccess :
                importStatus === 'error' ? t.importError :
                  t.import}
          </button>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleImport}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4 mt-2 border-t border-black/20 gap-4">
        <button onClick={handleGuestMode} className="text-xs underline text-gray-600 hover:text-black">
          {t.guestMode}
        </button>
        <FantasyButton onClick={handleSave} disabled={!isKeyFormatValid && apiKey.length > 0}>
          {t.signAndSeal}
        </FantasyButton>
      </div>
    </div>
  );

  const renderMissionTab = () => (
    <div className="space-y-6 text-center py-6 animate-in fade-in">
      <div className="p-4 bg-red-900/10 rounded border border-red-900/20">
        <h3 className="font-fantasy font-bold text-xl text-[#8a1c1c] mb-2">{t.abandonMission}</h3>
        <p className="text-sm text-[#2c1810] mb-4">{t.abandonWarning || "Are you sure you want to abandon the current mission? Progress will be lost."}</p>

        <button
          onClick={handleAbandon}
          className="w-full py-3 bg-red-800 text-[#f3e5ab] font-bold uppercase tracking-widest rounded shadow-lg hover:bg-red-900 transition active:scale-95 border-2 border-[#f3e5ab]/30"
        >
          {t.abandonMission}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <ParchmentContainer className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="border-b-2 border-black/20 pb-2 mb-4 flex justify-between items-center">
          {isMissionActive ? (
            <div className="flex gap-4 items-end">
              <button
                onClick={() => setActiveTab('certificate')}
                className={`text-xl md:text-2xl font-fantasy font-bold transition-all text-button ${activeTab === 'certificate' ? 'text-[#8a1c1c] scale-105' : 'text-[#2c1810]/40 hover:text-[#2c1810]/70'}`}
              >
                {t.guildRegistration}
              </button>
              <span className="text-2xl font-fantasy text-[#2c1810]/20">/</span>
              <button
                onClick={() => setActiveTab('mission')}
                className={`text-xl md:text-2xl font-fantasy font-bold transition-all text-button ${activeTab === 'mission' ? 'text-[#8a1c1c] scale-105' : 'text-[#2c1810]/40 hover:text-[#2c1810]/70'}`}
              >
                {t.missionStatus || "Mission"}
              </button>
            </div>
          ) : (
            <h2 className="text-2xl font-fantasy font-bold">{t.guildRegistration}</h2>
          )}

          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 transition">
            <Icons.Cross className="w-6 h-6" />
          </button>
        </div>

        {activeTab === 'certificate' ? renderCertificateTab() : renderMissionTab()}

      </ParchmentContainer>
    </div>
  );
};
