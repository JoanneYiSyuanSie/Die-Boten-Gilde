
import React, { useState, useMemo } from 'react';
import { ParchmentContainer } from '../ui/ParchmentContainer';
import { FantasyButton } from '../ui/FantasyButton';
import { translations } from '../../utils/translations';
import { useSettings } from '../../contexts/SettingsContext';
import { LORE } from '../../content/lore';

interface PageContent {
    title: string;
    paragraphs: string[];
    sectionIndex: number;
    pageIndexInSection: number;
    totalPagesInSection: number;
}

import { useGame } from '../../contexts/GameContext'; // New import

export const InstructionModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { settings } = useSettings();
    const { abandonMission, gameState } = useGame(); // Hook usage
    const t = translations[settings.language];
    const lore = LORE[settings.language];

    const hasActiveMission = !!gameState.mission;

    const handleAbandon = () => {
        if (window.confirm(t.confirmAbandon)) {
            abandonMission();
            onClose();
        }
    };

    // State to track the linear page index
    const [currentGlobalPage, setCurrentGlobalPage] = useState(0);

    // Dynamic Pagination Logic
    const pages = useMemo(() => {
        const sections = [
            { title: t.instructionLoreTitle, content: lore.world },
            { title: t.instructionRuleTitle, content: lore.rules }
        ];

        const generatedPages: PageContent[] = [];

        // Configuration for "filling the page"
        // A standard modal page roughly fits 800-1100 characters depending on language and breaks.
        // We assign a "cost" to paragraphs to account for vertical whitespace.
        const TARGET_PAGE_WEIGHT = 950;
        const PARAGRAPH_BREAK_COST = 80; // Visual cost of a newline gap

        sections.forEach((section, sIndex) => {
            const rawParagraphs = section.content.split('\n\n');
            const sectionPages: { paragraphs: string[] }[] = [];

            let currentParams: string[] = [];
            let currentWeight = 0;

            rawParagraphs.forEach((para) => {
                const paraWeight = para.length + PARAGRAPH_BREAK_COST;

                // If adding this paragraph exceeds the target AND we already have content,
                // push the current page and start a new one.
                if (currentWeight + paraWeight > TARGET_PAGE_WEIGHT && currentParams.length > 0) {
                    sectionPages.push({ paragraphs: currentParams });
                    currentParams = [para];
                    currentWeight = paraWeight;
                } else {
                    currentParams.push(para);
                    currentWeight += paraWeight;
                }
            });

            // Push any remaining paragraphs
            if (currentParams.length > 0) {
                sectionPages.push({ paragraphs: currentParams });
            }

            // Map to final PageContent structure
            sectionPages.forEach((page, pIndex) => {
                generatedPages.push({
                    title: section.title,
                    paragraphs: page.paragraphs,
                    sectionIndex: sIndex,
                    pageIndexInSection: pIndex + 1,
                    totalPagesInSection: sectionPages.length
                });
            });
        });

        return generatedPages;
    }, [t, lore]);

    const currentPageData = pages[currentGlobalPage];
    const isFirstPage = currentGlobalPage === 0;
    const isLastPage = currentGlobalPage === pages.length - 1;

    const handleNext = () => {
        if (!isLastPage) setCurrentGlobalPage(prev => prev + 1);
        else onClose();
    };

    const handlePrev = () => {
        if (!isFirstPage) setCurrentGlobalPage(prev => prev - 1);
    };

    const renderText = (text: string) => {
        // Simple bold parser for markdown-like experience (**text**)
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return (
            <span>
                {parts.map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j} className="text-[#8a1c1c]">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                })}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <ParchmentContainer className="max-w-xl w-full h-[80vh] md:h-[600px] flex flex-col relative overflow-hidden transition-all duration-300">

                {/* Header Section */}
                <div className="flex-none text-center border-b-2 border-[#2c1810] pb-2 mb-4">
                    <h2 className="text-2xl md:text-3xl font-fantasy font-bold">{t.gameInstructions}</h2>
                    <div className="flex justify-center items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8a1c1c] mt-1">
                        <span>{currentPageData.title}</span>
                        {currentPageData.totalPagesInSection > 1 && (
                            <span className="opacity-60">
                                ({currentPageData.pageIndexInSection}/{currentPageData.totalPagesInSection})
                            </span>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto px-2 space-y-4 md:space-y-6">
                    <div key={currentGlobalPage} className="animate-in fade-in slide-in-from-right-4 duration-300">
                        {currentPageData.paragraphs.map((para, i) => (
                            <p key={i} className="text-base md:text-lg leading-relaxed text-[#2c1810] font-body text-left mb-6 last:mb-0">
                                {renderText(para)}
                            </p>
                        ))}
                    </div>
                </div>

                {/* Footer / Navigation Section */}
                <div className="flex-none pt-4 mt-4 border-t border-[#2c1810]/10">
                    <div className="flex items-center justify-between">
                        {/* Abandon Button (Only if mission active) */}
                        <div className="flex-1">
                            {hasActiveMission && (
                                <button
                                    onClick={handleAbandon}
                                    className="px-3 py-2 text-red-800 font-bold text-xs md:text-sm hover:bg-red-100 rounded border border-red-800/30 uppercase tracking-widest transition-colors"
                                >
                                    {t.abandonMission}
                                </button>
                            )}
                        </div>

                        {/* Page Dots Indicator */}
                        <div className="flex gap-1.5 overflow-hidden max-w-[100px] justify-center flex-1">
                            {pages.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentGlobalPage
                                        ? 'w-6 bg-[#8a1c1c]'
                                        : 'w-2 bg-[#2c1810]/20'
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-3 justify-end flex-1">
                            {!isFirstPage && (
                                <button
                                    onClick={handlePrev}
                                    className="px-3 py-2 text-[#2c1810] font-bold text-sm hover:underline uppercase tracking-wide"
                                >
                                    {t.prevPage}
                                </button>
                            )}

                            <FantasyButton onClick={handleNext} className="text-sm py-1 px-6 min-w-[100px]">
                                {isLastPage ? t.close : t.nextPage}
                            </FantasyButton>
                        </div>
                    </div>
                </div>

            </ParchmentContainer>
        </div>
    );
};
