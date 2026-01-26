
import React, { useState, useEffect } from 'react';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { GameProvider, useGame } from './contexts/GameContext';
import { DictionaryProvider, useDictionary } from './contexts/DictionaryContext';
import { GuildProvider, useGuild } from './contexts/GuildContext';
import { GamePhase, MissionData, GameMode } from './types';
import {
  generateMission,
  generateReadingTraining,
  generateSpeakingTraining,
  generateWritingTraining,
  generateTTS,
  generateHint
} from './services/geminiService';
import { translations } from './utils/translations';
import { DEMO_MISSION } from './constants/demoData';
import { getRandomTopic, getRandomDailyTopic } from './constants/topics';
import { SHOP_ITEMS, ShopItem } from './constants/shopItems';
import { updateLastMissionRecord } from './utils/storageUtils';

import { SettingsModal } from './components/SettingsModal';
import { Level1View } from './components/game/Level1View';
import { Level2View } from './components/game/Level2View';
import { Level3View } from './components/game/Level3View';
import { EpilogueView } from './components/game/EpilogueView';
import { QuestLogNav } from './components/game/QuestLogNav';
import { FantasyButton } from './components/ui/FantasyButton';
import { ParchmentContainer } from './components/ui/ParchmentContainer';
import { InstructionModal } from './components/game/InstructionModal';
import { RecordChronicleModal } from './components/game/RecordChronicleModal';
import { BlackBookModal } from './components/game/BlackBookModal';
import { ShopModal } from './components/game/ShopModal';
import { InventoryModal } from './components/game/InventoryModal';
import { SelectionMenu } from './components/ui/SelectionMenu';
import { Icons } from './components/ui/Icons';
import { CustomSelect } from './components/ui/CustomSelect';

const GameContent: React.FC = () => {
  const { gameState, startGame, setGameState, updateTrust } = useGame();
  const { isConfigured, settings } = useSettings();
  const { profile, consumeItem } = useGuild();

  const [showSettings, setShowSettings] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showTrainingMenu, setShowTrainingMenu] = useState(false);

  const [selectedOriginId, setSelectedOriginId] = useState<string>("");

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");

  const t = translations[settings.language];

  // Determine Active Theme Class
  const activeThemeItem = profile.activeThemeId ? SHOP_ITEMS.find(i => i.id === profile.activeThemeId) : null;
  const themeClass = activeThemeItem?.cssClass || "";

  // Filter unlocked origins
  const unlockedOrigins = SHOP_ITEMS.filter(
    item => item.type === 'origin' && profile.unlockedRewards.includes(item.id)
  );

  // Calculate inventory count for badge
  const inventoryCount = (Object.values(profile.inventory) as number[]).reduce((acc, qty) => acc + qty, 0);

  const handleStartDemo = () => {
    setGameState(prev => ({ ...prev, currentPhase: GamePhase.LOADING }));
    setLoadingProgress(30);
    setLoadingText("Loading Guest Mode...");
    setTimeout(() => {
      // Pass static audio URL for Level 1
      const audioUrl = `${import.meta.env.BASE_URL}demo-audio/demo_level1_full_text.wav`;
      console.log("Demo Audio URL:", audioUrl);
      startGame(DEMO_MISSION, audioUrl, 'CAMPAIGN', GamePhase.LEVEL_1, undefined);
      setLoadingProgress(100);
    }, 800);
  };

  const initiateMission = async (mode: GameMode, startPhase: GamePhase = GamePhase.LEVEL_1) => {
    // If NOT configured (no API key), open Settings
    if (!isConfigured) {
      setShowSettings(true);
      return;
    }

    setShowTrainingMenu(false);
    setLoadingProgress(10);
    setLoadingText(t.consultingOracles);
    setGameState(prev => ({ ...prev, currentPhase: GamePhase.LOADING }));

    try {
      let topicToSend = "";
      let missionData: MissionData;

      // Prepare Player Identity Prompt if selected
      let identityPrompt = undefined;
      if (selectedOriginId) {
        const item = SHOP_ITEMS.find(i => i.id === selectedOriginId);
        if (item?.promptTag) identityPrompt = item.promptTag;
      }

      if (mode === 'CAMPAIGN') {
        // Automatically select a random historical topic for Campaign
        topicToSend = getRandomTopic();
        missionData = await generateMission(settings.apiKey, settings.targetLevel, topicToSend, settings.language, identityPrompt);
      } else {
        // Training Mode: Use mundane daily topics
        topicToSend = getRandomDailyTopic();

        if (startPhase === GamePhase.LEVEL_1) {
          missionData = await generateReadingTraining(settings.apiKey, settings.targetLevel, topicToSend, settings.language, identityPrompt);
        } else if (startPhase === GamePhase.LEVEL_2) {
          missionData = await generateSpeakingTraining(settings.apiKey, settings.targetLevel, topicToSend, settings.language, identityPrompt);
        } else if (startPhase === GamePhase.LEVEL_3) {
          missionData = await generateWritingTraining(settings.apiKey, settings.targetLevel, topicToSend, settings.language, identityPrompt);
        } else throw new Error("Phase error");
      }

      setLoadingProgress(60);
      setLoadingText(t.loadingDecoding);

      let audioUrl = "";
      if ((mode === 'CAMPAIGN' || startPhase === GamePhase.LEVEL_1) && missionData.decryptedMessage?.fullText) {
        try {
          audioUrl = await generateTTS(settings.apiKey, missionData.decryptedMessage.fullText);
        } catch (e) {
          console.warn("Intro TTS failed, continuing silent:", e);
        }
      }

      setLoadingProgress(100);
      startGame(missionData, audioUrl, mode, startPhase, selectedOriginId || undefined);
    } catch (e) {
      alert(t.errorTitle + ": " + (e instanceof Error ? e.message : "Unknown error"));
      setGameState(prev => ({ ...prev, currentPhase: GamePhase.MENU }));
    }
  };

  const handleStartTraining = (phase: GamePhase) => initiateMission('TRAINING', phase);

  // Centralized Item Logic
  const handleItemUse = async (item: ShopItem): Promise<boolean> => {
    // 1. Spy Network (Level 2)
    if (item.id === 'consumable_spy_network') {
      if (!settings.apiKey) {
        alert("Hint requires API Key.");
        return false;
      }
      if (gameState.currentPhase !== GamePhase.LEVEL_2) return false;

      try {
        // Show a temporary loading state in feedback
        setGameState(prev => ({
          ...prev,
          lastNegotiationFeedback: `[${t.dispatching}...]`
        }));

        const hint = await generateHint(settings.apiKey, gameState.chatHistory, settings.language);

        setGameState(prev => ({
          ...prev,
          lastNegotiationFeedback: `[SPY REPORT]: ${hint}`
        }));

        consumeItem(item.id);
        return true;
      } catch (e) {
        console.error(e);
        alert(t.spyFailedReport);
        setGameState(prev => ({
          ...prev,
          lastNegotiationFeedback: null // Clear loading
        }));
        return false;
      }
    }

    // 2. Royal Pardon (Epilogue)
    if (item.id === 'consumable_royal_pardon') {
      if (gameState.currentPhase !== GamePhase.EPILOGUE) return false;

      const oldScore = gameState.trustScore;
      const oldReport = gameState.feedback?.score || 0;
      const newTrust = Math.min(100, oldScore + 15);
      const newReport = Math.min(100, oldReport + 15);

      // Update Persistent Record
      const avg = (newTrust + newReport) / 2;
      let newGrade = "F";
      if (avg >= 95) newGrade = "S";
      else if (avg >= 85) newGrade = "A";
      else if (avg >= 70) newGrade = "B";
      else if (avg >= 60) newGrade = "C";
      else if (avg >= 45) newGrade = "D";

      updateLastMissionRecord({
        trustScore: newTrust,
        reportScore: newReport,
        grade: newGrade
      });

      // Logic: Boost scores significantly
      // We modify the gameState directly so EpilogueView re-renders with new scores
      setGameState(prev => {
        return {
          ...prev,
          trustScore: newTrust,
          feedback: {
            ...prev.feedback,
            score: newReport
          }
        };
      });

      consumeItem(item.id);
      alert("Royal Pardon accepted! Your reputation has been bolstered.");
      return true;
    }

    // 3. Generic Flavor Text
    if (item.effect === 'flavor_text') {
      alert(`You used ${item.name[settings.language]}.\n\n"${item.description[settings.language]}"`);
      consumeItem(item.id);
      return true;
    }

    return false;
  };

  const renderContent = () => {
    switch (gameState.currentPhase) {
      case GamePhase.LOADING:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] md:h-[80vh]">
            <div className="text-xl md:text-2xl animate-pulse mb-6 font-fantasy text-center px-4">{loadingText}</div>
            <div className="w-64 md:w-80 h-6 bg-[#2c1810] border-2 border-[#d4c59a] rounded-full overflow-hidden relative">
              {/* Added 'loading-bar-fill' class for theme exclusion */}
              <div className="loading-bar-fill h-full bg-[#8a1c1c] transition-all duration-700" style={{ width: `${loadingProgress}%` }} />
            </div>
          </div>
        );
      case GamePhase.LEVEL_1: return <Level1View />;
      case GamePhase.LEVEL_2: return <Level2View />;
      case GamePhase.LEVEL_3: return <Level3View />;
      case GamePhase.EPILOGUE: return <EpilogueView />;
      case GamePhase.MENU:
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[85vh] p-2 md:p-4">
            <div className="max-w-3xl w-full text-center space-y-6 md:space-y-8">
              <h1 className="app-title text-4xl md:text-7xl font-fantasy text-[#f3e5ab] drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] tracking-wider">
                {t.appTitle}
              </h1>
              <p className="app-subtitle text-base md:text-xl text-[#d4c59a] italic opacity-90 px-4">{t.subtitle}</p>

              <ParchmentContainer className="mx-auto max-w-xl space-y-6 md:space-y-8 relative overflow-hidden transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                {showTrainingMenu && (
                  <div className="absolute inset-0 bg-[#f3e5ab] z-10 flex flex-col justify-center gap-4 p-4 md:p-8 rounded-lg animate-in fade-in zoom-in-95 duration-300">
                    <h3 className="text-center font-fantasy font-bold text-xl md:text-2xl mb-4 text-[#2c1810] border-b border-[#2c1810]/20 pb-2">{t.selectTraining}</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <FantasyButton onClick={() => handleStartTraining(GamePhase.LEVEL_1)}>{t.practiceReading}</FantasyButton>
                      <FantasyButton onClick={() => handleStartTraining(GamePhase.LEVEL_2)}>{t.practiceSpeaking}</FantasyButton>
                      <FantasyButton onClick={() => handleStartTraining(GamePhase.LEVEL_3)}>{t.practiceWriting}</FantasyButton>
                    </div>
                    <button onClick={() => setShowTrainingMenu(false)} className="text-sm underline mt-4 text-[#2c1810] hover:text-[#8a1c1c] font-bold transition-colors">
                      {t.cancel}
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Origin Selection */}
                  <div className="text-left">
                    <label className="block font-bold mb-2 text-[#2c1810] text-xs md:text-sm uppercase tracking-widest opacity-70">
                      {t.identityLabel}
                    </label>
                    <CustomSelect
                      value={selectedOriginId}
                      onChange={setSelectedOriginId}
                      options={[
                        { value: "", label: "---" },
                        ...unlockedOrigins.map(origin => ({
                          value: origin.id,
                          label: origin.name[settings.language]
                        }))
                      ]}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <FantasyButton
                    className="w-full py-3 md:py-4 text-xl md:text-2xl shadow-[0_5px_0_rgba(44,24,16,0.3)]"
                    onClick={() => initiateMission('CAMPAIGN')}
                  >
                    {t.startMission}
                  </FantasyButton>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FantasyButton
                      className="w-full text-xs uppercase tracking-tighter py-3"
                      variant="secondary"
                      onClick={() => setShowTrainingMenu(true)}
                    >
                      {t.trainingGrounds}
                    </FantasyButton>
                    <FantasyButton
                      className="w-full text-xs uppercase tracking-tighter py-3"
                      variant="secondary"
                      onClick={() => setShowInstructions(true)}
                    >
                      {t.gameInstructions}
                    </FantasyButton>
                    <FantasyButton
                      className="w-full text-xs uppercase tracking-tighter py-3"
                      variant="secondary"
                      onClick={() => setShowHistory(true)}
                    >
                      {t.missionHistory}
                    </FantasyButton>
                    <FantasyButton
                      className="w-full text-xs uppercase tracking-tighter py-3"
                      variant="secondary"
                      onClick={() => setShowLibrary(true)}
                    >
                      {t.libraryTitle}
                    </FantasyButton>
                  </div>

                  <div className="pt-2 border-t border-[#2c1810]/20">
                    <FantasyButton
                      className="w-full text-sm uppercase tracking-widest py-3 bg-gradient-to-r from-[#8a1c1c] to-[#591111] border-[#2c1810] flex items-center justify-center gap-2"
                      onClick={() => setShowShop(true)}
                    >
                      <Icons.Store className="w-5 h-5 text-[#f3e5ab]" />
                      {t.shop}
                    </FantasyButton>
                  </div>
                </div>
              </ParchmentContainer>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen bg-[#1a1a1a] bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] font-body ${themeClass}`}>
      {/* Enable Text Highlight Selection */}
      <SelectionMenu />

      <header className="fixed top-0 right-0 p-2 md:p-4 z-40 flex items-center gap-2 md:gap-3 pointer-events-none">
        {gameState.currentPhase !== GamePhase.MENU && (
          <>
            <button
              onClick={() => setShowLibrary(true)}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-[#f3e5ab] hover:text-white transition drop-shadow-md bg-black/30 rounded-full hover:bg-black/50 pointer-events-auto"
            >
              <Icons.Book className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <button
              onClick={() => setShowInventory(true)}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-[#f3e5ab] hover:text-white transition drop-shadow-md bg-black/30 rounded-full hover:bg-black/50 relative pointer-events-auto"
            >
              <Icons.Satchel className="w-5 h-5 md:w-6 md:h-6" />
              {inventoryCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-black">
                  {inventoryCount}
                </span>
              )}
            </button>
          </>
        )}
        <button
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-[#f3e5ab] hover:text-white transition drop-shadow-md bg-black/30 rounded-full hover:bg-black/50 pointer-events-auto"
        >
          <Icons.Settings className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </header>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onStartDemo={handleStartDemo} />}
      {showInstructions && <InstructionModal onClose={() => setShowInstructions(false)} />}
      {showHistory && <RecordChronicleModal onClose={() => setShowHistory(false)} />}
      {showLibrary && <BlackBookModal onClose={() => setShowLibrary(false)} />}
      {showShop && <ShopModal onClose={() => setShowShop(false)} />}
      {showInventory && <InventoryModal onClose={() => setShowInventory(false)} currentPhase={gameState.currentPhase} onUseItem={handleItemUse} />}

      <main className="p-2 md:p-4 pt-12 md:pt-16 min-h-screen relative overflow-auto scrollbar-hide pb-20 md:pb-4">
        <QuestLogNav />
        {renderContent()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <GameProvider>
        <GuildProvider>
          <DictionaryProvider>
            <GameContent />
          </DictionaryProvider>
        </GuildProvider>
      </GameProvider>
    </SettingsProvider>
  );
};

export default App;
