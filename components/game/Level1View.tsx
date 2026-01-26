
import React, { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useSettings } from '../../contexts/SettingsContext';
import { FantasyButton } from '../ui/FantasyButton';
import { ParchmentContainer } from '../ui/ParchmentContainer';
import { HistoricalNote } from '../ui/HistoricalNote';
import { AudioPlayer } from '../ui/AudioPlayer';
import { translations } from '../../utils/translations';
import { pcmToWav } from '../../utils/audioUtils';

export const Level1View: React.FC = () => {
  const { gameState, setGameState, advancePhase } = useGame();
  const { settings } = useSettings();
  const { mission, audioUrl, level1State } = gameState;
  const [demoAudioUrl, setDemoAudioUrl] = useState<string | null>(null);
  
  const t = translations[settings.language];
  const isDemo = !!mission?.negotiation?.script;

  useEffect(() => {
    // In demo mode, if no real audio, generate silence to show the player UI
    if (isDemo && !audioUrl) {
        const sampleRate = 24000;
        const silence = new Uint8Array(sampleRate * 2); // 1 sec silence
        const wavBlob = pcmToWav(silence, sampleRate);
        const url = URL.createObjectURL(wavBlob);
        setDemoAudioUrl(url);
        return () => URL.revokeObjectURL(url);
    }
  }, [isDemo, audioUrl]);

  if (!mission || !mission.decryptedMessage || !mission.decryptedMessage.segments) {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <ParchmentContainer>
                <div className="text-center text-red-800 font-bold">
                    {t.errorTitle}: Mission data is corrupted.
                </div>
            </ParchmentContainer>
        </div>
    );
  }

  const handleClozeSelect = (id: string, value: string) => {
    setGameState(prev => ({
      ...prev,
      level1State: {
        ...prev.level1State,
        answers: { ...prev.level1State.answers, [id]: value }
      }
    }));
  };

  const handleMcqSelect = (id: string, value: string) => {
      setGameState(prev => ({
          ...prev,
          level1State: {
              ...prev.level1State,
              mcqAnswers: { ...prev.level1State.mcqAnswers, [id]: value }
          }
      }));
  };

  const checkAnswers = () => {
    const mistakes: any[] = [];
    
    // Check Cloze
    mission.decryptedMessage?.segments.forEach(s => {
        if (level1State.answers[s.id] !== s.answer) {
            mistakes.push({
                original: level1State.answers[s.id] || "???",
                correct: s.answer,
                context: `${s.textBefore} [${s.answer}] ${s.textAfter}`
            });
        }
    });

    // Check MCQs
    mission.decryptedMessage?.readingQuestions?.forEach(q => {
        const selected = level1State.mcqAnswers[q.id];
        if (selected !== q.correctAnswer) {
             mistakes.push({
                 original: selected || "???",
                 correct: q.correctAnswer,
                 context: q.question
             });
        }
    });

    setGameState(prev => ({
      ...prev,
      level1State: {
        ...prev.level1State,
        showResults: true,
        mistakes
      }
    }));
  };

  const isClozeCorrect = (id: string) => {
    const segment = mission.decryptedMessage?.segments.find(s => s.id === id);
    return segment && level1State.answers[id] === segment.answer;
  };

  // Logic to calculate overall success (must get most things right to proceed? Or just show corrections)
  // Currently we allow proceeding regardless, but show visually what is wrong.
  const allCorrect = level1State.mistakes.length === 0 && level1State.showResults;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <ParchmentContainer>
        <div className="relative">
           {isDemo && (
             <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 z-10 uppercase tracking-widest shadow-md transform translate-x-4 -translate-y-4">
                 Demo Mode
             </div>
           )}
           <h2 className="text-3xl font-fantasy text-center mb-6">{t.phase1Title}</h2>
        </div>
        <p className="italic text-center mb-4 text-sm opacity-80">{mission.scenarioDescription}</p>
        
        <div className="flex justify-center mb-6">
           <AudioPlayer src={audioUrl || demoAudioUrl} className="w-full max-w-md" />
        </div>

        {/* CLOZE SECTION */}
        <div className="text-lg leading-loose text-justify p-6 bg-white/20 rounded border border-black/10 mb-8">
          {mission.decryptedMessage.segments.map((segment) => {
             const isWrong = level1State.showResults && !isClozeCorrect(segment.id);
             return (
                <React.Fragment key={segment.id}>
                <span>{segment.textBefore} </span>
                <span className="inline-block relative">
                    <select
                        className={`mx-1 border-b-2 bg-transparent outline-none cursor-pointer transition-colors appearance-none pr-6 text-center min-w-[80px] ${
                        level1State.showResults 
                            ? isClozeCorrect(segment.id) 
                            ? 'border-green-600 text-green-900 font-bold' 
                            : 'border-red-600 text-red-900 font-bold line-through opacity-70'
                            : 'border-black/40 hover:border-black font-bold'
                        }`}
                        value={level1State.answers[segment.id] || ''}
                        onChange={(e) => handleClozeSelect(segment.id, e.target.value)}
                        disabled={level1State.showResults}
                    >
                        <option value="" disabled>???</option>
                        {[segment.answer, ...segment.distractors].sort().map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    {isWrong && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white bg-green-700 px-1 rounded shadow whitespace-nowrap z-10 animate-in fade-in slide-in-from-bottom-2">
                            {segment.answer}
                        </span>
                    )}
                </span>
                <span> {segment.textAfter} </span>
                </React.Fragment>
             );
          })}
        </div>

        {/* MCQ SECTION (If exists) */}
        {mission.decryptedMessage.readingQuestions && mission.decryptedMessage.readingQuestions.length > 0 && (
            <div className="space-y-6 border-t-2 border-black/10 pt-6 mt-6">
                <h3 className="font-fantasy text-xl font-bold text-center text-[#2c1810]">Comprehension Questions</h3>
                {mission.decryptedMessage.readingQuestions.map((q, idx) => (
                    <div key={q.id} className="bg-white/30 p-4 rounded border border-[#2c1810]/10">
                        <p className="font-bold mb-3">{idx + 1}. {q.question}</p>
                        <div className="space-y-2">
                            {q.options.map(option => {
                                const isSelected = level1State.mcqAnswers[q.id] === option;
                                const isCorrectAnswer = q.correctAnswer === option;
                                
                                let btnClass = "border-black/20 hover:bg-[#2c1810]/5"; // default
                                if (level1State.showResults) {
                                    if (isCorrectAnswer) {
                                        btnClass = "bg-green-600/20 border-green-600 text-green-900 font-bold shadow-[0_0_5px_rgba(0,128,0,0.3)]";
                                    } else if (isSelected && !isCorrectAnswer) {
                                        btnClass = "bg-red-600/20 border-red-600 text-red-900 opacity-70";
                                    } else {
                                        btnClass = "opacity-50 border-transparent";
                                    }
                                } else if (isSelected) {
                                    btnClass = "bg-[#2c1810] text-[#f3e5ab] border-[#2c1810] font-bold";
                                }

                                return (
                                    <button 
                                        key={option}
                                        onClick={() => handleMcqSelect(q.id, option)}
                                        disabled={level1State.showResults}
                                        className={`w-full text-left p-2 rounded border transition-all ${btnClass}`}
                                    >
                                        <span className="inline-block w-6 text-center mr-2 opacity-50 font-mono">
                                            {level1State.showResults 
                                                ? (isCorrectAnswer ? '✓' : (isSelected ? '✗' : '○')) 
                                                : (isSelected ? '●' : '○')
                                            }
                                        </span>
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        )}

        <div className="mt-8 flex justify-end space-x-4">
          {!level1State.showResults && (
            <FantasyButton onClick={checkAnswers}>{t.decrypt}</FantasyButton>
          )}
          {level1State.showResults && (
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <span className={allCorrect ? "text-green-800 font-bold" : "text-red-800 font-bold"}>
                        {allCorrect ? t.decryptionSuccess : t.decryptionIncomplete}
                    </span>
                    {!allCorrect && <span className="text-xs italic opacity-70">Review the corrections above</span>}
                </div>
                <FantasyButton onClick={advancePhase}>{t.proceedToNegotiation}</FantasyButton>
            </div>
          )}
        </div>
      </ParchmentContainer>
      
      {/* Historical Context Note */}
      <HistoricalNote data={mission.historicalFact} className="mt-8" />
    </div>
  );
};
