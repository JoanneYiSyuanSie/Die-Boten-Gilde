
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useGuild } from '../../contexts/GuildContext';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { evaluateNegotiation, generateTTS, translateText } from '../../services/geminiService';
import { FantasyButton } from '../ui/FantasyButton';
import { ParchmentContainer } from '../ui/ParchmentContainer';
import { HistoricalNote } from '../ui/HistoricalNote';
import { AudioPlayer } from '../ui/AudioPlayer';
import { translations } from '../../utils/translations';
import { ChatMessage, GamePhase } from '../../types';
import { pcmToWav } from '../../utils/audioUtils';
import { SHOP_ITEMS } from '../../constants/shopItems';
import { getTraitDef, checkSynergy } from '../../constants/npcTraits';
import { Icons } from '../ui/Icons';

export const Level2View: React.FC = () => {
    const { gameState, setGameState, updateTrust, markObjectiveMet, advancePhase, cacheAudio } = useGame();
    const { settings } = useSettings();
    const { addToBlackBook } = useGuild();
    const { mission, chatHistory, metObjectiveIds, audioCache, playerIdentityId, lastNegotiationFeedback } = gameState;

    const { isRecording, transcript, startRecording, stopRecording, abortRecording, resetTranscript } = useSpeechRecognition('de-DE');

    const [isLoading, setIsLoading] = useState(false);
    const [lastPlayerInput, setLastPlayerInput] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    // Mobile Sidebar Toggle
    const [isMobileInfoOpen, setIsMobileInfoOpen] = useState(false);

    // Demo Mode State
    const isDemo = !!mission?.negotiation?.script;
    const [demoScriptIndex, setDemoScriptIndex] = useState(0);

    const [translationsCache, setTranslationsCache] = useState<Record<number, string>>({});
    const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
    const [loadingAudioIndices, setLoadingAudioIndices] = useState<Set<number>>(new Set());
    const [failedAudioIndices, setFailedAudioIndices] = useState<Set<number>>(new Set());
    const [loadingTranslationIndices, setLoadingTranslationIndices] = useState<Set<number>>(new Set());
    const [activeTooltip, setActiveTooltip] = useState<{ text: string, x: number, y: number } | null>(null);

    // Track initial history length to prevent re-playing old messages on navigation
    const initialHistoryLength = useRef(chatHistory.length);

    const bottomRef = useRef<HTMLDivElement>(null);
    const t = translations[settings.language];

    // Logic to check if ALL main goals are done
    const mainObjectives = mission?.negotiation?.objectives.filter(o => o.isMain) || [];
    const isMainMet = mainObjectives.length > 0
        ? mainObjectives.every(o => metObjectiveIds.includes(o.id))
        : true;

    // Get current demo hint if available
    const currentDemoHint = isDemo && mission?.negotiation?.script?.[demoScriptIndex]?.hint;
    const isDemoFinished = isDemo && demoScriptIndex >= (mission?.negotiation?.script?.length || 0);

    const appendMessage = (msg: ChatMessage) => {
        setGameState(prev => ({
            ...prev,
            chatHistory: [...prev.chatHistory, msg]
        }));
    };

    useEffect(() => {
        if (mission?.negotiation && chatHistory.length === 0) {
            appendMessage({ role: 'npc', text: mission.negotiation.initialStatement });
        }
    }, [mission, chatHistory.length]);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory, translationsCache]);

    useEffect(() => {
        // Audio Generation Logic
        chatHistory.forEach((msg, index) => {
            // Check if audio is missing and not already loading/failed
            if (msg.role === 'npc' && !audioCache[index] && !loadingAudioIndices.has(index) && !failedAudioIndices.has(index)) {

                // Skip TTS for non-pronounceable text (e.g. "..." error messages or empty lines)
                if (!/[a-zA-Z0-9äöüÄÖÜß]/.test(msg.text)) return;

                if (isDemo) {
                    // DEMO MODE: Use static audio files if available
                    let staticUrl = "";

                    if (index === 0) {
                        // Initial statement
                        staticUrl = mission?.negotiation?.initialStatementAudio || "";
                    } else {
                        // Calculate script index based on chat history index
                        // Chat indices: 0 (NPC), 1 (Player), 2 (NPC - Script 0), 3 (Player), 4 (NPC - Script 1) ...
                        // Script Step Index = (Chat Index / 2) - 1
                        const scriptIndex = (index / 2) - 1;
                        if (mission?.negotiation?.script && scriptIndex >= 0 && mission.negotiation.script[scriptIndex]) {
                            staticUrl = mission.negotiation.script[scriptIndex].audioUrl || "";
                        }
                    }

                    if (staticUrl) {
                        cacheAudio(index, staticUrl);
                    } else {
                        // Fallback to silence if file mapping is missing
                        generateSilentAudio(index);
                    }
                } else if (settings.apiKey) {
                    // REAL MODE: Generate real audio
                    generateAudioForMessage(index, msg.text);
                }
            }
        });
    }, [chatHistory, isDemo, settings.apiKey]);

    const generateSilentAudio = (index: number) => {
        // Create 1 second of silence
        const sampleRate = 24000;
        const silence = new Uint8Array(sampleRate * 2); // 16-bit mono = 2 bytes per sample. 24000 samples = 1 sec.
        const wavBlob = pcmToWav(silence, sampleRate);
        const url = URL.createObjectURL(wavBlob);
        cacheAudio(index, url);
    };

    const generateAudioForMessage = async (index: number, text: string) => {
        setLoadingAudioIndices(prev => new Set(prev).add(index));
        setFailedAudioIndices(prev => { const s = new Set(prev); s.delete(index); return s; });
        try {
            const voice = mission?.negotiation?.npcVoice || 'Puck';
            const url = await generateTTS(settings.apiKey, text, voice);
            cacheAudio(index, url);
        } catch (e: any) {
            // Only log and mark as failed if it's NOT a known "safe" error (like empty text or API refusal)
            if (e.message !== "Text empty after sanitization") {
                console.error("TTS failed", e);
                setFailedAudioIndices(prev => new Set(prev).add(index));
            }
        } finally {
            setLoadingAudioIndices(prev => {
                const next = new Set(prev);
                next.delete(index);
                return next;
            });
        }
    };

    const handleTranslate = async (index: number, text: string) => {
        if (translationsCache[index]) return;

        // --- DEMO TRANSLATION MOCK ---
        if (isDemo) {
            let translation = "";
            if (index === 0) {
                translation = mission?.negotiation?.initialStatementTranslation || "Translation unavailable in demo.";
            } else {
                // Map chat history index to script step
                const scriptIndex = (index / 2) - 1;
                if (mission?.negotiation?.script && scriptIndex >= 0) {
                    translation = mission.negotiation.script[scriptIndex]?.npcTranslation || "Translation unavailable in demo.";
                }
            }
            setTranslationsCache(prev => ({ ...prev, [index]: translation }));
            return;
        }

        // --- REAL TRANSLATION ---
        setLoadingTranslationIndices(prev => new Set(prev).add(index));
        try {
            const result = await translateText(settings.apiKey, text, settings.language);
            setTranslationsCache(prev => ({ ...prev, [index]: result }));
        } catch (e) {
            console.error("Translation failed", e);
        } finally {
            setLoadingTranslationIndices(prev => {
                const next = new Set(prev);
                next.delete(index);
                return next;
            });
        }
    };

    const revealText = (index: number) => {
        // One-way reveal only. Do not toggle off.
        setRevealedIndices(prev => new Set(prev).add(index));
    };

    const handleSend = async () => {
        const playerInput = transcript;
        if (isRecording) abortRecording();

        // Safety check: Prevent sending if demo is finished
        if (isDemoFinished) return;

        // In demo, we allow empty input to trigger the next step for smoother tutorial
        if (!isDemo && !playerInput.trim()) return;

        resetTranscript();
        setIsLoading(true);
        setIsSaved(false); // Reset saved state for new turn

        // --- DEMO MODE LOGIC ---
        if (isDemo && mission?.negotiation?.script) {
            const currentStep = mission.negotiation.script[demoScriptIndex];

            // Extra safety check if index is somehow out of bounds
            if (!currentStep) {
                setIsLoading(false);
                return;
            }

            // Simulate Processing Delay
            await new Promise(r => setTimeout(r, 800));

            // 1. Show the SCRIPTED imperfect input
            appendMessage({ role: 'player', text: currentStep.userRaw });
            setLastPlayerInput(currentStep.userRaw);

            // 2. Set Feedback
            setGameState(prev => ({ ...prev, lastNegotiationFeedback: currentStep.correction }));

            // 3. Update stats
            updateTrust(currentStep.trustGain);

            // 4. Complete Objectives based on steps
            if (demoScriptIndex === 0) markObjectiveMet('obj1');
            if (demoScriptIndex === 1) markObjectiveMet('obj2');

            // 5. Show NPC Response
            setTimeout(() => {
                if (!currentStep.finalReveal) {
                    appendMessage({ role: 'npc', text: currentStep.npcText });
                }
                setIsLoading(false);
                setDemoScriptIndex(prev => prev + 1);
            }, 800);

            return;
        }

        // --- REAL AI LOGIC ---
        appendMessage({ role: 'player', text: playerInput });
        setLastPlayerInput(playerInput);

        try {
            const history = [...chatHistory, { role: 'player', text: playerInput }];

            // Get Player Identity Prompt
            let identityPrompt = undefined;
            if (playerIdentityId) {
                const item = SHOP_ITEMS.find(i => i.id === playerIdentityId);
                if (item?.promptTag) identityPrompt = item.promptTag;
            }

            const result = await evaluateNegotiation(
                settings.apiKey,
                history,
                gameState.trustScore,
                mission?.negotiation?.objectives || [],
                settings.targetLevel,
                settings.language,
                identityPrompt
            );

            updateTrust(result.trustChange);

            // Update global feedback state
            setGameState(prev => ({ ...prev, lastNegotiationFeedback: result.feedback }));

            // Update met objectives
            if (result.completedObjectiveIds) {
                result.completedObjectiveIds.forEach(id => markObjectiveMet(id));
            }

            appendMessage({ role: 'npc', text: result.npcResponse });
        } catch (error) {
            console.error(error);
            appendMessage({ role: 'npc', text: "..." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveToBlackBook = () => {
        // Use lastPlayerInput (local) if just sent, or try to find it from history if page reloaded
        // Ideally we would persist lastPlayerInput too, but for now we rely on the session
        const inputToSave = lastPlayerInput || (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'player' ? chatHistory[chatHistory.length - 1].text : "???");

        if (lastNegotiationFeedback && inputToSave) {
            addToBlackBook(inputToSave, lastNegotiationFeedback, 'speaking', 'Level 2 Feedback');
            setIsSaved(true);
            // Auto-reset save state after 3 seconds
            setTimeout(() => setIsSaved(false), 3000);
        }
    };


    // Render Helper for Trait Badges
    const renderTraitBadge = (traitId: string) => {
        const traitDef = getTraitDef(traitId);
        if (!traitDef) return null;

        const synergy = checkSynergy(playerIdentityId || '', mission?.negotiation?.npcAttributes || { roleId: '', backgroundId: '', personalityId: '' });
        let synergyClass = "border-black/20 bg-white/40";

        // Highlighting synergy logic can be expanded here if needed

        return (
            <div
                key={traitId}
                className={`text-[10px] px-2 py-1 rounded border flex flex-col ${synergyClass} cursor-help group relative`}
                onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setActiveTooltip({
                        text: traitDef.description[settings.language],
                        x: rect.left + (rect.width / 2),
                        y: rect.top
                    });
                }}
                onMouseLeave={() => setActiveTooltip(null)}
            >
                <span className="font-bold flex items-center gap-1">
                    {traitDef.name[settings.language]}
                </span>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col md:grid md:grid-cols-4 gap-4 md:gap-6 h-[85vh] md:h-[80vh]">

            {/* Mobile Toggle Button for Mission Info */}
            <div className="md:hidden flex justify-between items-center bg-[#f3e5ab] p-2 rounded border border-[#2c1810]">
                <span className="font-fantasy font-bold text-[#8a1c1c] text-sm">{t.target}: {mission?.negotiation?.npcName}</span>
                <button
                    onClick={() => setIsMobileInfoOpen(!isMobileInfoOpen)}
                    className="text-xs font-bold underline text-[#2c1810]"
                >
                    {isMobileInfoOpen ? t.hideInfo : t.showInfo}
                </button>
            </div>

            {/* Sidebar: NPC Status & Objectives */}
            <div className={`
        col-span-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out
        ${isMobileInfoOpen ? 'max-h-[300px] mb-4' : 'max-h-0 md:max-h-full md:mb-0'}
        md:h-full
      `}>
                <ParchmentContainer className="flex-1 overflow-y-auto h-full flex flex-col relative md:block">
                    {isDemo && (
                        <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 z-10 uppercase tracking-widest shadow-md">
                            Demo
                        </div>
                    )}

                    <h3 className="text-xl font-fantasy font-bold mb-1">{mission?.negotiation?.npcName}</h3>
                    <p className="text-xs italic mb-4 whitespace-pre-wrap opacity-70 leading-tight">{mission?.negotiation?.npcRole}</p>

                    {/* TRAIT BADGES (NEW STRUCTURE) */}
                    {mission?.negotiation?.npcAttributes ? (
                        <div className="flex flex-wrap gap-2 mb-4 p-1 relative z-50">
                            {renderTraitBadge(mission.negotiation.npcAttributes.roleId)}
                            {renderTraitBadge(mission.negotiation.npcAttributes.backgroundId)}
                            {renderTraitBadge(mission.negotiation.npcAttributes.personalityId)}
                        </div>
                    ) : (
                        mission?.negotiation?.npcTraits && (
                            <div className="flex flex-wrap gap-2 mb-4 relative z-50">
                                {mission.negotiation.npcTraits.map((tId: string) => (
                                    <div key={tId} className="text-[10px] px-2 py-1 rounded border border-black/20 bg-white/40 font-bold">
                                        {tId}
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    <div className="mb-4 md:mb-6">
                        <label className="font-bold block text-sm mb-1">{t.goalLabel}</label>
                        <p className="text-xs italic border-l-2 border-[#8a1c1c] pl-2">{mission?.negotiation?.goal}</p>
                    </div>

                    <div className="mb-4 md:mb-6">
                        <label className="font-bold block text-sm mb-2 border-b border-black/10">{t.objectivesLabel}</label>
                        <ul className="space-y-2">
                            {mission?.negotiation?.objectives.map(obj => {
                                const isMet = metObjectiveIds.includes(obj.id);
                                return (
                                    <li key={obj.id} className="text-xs group">
                                        <div className="flex items-start gap-2">
                                            <div className={`mt-0.5 w-4 h-4 flex-shrink-0 border rounded flex items-center justify-center transition-colors ${isMet ? 'bg-green-600 border-green-800 text-white shadow-[0_0_5px_green]' : 'bg-white/50 border-black/20'}`}>
                                                {isMet && <Icons.Check width={10} height={10} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`font-bold uppercase text-[10px] ${obj.isMain ? 'text-[#8a1c1c]' : 'text-gray-500'}`}>
                                                    {obj.isMain ? t.mainGoal : t.sideGoal}
                                                </span>
                                                <span className={`${isMet ? 'line-through opacity-50' : 'opacity-90'}`}>
                                                    {obj.description}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="text-center mt-auto mb-4 flex md:block items-center justify-between md:justify-center bg-black/5 md:bg-transparent p-2 md:p-0 rounded">
                        <div className="text-xs font-bold md:mb-1">{t.trustScore}</div>
                        <div className="text-2xl md:text-4xl font-fantasy font-bold text-[#8a1c1c]">
                            {gameState.trustScore}
                        </div>
                    </div>

                    {lastNegotiationFeedback && (
                        <div className="mt-4 p-2 md:p-3 bg-white/40 rounded border border-black/10 text-[10px] animate-in slide-in-from-left">
                            <strong>{t.mentorsWhisper}</strong>
                            <p className="whitespace-pre-wrap mb-2">{lastNegotiationFeedback}</p>
                            <button
                                onClick={handleSaveToBlackBook}
                                disabled={isSaved}
                                className={`mt-1 text-[9px] uppercase font-bold transition-colors ${isSaved ? 'text-green-700 cursor-default' : 'text-[#8a1c1c] hover:underline'}`}
                            >
                                {isSaved ? `✓ ${t.savedToBlackBook}` : t.saveToBlackBook}
                            </button>
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-black/10 hidden md:block">
                        <HistoricalNote data={mission?.historicalFact} />
                    </div>
                </ParchmentContainer>
            </div>

            {/* Main Chat Area */}
            <div className="col-span-1 md:col-span-3 flex flex-col h-full overflow-hidden flex-1">
                <ParchmentContainer className="h-full flex flex-col p-0 overflow-hidden">
                    <div className="p-2 md:p-4 flex-none border-b border-black/10 bg-[#f3e5ab] z-10">
                        <div className="flex justify-between items-center relative">
                            <div className="w-20"></div> {/* Spacer for centering */}
                            <div className="text-center">
                                <h2 className="text-xl md:text-2xl font-fantasy">{t.phase2Title}</h2>
                                {playerIdentityId && (
                                    <div className="text-center text-[10px] md:text-xs text-[#8a1c1c] font-bold uppercase mt-1">
                                        {t.role}: {SHOP_ITEMS.find(i => i.id === playerIdentityId)?.name[settings.language]}
                                    </div>
                                )}
                            </div>
                            {/* Inventory Removed from here */}
                            <div className="w-20"></div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6 p-2 md:p-4 mb-2 scrollbar-hide">
                        {chatHistory.map((msg, i) => {
                            const isNpc = msg.role === 'npc';
                            const isRevealed = revealedIndices.has(i);
                            const hasAudio = !!audioCache[i];
                            const isAudioLoading = loadingAudioIndices.has(i);
                            const isAudioFailed = failedAudioIndices.has(i);
                            const hasTranslation = !!translationsCache[i];
                            const isTransLoading = loadingTranslationIndices.has(i);

                            const shouldAutoPlay = (i >= initialHistoryLength.current) && (i === chatHistory.length - 1);

                            return (
                                <div key={i} className={`flex flex-col ${isNpc ? 'items-start' : 'items-end'}`}>
                                    <div className={`max-w-[95%] md:max-w-[85%] p-3 md:p-4 rounded-lg group transition-all shadow-sm ${isNpc ? 'bg-white/60 border border-[#2c1810]' : 'bg-[#2c1810] text-[#f3e5ab]'
                                        }`}>
                                        <div
                                            className="relative"
                                            onClick={() => isNpc && !isRevealed && revealText(i)}
                                        >
                                            <div
                                                className={`${isNpc ? (isRevealed ? 'text-reveal cursor-text' : 'text-blur cursor-pointer') : ''} text-base md:text-lg leading-snug`}
                                            >
                                                {msg.text}
                                            </div>

                                            {isNpc && !isRevealed && (
                                                <div className="absolute inset-0 flex items-center justify-center cursor-pointer pointer-events-none">
                                                    <span className="text-[#2c1810]/60 text-[10px] uppercase font-bold tracking-widest bg-white/80 px-2 py-1 rounded shadow-sm border border-[#2c1810]/10 backdrop-blur-sm">
                                                        {t.hiddenContent}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {isNpc && (
                                            <div className="mt-2 md:mt-3 pt-2 border-t border-black/10 flex items-center justify-between gap-3">
                                                {isAudioLoading ? (
                                                    <span className="text-[10px] text-gray-400">{t.loadingAudio}</span>
                                                ) : hasAudio ? (
                                                    <AudioPlayer src={audioCache[i]} className="scale-75 origin-left" autoPlay={shouldAutoPlay} minimal={true} />
                                                ) : isAudioFailed ? (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); generateAudioForMessage(i, msg.text); }}
                                                        className="text-[10px] text-red-600 uppercase font-bold hover:underline flex items-center gap-1"
                                                    >
                                                        <span>⚠️ {t.retry}</span>
                                                    </button>
                                                ) : (!isDemo && settings.apiKey && <span className="text-[9px] text-gray-400">{t.ready}</span>)}

                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleTranslate(i, msg.text); }}
                                                    disabled={isTransLoading || hasTranslation || (!settings.apiKey && !isDemo)}
                                                    className="text-[10px] text-blue-800 uppercase font-bold disabled:opacity-50 ml-auto bg-white/50 px-2 rounded hover:bg-white"
                                                >
                                                    {isTransLoading ? t.wait : t.translate}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {isNpc && hasTranslation && (
                                        <div className="mt-1 max-w-[90%] md:max-w-[80%] p-2 bg-[#f3e5ab] border border-blue-900/10 text-blue-900 text-xs italic rounded self-start ml-2 shadow-sm">
                                            {translationsCache[i]}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {isLoading && <div className="text-center italic opacity-50 text-sm">...</div>}
                        <div ref={bottomRef} />
                    </div>

                    <div className="border-t-2 border-black/20 p-2 md:p-4 bg-[#f3e5ab] flex-none z-10 pb-4 md:pb-4">
                        {/* Demo Hint Banner */}
                        {currentDemoHint && !isLoading && (
                            <div className="mb-2 p-2 bg-blue-100 border border-blue-300 rounded text-blue-900 text-xs font-bold animate-pulse">
                                {currentDemoHint}
                            </div>
                        )}

                        <div className={`mb-2 min-h-[3rem] p-2 bg-white/30 rounded border border-black/10 text-sm ${isRecording ? 'border-red-400' : ''}`}>
                            {transcript || <span className="italic opacity-50">{isRecording ? t.listening : t.pressRecord}</span>}
                        </div>

                        <div className="flex justify-between items-center gap-2 md:gap-4">
                            <button
                                onClick={() => isRecording ? stopRecording() : startRecording()}
                                disabled={isLoading || isDemoFinished}
                                className={`flex-shrink-0 p-3 rounded-full border-2 border-[#2c1810] ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-[#8a1c1c]'} text-white disabled:opacity-50 transition-transform active:scale-95 shadow-md`}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                            </button>

                            <div className="flex gap-2 w-full justify-end">
                                <FantasyButton
                                    onClick={handleSend}
                                    disabled={(!transcript && !isDemo) || isLoading || isRecording || isDemoFinished}
                                    className="flex-1"
                                >
                                    {t.send}
                                </FantasyButton>
                                <div className="relative group">
                                    <FantasyButton
                                        variant="secondary"
                                        onClick={advancePhase}
                                        disabled={isLoading || !isMainMet}
                                        className="w-full"
                                    >
                                        {t.endTalk}
                                    </FantasyButton>
                                    {!isMainMet && (
                                        <div className="absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                            {t.mustFinishMain}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </ParchmentContainer>
            </div>
            {/* Fixed Tooltip Overlay */}
            {activeTooltip && (
                <div
                    className="fixed z-[100] w-48 bg-black/90 text-[#f3e5ab] text-[10px] p-2 rounded shadow-xl border border-[#f3e5ab]/30 pointer-events-none animate-in fade-in duration-200"
                    style={{
                        left: activeTooltip.x,
                        top: activeTooltip.y,
                        transform: 'translate(-50%, -100%) translateY(-8px)'
                    }}
                >
                    {activeTooltip.text}
                    {/* Tiny arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/90" />
                </div>
            )}
        </div>
    );
};
