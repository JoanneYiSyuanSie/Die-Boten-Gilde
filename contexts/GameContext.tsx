
import React, { createContext, useContext, useState } from 'react';
import { GameState, GamePhase, MissionData, getPhaseOrder, GameMode } from '../types';
import { calculateInitialTrust } from '../constants/npcTraits';

interface GameContextType {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  startGame: (mission: MissionData, audioUrl: string, mode?: GameMode, startPhase?: GamePhase, playerIdentityId?: string) => void;
  advancePhase: () => void;
  jumpToPhase: (phase: GamePhase) => void;
  updateTrust: (delta: number) => void;
  markObjectiveMet: (id: string) => void;
  cacheAudio: (index: number, url: string) => void;
  abandonMission: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from storage or default
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem('boten_gilde_gamestate');
      if (saved) {
        const parsed: GameState = JSON.parse(saved);

        // Critical Validation: If we are in LEVEL_1, we MUST have a decryptedMessage.
        // If not, it means the save is from a bad generation or corrupted.
        if (parsed.currentPhase === GamePhase.LEVEL_1) {
          if (!parsed.mission || !parsed.mission.decryptedMessage) {
            console.warn("Detected corrupted save state (Level 1 with no message). Resetting to Menu.");
            // Return default state instead
            throw new Error("Corrupted State");
          }
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to load game state or state corrupted", e);
    }

    // Default Fallback
    return {
      gameMode: 'CAMPAIGN',
      currentPhase: GamePhase.MENU,
      maxPhaseReached: GamePhase.MENU,
      mission: null,
      audioUrl: null,
      trustScore: 50,
      playerReport: '',
      feedback: null,
      level1State: { answers: {}, mcqAnswers: {}, showResults: false, mistakes: [] },
      chatHistory: [],
      lastNegotiationFeedback: null,
      audioCache: {},
      metObjectiveIds: [],
      illustrationUrl: undefined,
      playerIdentityId: undefined,
    };
  });

  // Persist state on change
  React.useEffect(() => {
    localStorage.setItem('boten_gilde_gamestate', JSON.stringify(gameState));
  }, [gameState]);

  const startGame = (mission: MissionData, audioUrl: string, mode: GameMode = 'CAMPAIGN', startPhase: GamePhase = GamePhase.LEVEL_1, playerIdentityId?: string) => {
    // Calculate Initial Trust based on Mode + Traits + Synergy
    let initialTrust = 50;

    // Only calculate complex trust if we have NPC attributes (Level 2 exists)
    if (mission.negotiation?.npcAttributes) {
      initialTrust = calculateInitialTrust(mode, mission.negotiation.npcAttributes, playerIdentityId);
    } else {
      // Fallback for simple modes or legacy data
      initialTrust = mode === 'TRAINING' ? 50 : 0;
    }

    setGameState(prev => ({
      ...prev,
      gameMode: mode,
      currentPhase: startPhase,
      maxPhaseReached: startPhase,
      mission,
      audioUrl,
      trustScore: initialTrust,
      playerReport: '',
      feedback: null,
      level1State: { answers: {}, mcqAnswers: {}, showResults: false, mistakes: [] },
      chatHistory: [],
      lastNegotiationFeedback: null,
      audioCache: {},
      metObjectiveIds: [],
      illustrationUrl: undefined,
      playerIdentityId: playerIdentityId,
    }));
  };

  const advancePhase = () => {
    setGameState(prev => {
      if (prev.gameMode === 'TRAINING') {
        return { ...prev, currentPhase: GamePhase.EPILOGUE, maxPhaseReached: GamePhase.EPILOGUE };
      }
      let nextPhase = prev.currentPhase;
      if (prev.currentPhase === GamePhase.LEVEL_1) nextPhase = GamePhase.LEVEL_2;
      else if (prev.currentPhase === GamePhase.LEVEL_2) nextPhase = GamePhase.LEVEL_3;
      else if (prev.currentPhase === GamePhase.LEVEL_3) nextPhase = GamePhase.EPILOGUE;

      const newMax = getPhaseOrder(nextPhase) > getPhaseOrder(prev.maxPhaseReached)
        ? nextPhase
        : prev.maxPhaseReached;

      return { ...prev, currentPhase: nextPhase, maxPhaseReached: newMax };
    });
  };

  const jumpToPhase = (phase: GamePhase) => {
    setGameState(prev => {
      if (getPhaseOrder(phase) > getPhaseOrder(prev.maxPhaseReached)) return prev;
      return { ...prev, currentPhase: phase };
    });
  };

  const abandonMission = () => {
    setGameState(prev => ({
      ...prev,
      currentPhase: GamePhase.MENU,
      maxPhaseReached: GamePhase.MENU,
      mission: null,
      audioUrl: null,
      chatHistory: [],
      level1State: { answers: {}, mcqAnswers: {}, showResults: false, mistakes: [] },
      feedback: null,
      playerReport: '',
      lastNegotiationFeedback: null,
      metObjectiveIds: [],
      illustrationUrl: undefined
      // We keep trustScore as is, or reset it? User asked to "restart". 
      // Usually resetting to default (50) is safer for a "fresh start".
      // checking initial state above... trustScore: 50.
    }));
  }

  const updateTrust = (delta: number) => {
    setGameState(prev => ({
      ...prev,
      trustScore: Math.min(100, Math.max(0, prev.trustScore + delta))
    }));
  };

  const markObjectiveMet = (id: string) => {
    setGameState(prev => ({
      ...prev,
      metObjectiveIds: Array.from(new Set([...prev.metObjectiveIds, id]))
    }));
  };

  const cacheAudio = (index: number, url: string) => {
    setGameState(prev => ({
      ...prev,
      audioCache: { ...prev.audioCache, [index]: url }
    }));
  };

  return (
    <GameContext.Provider value={{ gameState, setGameState, startGame, advancePhase, jumpToPhase, updateTrust, markObjectiveMet, cacheAudio, abandonMission }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};
