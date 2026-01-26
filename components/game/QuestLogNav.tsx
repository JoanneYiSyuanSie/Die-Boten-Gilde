
import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { useSettings } from '../../contexts/SettingsContext';
import { GamePhase, getPhaseOrder } from '../../types';
import { translations } from '../../utils/translations';

export const QuestLogNav: React.FC = () => {
  const { gameState, jumpToPhase } = useGame();
  const { settings } = useSettings();
  const { currentPhase, maxPhaseReached, gameMode } = gameState;
  const t = translations[settings.language];

  // Hide nav if we are in menu/loading OR if we are in Training/Daily mode
  // Training tasks are standalone events, not a multi-stage quest.
  if (getPhaseOrder(currentPhase) < 2 || gameMode === 'TRAINING') return null;

  const tabs = [
    { phase: GamePhase.LEVEL_1, label: t.tabScroll },
    { phase: GamePhase.LEVEL_2, label: t.tabNegotiation },
    { phase: GamePhase.LEVEL_3, label: t.tabReport },
  ];
  
  // Conditionally add Epilogue tab if reached
  if (getPhaseOrder(maxPhaseReached) >= getPhaseOrder(GamePhase.EPILOGUE)) {
      tabs.push({ phase: GamePhase.EPILOGUE, label: t.outcome });
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-4">
      <div className="flex bg-[#2c1810] p-1 rounded-lg shadow-lg border-2 border-[#8a1c1c] overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isUnlocked = getPhaseOrder(maxPhaseReached) >= getPhaseOrder(tab.phase);
          const isActive = currentPhase === tab.phase;

          return (
            <button
              key={tab.phase}
              onClick={() => isUnlocked && jumpToPhase(tab.phase)}
              disabled={!isUnlocked}
              className={`flex-1 min-w-[100px] py-2 px-4 font-fantasy text-sm transition-all duration-300 whitespace-nowrap ${
                isActive
                  ? 'bg-[#f3e5ab] text-[#2c1810] font-bold shadow-inner'
                  : isUnlocked
                  ? 'text-[#f3e5ab] hover:bg-[#3e2318] hover:text-white'
                  : 'text-gray-500 cursor-not-allowed opacity-50'
              } ${isActive ? 'rounded' : 'rounded-sm'}`}
            >
              {tab.label}
              {!isUnlocked && <span className="ml-2">🔒</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
