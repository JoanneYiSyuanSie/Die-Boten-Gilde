
import React, { useState } from 'react';
import { ParchmentContainer } from '../ui/ParchmentContainer';
import { translations } from '../../utils/translations';
import { useSettings } from '../../contexts/SettingsContext';
import { useGuild } from '../../contexts/GuildContext';
import { loadMissionRecords } from '../../utils/storageUtils';
import { MissionRecord } from '../../types';
import { Icons } from '../ui/Icons';
import { SHOP_ITEMS, ShopItem } from '../../constants/shopItems';
import { CHRONICLES, MAIN_STORY_CHRONICLES } from '../../content/chronicles';
import { useGame } from '../../contexts/GameContext';
import { getDLCPackage, isDLCAvailable } from '../../utils/dlcRegistry';
import { adaptDLCToMissionData } from '../../utils/dlcAdapter';

export const RecordChronicleModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { startGame } = useGame();
    const { settings } = useSettings();
    const { profile, equipTheme } = useGuild();
    const t = translations[settings.language];
    const records = loadMissionRecords();
    const [selected, setSelected] = useState<MissionRecord | null>(null);
    const [activeTab, setActiveTab] = useState<'records' | 'treasury'>('treasury');

    // Chronicle Reading States
    const [readingChronicleId, setReadingChronicleId] = useState<string | null>(null);
    const [showChronicleIndex, setShowChronicleIndex] = useState(false);

    // DLC List State
    const [showDLCIndex, setShowDLCIndex] = useState(false);
    const [chronicleTab, setChronicleTab] = useState<'main' | 'side'>('main');

    const calculateLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1;
    const currentLevel = calculateLevel(profile.rankPoints);
    const nextLevelXp = Math.pow(currentLevel, 2) * 100;

    const toggleChronicleIndex = () => {
        setShowChronicleIndex(prev => !prev);
    };

    // ... handleLaunchDLC ...

    // Helper to get chronicle content (Modified to handle both types)
    const getChronicleContent = (id: string, isMainStory: boolean) => {
        if (isMainStory) {
            const story = MAIN_STORY_CHRONICLES.find(c => c.id === id);
            if (!story) return "Content not found.";
            return story.content[settings.language] || story.content['de'];
        } else {
            const chronicle = CHRONICLES[id];
            if (!chronicle) return "Content not found.";
            return chronicle[settings.language] || chronicle['en'] || chronicle['de'];
        }
    };

    // Correctly resolve reading item title
    const getReadingTitle = () => {
        if (!readingChronicleId) return "";
        const mainStory = MAIN_STORY_CHRONICLES.find(c => c.id === readingChronicleId);
        if (mainStory) return mainStory.title[settings.language];

        const shopItem = SHOP_ITEMS.find(i => i.id === readingChronicleId);
        return shopItem?.name[settings.language] || "";
    };

    const readingContent = readingChronicleId
        ? getChronicleContent(readingChronicleId, !!MAIN_STORY_CHRONICLES.find(c => c.id === readingChronicleId))
        : "";

    const renderMarkdown = (text: string) => {
        return text.split('\n\n').map((para, i) => {
            const parts = para.split(/(\*\*.*?\*\*)/g);
            return (
                <p key={i} className="mb-4 leading-relaxed">
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="text-[#8a1c1c]">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </p>
            );
        });
    };

    // ... visibleUnlockedRewards ...
    // ... ownedDLCs ...

    const renderTreasury = () => (
        <div className="flex flex-col h-full overflow-y-auto pr-2 animate-in zoom-in-95 duration-300">
            {/* Header / Stats - COMPACTED VERSION */}
            <div className="mb-6 bg-[#2c1810]/5 p-4 rounded-lg border border-[#2c1810]/20 relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-double border-[#8a1c1c] bg-[#2c1810] flex items-center justify-center text-[#f3e5ab] text-2xl font-fantasy font-bold shadow-lg shrink-0">
                        {currentLevel}
                    </div>
                    <div>
                        <h3 className="text-xl font-fantasy font-bold text-[#2c1810] leading-none mb-1">{t.messengerLevel}</h3>
                        <div className="text-xs opacity-60 font-bold">{profile.rankPoints} / {nextLevelXp} {t.rankPoints}</div>
                    </div>
                </div>

                <div className="inline-flex items-center gap-2 bg-[#f3e5ab] border border-[#2c1810] px-3 py-1.5 rounded-full shadow-inner">
                    <Icons.Coin className="w-5 h-5 text-[#2c1810]" />
                    <span className="text-xl font-fantasy font-bold text-[#8a1c1c]">{profile.guildMarks}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inventory Section */}
                <div className="bg-white/40 rounded-lg border-2 border-[#2c1810]/20 p-4 shadow-inner">
                    <div className="flex justify-between items-center mb-4 border-b border-black/10 pb-2">
                        <h3 className="text-lg font-fantasy font-bold flex items-center gap-2">
                            <Icons.Satchel className="w-5 h-5 text-[#8a1c1c]" />
                            {t.inventory}
                        </h3>
                    </div>

                    <div className="space-y-2">
                        {/* 1. Guild Chronicle Container */}
                        <button
                            onClick={toggleChronicleIndex}
                            className="w-full flex justify-between items-center p-2 border rounded transition-all bg-amber-50/80 border-[#8a1c1c]/30 hover:bg-amber-100"
                        >
                            <div className="flex items-center gap-3">
                                <Icons.Book className="w-6 h-6 text-[#8a1c1c]" />
                                <div className="flex flex-col items-start">
                                    <span className="font-bold text-sm text-[#2c1810]">{t.chronicleBookTitle}</span>
                                    <span className="text-[10px] text-[#8a1c1c] uppercase font-bold">{t.read}</span>
                                </div>
                            </div>
                            <span className="font-fantasy font-bold text-lg text-[#2c1810]">∞</span>
                        </button>


                        {/* 2. DLC Box Container */}
                        <button
                            onClick={() => setShowDLCIndex(true)}
                            className="w-full flex justify-between items-center p-2 border rounded transition-all bg-amber-50/80 border-[#8a1c1c]/30 hover:bg-amber-100"
                        >
                            <div className="flex items-center gap-3">
                                <Icons.Gift className="w-6 h-6 text-[#8a1c1c]" />
                                <div className="flex flex-col items-start">
                                    <span className="font-bold text-sm text-[#2c1810]">{t.dlcBoxTitle || "DLC Box"}</span>
                                    <span className="text-[10px] text-[#8a1c1c] uppercase font-bold">{t.openDlcBox || "Open"}</span>
                                </div>
                            </div>
                            <span className="font-fantasy font-bold text-lg text-[#2c1810]">∞</span>
                        </button>

                        {/* 3. Regular Items */}
                        {Object.keys(profile.inventory).length === 0 ? (
                            <p className="italic opacity-50 text-center py-4 text-xs hidden">{t.emptyInventory}</p>
                        ) : (
                            Object.entries(profile.inventory).map(([id, value]) => {
                                const count = value as number;
                                if (count <= 0) return null;
                                const item = SHOP_ITEMS.find(i => i.id === id);
                                if (!item || item.type === 'dlc_item') return null;
                                const IconComponent = (Icons as any)[item.iconKey] || Icons.Default;

                                return (
                                    <button
                                        key={id}
                                        disabled={true}
                                        className="w-full flex justify-between items-center p-2 border rounded transition-all bg-white/60 border-[#2c1810]/10 cursor-default"
                                    >
                                        <div className="flex items-center gap-2">
                                            <IconComponent className="w-6 h-6 text-[#2c1810] opacity-80" />
                                            <div className="flex flex-col items-start">
                                                <span className="font-bold text-sm text-[#2c1810]">{item.name[settings.language]}</span>
                                            </div>
                                        </div>
                                        <span className="font-fantasy font-bold text-lg text-[#8a1c1c]">x{count}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Collection / Unlocks Section */}
                <div className="bg-white/40 rounded-lg border-2 border-[#2c1810]/20 p-4 shadow-inner">
                    <h3 className="text-lg font-fantasy font-bold mb-4 border-b border-black/10 pb-2 flex items-center gap-2">
                        <Icons.Crown className="w-5 h-5" />
                        {t.collection}
                    </h3>

                    <div className="grid grid-cols-2 gap-2">
                        {/* Default Theme Button */}
                        <button
                            onClick={() => equipTheme(undefined)}
                            className={`flex flex-col items-center p-3 border rounded text-center transition-all ${!profile.activeThemeId ? 'bg-green-100 border-green-500 shadow-md ring-2 ring-green-500/30' : 'bg-white/60 border-[#2c1810]/10 hover:bg-white'}`}
                        >
                            <span className="text-xs font-bold leading-tight">{t.defaultTheme}</span>
                            {!profile.activeThemeId && <span className="text-[10px] text-green-700 font-bold mt-1">{t.active}</span>}
                        </button>

                        {profile.unlockedRewards.filter(id => {
                            const item = SHOP_ITEMS.find(i => i.id === id);
                            return item && item.type !== 'chronicle';
                        }).map(id => {
                            const item = SHOP_ITEMS.find(i => i.id === id);
                            if (!item) return null;
                            const IconComponent = (Icons as any)[item.iconKey] || Icons.Default;
                            const isActiveTheme = item.type === 'theme' && profile.activeThemeId === item.id;

                            return (
                                <button
                                    key={id}
                                    onClick={() => item.type === 'theme' ? equipTheme(item.id) : undefined}
                                    disabled={item.type !== 'theme'}
                                    className={`flex flex-col items-center p-3 border rounded text-center transition-all ${isActiveTheme
                                        ? 'bg-green-100 border-green-500 shadow-md ring-2 ring-green-500/30'
                                        : 'bg-white/60 border-[#2c1810]/10'
                                        } ${item.type === 'theme' ? 'hover:bg-white cursor-pointer' : 'cursor-default'}`}
                                >
                                    <IconComponent className="w-8 h-8 text-[#8a1c1c] mb-2" />
                                    <span className="text-xs font-bold leading-tight">{item.name[settings.language]}</span>
                                    {isActiveTheme && <span className="text-[10px] text-green-700 font-bold mt-1">{t.active}</span>}
                                    {item.type === 'theme' && !isActiveTheme && <span className="text-[10px] text-[#2c1810]/50 font-bold mt-1 underline">{t.equip}</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <ParchmentContainer className="max-w-5xl w-full h-[85vh] flex flex-col overflow-hidden relative">
                {/* ... DLC Index Overlay ... */}

                {/* Chronicle Index Overlay (Tabbed) */}
                {showChronicleIndex && (
                    <div className="absolute inset-0 z-[55] p-8 bg-[#f3e5ab] animate-in slide-in-from-left duration-300 overflow-y-auto">
                        <div className="max-w-3xl mx-auto flex flex-col h-full">
                            <div className="flex justify-between items-center border-b-2 border-[#2c1810] pb-4 mb-6">
                                <h2 className="text-3xl font-fantasy font-bold text-[#2c1810]">{t.chronicleBookTitle}</h2>
                                <button onClick={() => setShowChronicleIndex(false)} className="text-[#2c1810] hover:scale-110 transition-transform text-button">
                                    <Icons.Cross className="w-8 h-8" />
                                </button>
                            </div>

                            {/* TABS */}
                            <div className="flex gap-4 mb-8 border-b border-[#2c1810]/20 pb-1">
                                <button
                                    onClick={() => setChronicleTab('main')}
                                    className={`font-fantasy font-bold text-xl uppercase tracking-widest pb-2 transition-all ${chronicleTab === 'main' ? 'text-[#8a1c1c] border-b-2 border-[#8a1c1c]' : 'text-[#2c1810]/40 hover:text-[#2c1810]'}`}
                                >
                                    {t.tabMainStory || "Main Story"}
                                </button>
                                <button
                                    onClick={() => setChronicleTab('side')}
                                    className={`font-fantasy font-bold text-xl uppercase tracking-widest pb-2 transition-all ${chronicleTab === 'side' ? 'text-[#8a1c1c] border-b-2 border-[#8a1c1c]' : 'text-[#2c1810]/40 hover:text-[#2c1810]'}`}
                                >
                                    {t.tabSideStory || "Side Stories"}
                                </button>
                            </div>

                            <div className="grid gap-4">
                                {chronicleTab === 'main' ? (
                                    // Main Story List
                                    MAIN_STORY_CHRONICLES.map((story, index) => {
                                        const isUnlocked = currentLevel >= story.levelRequired;
                                        return (
                                            <button
                                                key={story.id}
                                                onClick={() => isUnlocked && setReadingChronicleId(story.id)}
                                                disabled={!isUnlocked}
                                                className={`w-full text-left p-6 border-b border-[#2c1810]/20 flex justify-between items-center group transition-colors ${isUnlocked ? 'hover:bg-[#2c1810]/5' : 'opacity-60 cursor-not-allowed bg-black/5'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold border-2 ${isUnlocked ? 'border-[#2c1810] text-[#2c1810]' : 'border-gray-400 text-gray-400'}`}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-fantasy font-bold text-xl mb-1">{story.title[settings.language]}</div>
                                                        <div className="text-xs opacity-70 italic">
                                                            {isUnlocked ? t.unlocked : (t.requiresLevel || "Requires Level {level}").replace('{level}', String(story.levelRequired))}
                                                        </div>
                                                    </div>
                                                </div>
                                                {isUnlocked ? (
                                                    <span className="text-sm font-bold uppercase tracking-widest text-[#8a1c1c] opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {t.read} →
                                                    </span>
                                                ) : (
                                                    <Icons.Lock className="w-5 h-5 text-gray-400" />
                                                )}
                                            </button>
                                        );
                                    })
                                ) : (
                                    // Side Story List (Shop Items)
                                    SHOP_ITEMS.filter(item => item.type === 'chronicle').map((item, index) => {
                                        const isUnlocked = profile.unlockedRewards.includes(item.id);
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => isUnlocked && setReadingChronicleId(item.id)}
                                                disabled={!isUnlocked}
                                                className={`w-full text-left p-6 border-b border-[#2c1810]/20 flex justify-between items-center group transition-colors ${isUnlocked ? 'hover:bg-[#2c1810]/5' : 'opacity-60 cursor-not-allowed bg-black/5'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="font-fantasy font-bold text-2xl w-10 text-right opacity-50">#</span>
                                                    <div>
                                                        <div className="font-fantasy font-bold text-xl mb-1">{item.name[settings.language]}</div>
                                                        <div className="text-xs opacity-70 italic">{item.description[settings.language]}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isUnlocked ? (
                                                        <span className="text-sm font-bold uppercase tracking-widest text-[#8a1c1c] opacity-0 group-hover:opacity-100 transition-opacity">{t.read} →</span>
                                                    ) : (
                                                        <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-gray-500">
                                                            <Icons.Key className="w-4 h-4" /> {t.visitShop}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Chronicle Reading Overlay */}
                {readingChronicleId && (
                    <div className="absolute inset-0 z-[60] p-8 bg-[#f3e5ab] animate-in slide-in-from-bottom duration-500 overflow-y-auto">
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="flex justify-between items-center border-b-2 border-[#2c1810] pb-2">
                                <h2 className="text-3xl font-fantasy font-bold text-[#8a1c1c]">{getReadingTitle()}</h2>
                                <button onClick={() => setReadingChronicleId(null)} className="text-[#2c1810] hover:scale-110 transition-transform text-button">
                                    <Icons.Cross className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="font-serif text-lg text-justify text-[#2c1810] p-4 bg-white/20 rounded-sm border-x-4 border-[#2c1810]/10">
                                {renderMarkdown(readingContent)}
                            </div>

                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={() => setReadingChronicleId(null)}
                                    className="px-8 py-2 bg-[#2c1810] text-[#f3e5ab] font-fantasy uppercase tracking-widest rounded-sm hover:bg-black transition-colors"
                                >
                                    {t.close}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-4 border-b border-black/20 pb-2">
                    <div className="flex gap-4 items-end">
                        <button
                            onClick={() => setActiveTab('treasury')}
                            className={`text-2xl md:text-3xl font-fantasy font-bold transition-opacity text-button ${activeTab === 'treasury' ? 'opacity-100 text-[#8a1c1c]' : 'opacity-40 hover:opacity-70'}`}
                        >
                            {t.messengerInfo}
                        </button>
                        <button
                            onClick={() => setActiveTab('records')}
                            className={`text-2xl md:text-3xl font-fantasy font-bold transition-opacity text-button ${activeTab === 'records' ? 'opacity-100 text-[#8a1c1c]' : 'opacity-40 hover:opacity-70'}`}
                        >
                            {t.missionHistory}
                        </button>
                    </div>
                    <button onClick={onClose} className="text-2xl font-bold opacity-40 hover:opacity-100 transition-opacity text-button">
                        <Icons.Cross className="w-6 h-6" />
                    </button>
                </div>

                {activeTab === 'treasury' ? renderTreasury() : (
                    <div className="flex flex-1 overflow-hidden gap-6">
                        <div className="w-1/3 overflow-y-auto space-y-2 pr-2 border-r border-black/10">
                            {records.length === 0 && <p className="italic opacity-50 text-center mt-10">{t.noRecords}</p>}
                            {records.map(r => (
                                <button
                                    key={r.id}
                                    onClick={() => setSelected(r)}
                                    className={`w-full text-left p-3 rounded transition-all border ${selected?.id === r.id ? 'bg-[#8a1c1c] text-white border-[#2c1810]' : 'bg-white/40 border-black/10 hover:bg-white/60'}`}
                                >
                                    <div className="text-xs font-bold opacity-70 mb-1">{new Date(r.date).toLocaleDateString()}</div>
                                    <div className="font-fantasy font-bold truncate">{r.title}</div>
                                    <div className="flex justify-between text-[10px] mt-2 font-bold uppercase">
                                        <span>{r.level}</span>
                                        <span>Grade: {r.grade}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="w-2/3 overflow-y-auto space-y-6">
                            {selected ? (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-2xl font-fantasy font-bold text-[#8a1c1c]">{selected.title}</h3>
                                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#8a1c1c] flex items-center justify-center font-fantasy font-bold text-xl">{selected.grade}</div>
                                    </div>
                                    <div className="bg-white/40 p-4 rounded border border-black/10">
                                        <h4 className="font-bold mb-2 border-b border-black/10 pb-1">{t.outcome}</h4>
                                        <p className="text-sm italic">{selected.outcome}</p>
                                    </div>
                                    {selected.corrections && (
                                        <div className="bg-black/5 p-4 rounded border border-black/10 mt-4">
                                            <h4 className="font-bold mb-2 border-b border-black/10 pb-1 text-xs uppercase tracking-wider">{t.corrections}</h4>
                                            <p className="text-xs font-mono whitespace-pre-wrap">{selected.corrections}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center opacity-30 text-xl font-fantasy font-bold text-center">Select a Scroll<br />from the Archive</div>
                            )}
                        </div>
                    </div>
                )}
            </ParchmentContainer>
        </div>
    );
};
