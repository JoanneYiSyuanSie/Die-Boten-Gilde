
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useGuild } from '../../contexts/GuildContext';
import { evaluateReport } from '../../services/geminiService';
import { FantasyButton } from '../ui/FantasyButton';
import { ParchmentContainer } from '../ui/ParchmentContainer';
import { HistoricalNote } from '../ui/HistoricalNote';
import { translations } from '../../utils/translations';
import { CEFRLevel } from '../../types';

export const Level3View: React.FC = () => {
  const { gameState, setGameState, advancePhase } = useGame();
  const { settings } = useSettings();
  const { addToBlackBook } = useGuild();
  const [report, setReport] = useState(gameState.playerReport);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = translations[settings.language];
  const specialChars = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];
  
  // Logic: Calculate Min Word Count based on CEFR Level
  const getMinWordCount = (level: CEFRLevel) => {
      switch(level) {
          case CEFRLevel.A1: return 30;
          case CEFRLevel.A2: return 50;
          case CEFRLevel.B1: return 100;
          case CEFRLevel.B2: return 150;
          case CEFRLevel.C1: return 200;
          default: return 100;
      }
  };

  const targetLevel = gameState.mission?.level || settings.targetLevel;
  const minWordCount = getMinWordCount(targetLevel);

  // Keep global state in sync with local input for persistence
  const handleReportChange = (val: string) => {
    setReport(val);
    setGameState(prev => ({
        ...prev,
        playerReport: val
    }));
  };

  const insertCharacter = (char: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
        handleReportChange(report + char);
        return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const scrollTop = textarea.scrollTop; // Capture current scroll position
    const text = report;
    const newText = text.substring(0, start) + char + text.substring(end);
    
    handleReportChange(newText);

    // Use requestAnimationFrame to restore focus and scroll AFTER the value update has rendered
    requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 1, start + 1);
        textarea.scrollTop = scrollTop; // Restore scroll position
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        // DEMO MODE CHECK
        if (gameState.mission?.mockFeedback) {
            // Simulate network delay for effect
            await new Promise(r => setTimeout(r, 1500));
            const mock = gameState.mission.mockFeedback;
            setGameState(prev => ({
                ...prev,
                playerReport: report,
                feedback: {
                    score: mock.score,
                    outcome: mock.outcome,
                    corrections: mock.correction
                }
            }));
            advancePhase();
            return;
        }

        // REAL API CALL
        const result = await evaluateReport(settings.apiKey, report, settings.targetLevel, settings.language);
        setGameState(prev => ({
            ...prev,
            playerReport: report,
            feedback: result
        }));
        
        advancePhase();
    } catch (e) {
        console.error(e);
        alert("The raven failed to deliver your report. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const currentWordCount = report.trim().length === 0 ? 0 : report.trim().split(/\s+/).length;
  const isLengthValid = currentWordCount >= minWordCount;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <ParchmentContainer>
        <div className="relative">
            {gameState.mission?.mockFeedback && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 z-10 uppercase tracking-widest shadow-md">
                    Demo Mode
                </div>
            )}
            <h2 className="text-2xl md:text-3xl font-fantasy text-center mb-6">{t.phase3Title}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="col-span-1 bg-white/30 border border-black/20 rounded p-4 h-fit">
                <div className="flex items-center gap-2 mb-3 border-b border-black/10 pb-2">
                    <h3 className="font-bold font-fantasy text-lg uppercase tracking-wide">{t.yourOrders}</h3>
                </div>
                <div className="text-sm space-y-2 whitespace-pre-wrap leading-relaxed mb-4">
                    {gameState.mission?.reportPrompt}
                </div>
                <div className="text-xs font-bold border-t border-black/10 pt-2">
                    Mindestlänge: <span className="text-[#8a1c1c]">{minWordCount} Wörter</span>.
                </div>
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-col">
                <div className="flex gap-2 mb-2 flex-wrap justify-center md:justify-start">
                    {specialChars.map(char => (
                        <button
                            key={char}
                            onClick={() => insertCharacter(char)}
                            className="special-char-btn w-10 h-10 md:w-8 md:h-8 flex items-center justify-center bg-[#2c1810] text-[#f3e5ab] font-serif font-bold rounded shadow hover:bg-[#8a1c1c] active:scale-95 transition-all border border-[#f3e5ab]/20 text-lg md:text-base"
                            title={`Insert ${char}`}
                        >
                            {char}
                        </button>
                    ))}
                </div>

                <textarea
                    ref={textareaRef}
                    className="w-full h-64 md:h-80 p-4 md:p-6 bg-[#fffdf0] border-2 border-[#2c1810] rounded-sm font-body text-base md:text-lg leading-relaxed focus:outline-none focus:ring-4 focus:ring-[#8a1c1c]/20 shadow-inner resize-none bg-[linear-gradient(transparent_31px,#ccc_32px)] bg-local"
                    style={{ backgroundSize: '100% 32px', lineHeight: '32px' }}
                    placeholder={t.reportPlaceholder}
                    value={report}
                    onChange={(e) => handleReportChange(e.target.value)}
                />
            </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center border-t border-black/10 pt-4 gap-4">
            <div className={`text-sm font-bold ${isLengthValid ? 'text-green-800' : 'text-red-800'}`}>
                Wörter: {currentWordCount} / {minWordCount}
                {!isLengthValid && <span className="ml-2 text-xs font-normal opacity-75">(Schreiben Sie mehr, um abzuschicken)</span>}
            </div>
            <FantasyButton onClick={handleSubmit} disabled={isSubmitting || !isLengthValid} className="w-full md:w-auto">
                {isSubmitting ? "Sende..." : "Abschicken"}
            </FantasyButton>
        </div>
      </ParchmentContainer>
      
      <HistoricalNote data={gameState.mission?.historicalFact} className="mt-8" />
    </div>
  );
};
