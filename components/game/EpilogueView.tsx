
import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useGuild } from '../../contexts/GuildContext';
import { FantasyButton } from '../ui/FantasyButton';
import { ParchmentContainer } from '../ui/ParchmentContainer';
import { Icons } from '../ui/Icons';
import { GamePhase, MissionRecord, CEFRLevel } from '../../types';
import { translations } from '../../utils/translations';
import { generateEndingIllustration } from '../../services/geminiService';
import { saveMissionRecord } from '../../utils/storageUtils';

const calculateGrade = (trust: number, reportScore: number): string => {
    const avg = (trust + reportScore) / 2;
    if (avg >= 95) return "S";
    if (avg >= 85) return "A";
    if (avg >= 70) return "B";
    if (avg >= 60) return "C";
    if (avg >= 45) return "D";
    return "F";
};

const calculateRewards = (trust: number, reportScore: number, level: CEFRLevel) => {
    const base = Math.floor((trust + reportScore) / 2);
    const grade = calculateGrade(trust, reportScore);

    let gradeBonus = 0;
    if (grade === 'S') gradeBonus = 50;
    else if (grade === 'A') gradeBonus = 30;
    else if (grade === 'B') gradeBonus = 10;

    let levelMultiplier = 1;
    if (level === CEFRLevel.A2) levelMultiplier = 1.2;
    else if (level === CEFRLevel.B1) levelMultiplier = 1.5;
    else if (level === CEFRLevel.B2) levelMultiplier = 2.0;
    else if (level === CEFRLevel.C1) levelMultiplier = 3.0;

    const total = Math.floor((base + gradeBonus) * levelMultiplier);
    return total;
};

export const EpilogueView: React.FC = () => {
    const { gameState, setGameState } = useGame();
    const { settings } = useSettings();
    const { addGuildMarks, addToBlackBook } = useGuild();
    const { feedback, trustScore, illustrationUrl, playerReport, gameMode, mission } = gameState;
    const [isGeneratingImg, setIsGeneratingImg] = useState(!illustrationUrl);
    const [rewardPoints, setRewardPoints] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const hasSaved = useRef(false);

    // We now rely on global trustScore and feedback.score updates (e.g. from Royal Pardon usage in App.tsx)
    // Local state is just for rendering the grade, but we should derive from global state directly for reactivity

    const t = translations[settings.language];
    const isCampaign = gameMode === 'CAMPAIGN';

    // Check if this is the Demo Mission
    const isDemo = !!mission?.negotiation?.script;

    // Use the snapshotted level from the mission data, fallback to settings if missing (shouldn't happen)
    const missionLevel = mission?.level || settings.targetLevel;

    const currentReportScore = feedback?.score || 0;
    const grade = calculateGrade(trustScore, currentReportScore);

    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

    // Save Logic
    useEffect(() => {
        const finalize = async () => {
            let imgUrl = illustrationUrl;

            // Generate Illustration
            if (isCampaign && !illustrationUrl && !isDemo && settings.apiKey) {
                setIsGeneratingImg(true);
                try {
                    imgUrl = await generateEndingIllustration(settings.apiKey, feedback?.outcome || "Mission finished");
                    setGameState(prev => ({ ...prev, illustrationUrl: imgUrl }));
                } catch (err) { console.error(err); }
                setIsGeneratingImg(false);
            } else if (isDemo) {
                setIsGeneratingImg(false);
            }

            // Save Record & Award Points (Initial)
            if (!hasSaved.current && isCampaign && !isDemo) {
                const points = calculateRewards(trustScore, currentReportScore, missionLevel);
                setRewardPoints(points);
                addGuildMarks(points);

                const record: MissionRecord = {
                    id: generateId(),
                    date: Date.now(),
                    title: mission?.title || "Untitled",
                    level: missionLevel,
                    trustScore: trustScore,
                    reportScore: currentReportScore,
                    grade, // Initial grade
                    outcome: feedback?.outcome || "",
                    corrections: feedback?.corrections || "",
                };
                saveMissionRecord(record);
                hasSaved.current = true;
            }
        };

        finalize();
    }, [feedback, illustrationUrl, isCampaign, isDemo, settings.apiKey, missionLevel, trustScore, currentReportScore]);

    const resetGame = () => {
        setGameState(prev => ({
            ...prev,
            currentPhase: GamePhase.MENU,
            maxPhaseReached: GamePhase.MENU,
            mission: null,
            audioUrl: null,
            trustScore: 50,
            feedback: null,
            playerReport: '',
            level1State: { answers: {}, mcqAnswers: {}, showResults: false, mistakes: [] },
            chatHistory: [],
            metObjectiveIds: [],
            illustrationUrl: undefined
        }));
    };

    const handleSaveReportToBlackBook = () => {
        if (playerReport && feedback?.corrections) {
            addToBlackBook(playerReport, feedback.corrections, 'writing', 'Final Report Corrections');
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <ParchmentContainer className="overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-fantasy text-[#8a1c1c]">
                            {isCampaign ? t.missionComplete : t.trainingComplete}
                        </h2>
                        {isDemo && (
                            <span className="text-xs font-bold bg-yellow-200 text-yellow-800 px-2 py-1 rounded border border-yellow-400 mt-2 inline-block">
                                {t.demoModeNoRewards}
                            </span>
                        )}
                    </div>

                    {gameMode !== 'TRAINING' && (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full border-4 border-dashed border-[#8a1c1c] bg-[#2c1810] flex items-center justify-center rotate-12 mb-2 relative">
                                <span className="text-3xl font-fantasy font-bold text-[#f3e5ab]">{grade}</span>
                            </div>
                            {!isDemo && rewardPoints > 0 && (
                                <div className="animate-bounce bg-yellow-100 px-2 py-1 rounded border border-yellow-400 text-yellow-800 text-xs font-bold flex items-center gap-1">
                                    🪙 +{rewardPoints} {t.guildMarks}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {/* 3. Stats / Grade (Hide for Training Mode) */}
                {gameMode === 'TRAINING' ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-black/5 rounded-lg border-2 border-dashed border-[#2c1810]/20 mb-8">
                        <div className="border-b-4 double border-[#2c1810] pb-6 mb-8 relative text-center w-full">
                            <h1 className="text-5xl font-fantasy font-bold text-[#8a1c1c] mb-2">{t.missionComplete}</h1>
                            <div className="text-lg italic opacity-80 font-serif">{mission?.title}</div>

                            {/* Seal / Grade (Only for Campaign) */}
                            {gameMode !== 'TRAINING' && (
                                <div className="absolute right-0 top-0 rotate-12 bg-[#8a1c1c] text-[#f3e5ab] w-20 h-20 rounded-full flex items-center justify-center font-fantasy font-bold text-5xl shadow-lg border-4 border-double border-[#f3e5ab] animate-in zoom-in spin-in-12 duration-1000">
                                    {grade}
                                </div>
                            )}
                        </div>
                        <h2 className="text-2xl font-fantasy font-bold text-[#2c1810] tracking-widest uppercase">
                            {t.trainingComplete || "Training Complete"}
                        </h2>
                        <p className="text-sm opacity-60 mt-2 italic">
                            {t.trainingNoScore || "Practice makes perfect. No score recorded."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-black/5 p-4 rounded text-center border border-black/10">
                            <div className="text-xs uppercase tracking-widest opacity-60 mb-1">{t.finalTrust}</div>
                            <div className="text-4xl font-fantasy font-bold text-[#2c1810]">{trustScore}</div>
                        </div>
                        <div className="bg-black/5 p-4 rounded text-center border border-black/10">
                            <div className="text-xs uppercase tracking-widest opacity-60 mb-1">{t.reportScore}</div>
                            <div className="text-4xl font-fantasy font-bold text-[#2c1810]">{currentReportScore}</div>
                        </div>
                    </div>
                )}

                <div className="space-y-8">
                    {isCampaign && (
                        <div className="relative aspect-video w-full rounded border-4 border-[#2c1810] shadow-xl bg-black/10 flex items-center justify-center overflow-hidden group">
                            {isGeneratingImg ? (
                                <div className="flex flex-col items-center animate-pulse">
                                    <div className="text-4xl mb-2">🎨</div>
                                    <div className="font-fantasy text-sm">{t.paintingIllustration}...</div>
                                </div>
                            ) : illustrationUrl ? (
                                <img src={illustrationUrl} alt="Ending" className="w-full h-full object-cover" />
                            ) : isDemo ? (
                                <div className="text-center opacity-50 p-4">
                                    <div className="text-4xl mb-2">🖼️</div>
                                    <div className="text-sm font-fantasy">Illustrations are disabled in Demo Mode</div>
                                </div>
                            ) : (
                                <div className="text-center opacity-50 p-4 flex flex-col items-center gap-2">
                                    <div className="text-4xl mb-2">🎨</div>
                                    <div className="text-sm font-fantasy">{t.paintingIllustration}</div>
                                    {isCampaign && settings.apiKey && (
                                        <FantasyButton
                                            onClick={() => {
                                                setIsGeneratingImg(true);
                                                generateEndingIllustration(settings.apiKey, feedback?.outcome || "Mission finished")
                                                    .then(url => {
                                                        setGameState(prev => ({ ...prev, illustrationUrl: url }));
                                                        setIsGeneratingImg(false);
                                                    })
                                                    .catch(e => {
                                                        console.error(e);
                                                        setIsGeneratingImg(false);
                                                    });
                                            }}
                                            className="text-xs"
                                        >
                                            Paint Scene
                                        </FantasyButton>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className={`grid grid-cols-1 ${isCampaign ? 'md:grid-cols-2' : ''} gap-6`}>
                        {feedback?.outcome && (
                            <div className="p-5 bg-white/40 rounded border border-black/10">
                                <h3 className="text-lg font-bold mb-2 font-fantasy border-b border-black/10">{t.outcome}</h3>
                                <p className="italic text-sm">{feedback?.outcome}</p>
                            </div>
                        )}
                        {playerReport && (
                            <div className="p-5 bg-white/40 rounded border border-black/10">
                                <h3 className="text-lg font-bold mb-2 font-fantasy border-b border-black/10">{t.yourReport}</h3>
                                <p className="text-xs font-body whitespace-pre-wrap max-h-[150px] overflow-y-auto">{playerReport}</p>
                            </div>
                        )}
                    </div>

                    {feedback?.corrections && (
                        <div className="p-6 bg-[#2c1810] text-[#f3e5ab] rounded shadow-inner border-2 border-[#8a1c1c]/30 relative">
                            <h3 className="text-xl font-bold mb-3 font-fantasy text-center text-[#d4c59a] uppercase tracking-widest">
                                {t.corrections}
                            </h3>
                            <div className="whitespace-pre-wrap font-mono text-[10px] md:text-xs leading-loose p-4 bg-black/20 rounded">
                                {feedback?.corrections}
                            </div>
                            <button
                                onClick={handleSaveReportToBlackBook}
                                disabled={isSaved}
                                className={`absolute bottom-2 right-2 text-[10px] uppercase font-bold transition-colors ${isSaved ? 'text-green-400 cursor-default' : 'text-[#f3e5ab] opacity-50 hover:opacity-100 hover:underline'}`}
                            >
                                {isSaved ? `✓ ${t.savedToBlackBook}` : t.saveToBlackBook}
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col items-center gap-4 pt-4 border-t border-black/10">
                        <FantasyButton onClick={resetGame}>{t.returnToHall}</FantasyButton>
                    </div>
                </div>
            </ParchmentContainer >
        </div >
    );
};
