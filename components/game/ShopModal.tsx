
import React, { useState } from 'react';
import { useGuild } from '../../contexts/GuildContext';
import { useSettings } from '../../contexts/SettingsContext';
import { translations } from '../../utils/translations';
import { ParchmentContainer } from '../ui/ParchmentContainer';
import { SHOP_ITEMS, ShopItem } from '../../constants/shopItems';
import { FantasyButton } from '../ui/FantasyButton';
import { Icons } from '../ui/Icons';

export const ShopModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { profile, purchaseItem, equipTheme } = useGuild();
    const { settings } = useSettings();
    const t = translations[settings.language];
    const [activeTab, setActiveTab] = useState<'consumable' | 'origin' | 'theme' | 'chronicle' | 'badge'>('consumable');

    const handleBuy = (item: ShopItem) => {
        const success = purchaseItem(item);
        if (!success) {
            alert("Nicht genug Geld oder bereits im Besitz! (Not enough marks or already owned)");
        }
    };

    // Helper to render a mini color palette for themes
    const renderThemePreview = (itemId: string) => {
        let colors = ['bg-gray-200', 'bg-gray-400', 'bg-gray-600'];
        if (itemId === 'theme_blueprint') colors = ['bg-[#0a192f]', 'bg-[#64ffda]', 'bg-[#ccd6f6]']; // Navy, Cyan, Light Blue
        if (itemId === 'theme_black_forest') colors = ['bg-[#0d1f0d]', 'bg-[#e8f5e9]', 'bg-[#2e7d32]']; // Dark Green, Pale Green, Forest Green

        return (
            <div className="flex gap-1 mb-3 p-1 bg-black/10 rounded-full w-fit">
                {colors.map((c, i) => (
                    <div key={i} className={`w-4 h-4 rounded-full border border-black/20 theme-preview-dot ${c}`} />
                ))}
            </div>
        );
    };

    const renderDefaultThemeCard = () => {
         // Only show in Theme tab
         if (activeTab !== 'theme') return null;
         
         const isDefaultActive = !profile.activeThemeId;
         
         return (
            <div className={`
                default-theme-card
                relative flex flex-col justify-between p-5 rounded-sm border-2 transition-all duration-300 group
                ${isDefaultActive
                    ? 'bg-[#2c1810]/5 border-[#2c1810]/10'
                    : 'bg-white/60 border-[#2c1810]/20 hover:border-[#8a1c1c]/60 hover:shadow-lg hover:-translate-y-1'
                }
            `}>
                 {isDefaultActive && (
                    <div className="absolute top-4 right-4 z-10 opacity-70 border-2 border-green-800 text-green-900 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest bg-green-100/80 rounded-sm">
                        ACTIVE
                    </div>
                )}
                
                <div>
                     <div className="flex items-start gap-4 mb-3">
                        <div className="shop-item-icon-container p-3 rounded-full border-2 shrink-0 bg-[#2c1810] border-[#d4c59a]">
                            <Icons.BookOpen width={24} height={24} className="shop-item-icon text-[#f3e5ab]" />
                        </div>
                        <div>
                            <h4 className="font-fantasy font-bold text-xl text-[#2c1810] leading-tight mb-1">
                                {settings.language === 'de' ? 'Standard' : '預設羊皮紙'}
                            </h4>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-[#8a1c1c] opacity-60">
                                Design
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex gap-1 mb-3 p-1 bg-black/10 rounded-full w-fit">
                        {/* Using specific classes instead of generic colors to prevent theme overrides in CSS */}
                        <div className="w-4 h-4 rounded-full border border-black/20 theme-preview-dot preview-dot-parchment bg-[#f3e5ab]" />
                        <div className="w-4 h-4 rounded-full border border-black/20 theme-preview-dot preview-dot-ink bg-[#2c1810]" />
                        <div className="w-4 h-4 rounded-full border border-black/20 theme-preview-dot preview-dot-seal bg-[#8a1c1c]" />
                    </div>
                    
                    <p className="text-sm italic opacity-80 mb-4 leading-relaxed font-serif text-[#2c1810]">
                        {settings.language === 'de' ? 'Das klassische Gilden-Pergament.' : '經典的公會羊皮紙風格。'}
                    </p>
                </div>
                
                <div className="mt-auto pt-4 border-t border-[#2c1810]/10 flex justify-between items-center">
                    <div className="font-fantasy font-bold text-xl text-gray-400 flex items-center gap-1.5">
                        <Icons.Coin className="w-5 h-5" /> 0
                    </div>
                    <FantasyButton 
                        onClick={() => equipTheme(undefined)}
                        disabled={isDefaultActive}
                        className={`text-xs px-6 py-2 h-auto shadow-sm ${isDefaultActive ? 'opacity-50' : ''}`}
                    >
                        {isDefaultActive ? 'Active' : 'Equip'}
                    </FantasyButton>
                </div>
            </div>
         );
    };

    const renderItem = (item: ShopItem) => {
        const isOwned = item.type !== 'consumable' && profile.unlockedRewards?.includes(item.id);
        const isActiveTheme = item.type === 'theme' && profile.activeThemeId === item.id;
        const canAfford = profile.guildMarks >= item.cost;
        const inventoryCount = profile.inventory?.[item.id] || 0;
        
        const effectiveCost = item.cost;

        const IconComponent = (Icons as any)[item.iconKey] || Icons.Default;
        const currentLang = settings.language;

        return (
            <div key={item.id} className={`
                relative flex flex-col justify-between p-5 rounded-sm border-2 transition-all duration-300 group
                ${(isOwned && item.type !== 'consumable')
                    ? 'bg-[#2c1810]/5 border-[#2c1810]/10' 
                    : 'bg-white/60 border-[#2c1810]/20 hover:border-[#8a1c1c]/60 hover:shadow-lg hover:-translate-y-1'
                }
            `}>
                {/* Owned Stamp */}
                {isOwned && item.type !== 'consumable' && (
                    <div className={`absolute top-4 right-4 z-10 opacity-70 transform rotate-12 border-4 border-double text-[10px] font-black uppercase px-2 py-1 tracking-widest rounded-sm ${isActiveTheme ? 'border-green-800 text-green-900 bg-green-100/80' : 'border-[#2c1810] text-[#2c1810] bg-[#f3e5ab]/80'}`}>
                        {isActiveTheme ? 'ACTIVE' : 'ERWORBEN'}
                    </div>
                )}

                <div>
                    {/* Header: Icon & Name */}
                    <div className="flex items-start gap-4 mb-3">
                        <div className="shop-item-icon-container p-3 rounded-full border-2 shrink-0 bg-[#2c1810] border-[#d4c59a]">
                            <IconComponent 
                                width={24} 
                                height={24} 
                                className="shop-item-icon text-[#f3e5ab]" 
                            />
                        </div>
                        <div>
                            <h4 className="font-fantasy font-bold text-xl text-[#2c1810] leading-tight mb-1">
                                {item.name[currentLang]}
                            </h4>
                            {/* Subtitle / Type Label - Color separated from Opacity */}
                            <span className="shop-category-label text-[10px] uppercase tracking-widest font-bold text-[#8a1c1c] opacity-60">
                                {item.type === 'origin' ? 'Hintergrund' : item.type === 'theme' ? 'Design' : item.type === 'badge' ? 'Auszeichnung' : 'Gegenstand'}
                            </span>
                        </div>
                    </div>

                    {/* Preview for Themes */}
                    {item.type === 'theme' && renderThemePreview(item.id)}

                    {/* Inventory Count Badge */}
                    {item.type === 'consumable' && inventoryCount > 0 && (
                        <div className="mb-3 inline-block bg-[#f3e5ab] border border-[#2c1810]/30 px-2 py-0.5 rounded text-xs font-bold text-[#2c1810]">
                            Im Besitz: {inventoryCount}
                        </div>
                    )}
                    
                    {/* Description (Updated to use theme-compatible ink color) */}
                    <p className="text-sm italic opacity-80 mb-4 leading-relaxed font-serif text-[#2c1810]">
                        {item.description[currentLang]}
                    </p>
                    
                    {/* Origin Stats Box */}
                    {(item.strength || item.weakness) && (
                        <div className="bg-[#f3e5ab]/50 rounded border border-[#2c1810]/10 p-3 mb-4 text-xs space-y-2">
                            {item.strength && (
                                <div className="flex gap-2">
                                    <span className="text-green-700 font-bold text-lg leading-none">⊕</span>
                                    <span className="text-[#2c1810] leading-tight">{item.strength[currentLang]}</span>
                                </div>
                            )}
                            {item.weakness && (
                                <div className="flex gap-2">
                                    <span className="text-red-800 font-bold text-lg leading-none">⊖</span>
                                    <span className="text-[#2c1810] leading-tight">{item.weakness[currentLang]}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer: Price & Action */}
                <div className="mt-auto pt-4 border-t border-[#2c1810]/10 flex justify-between items-center">
                    <div className={`font-fantasy font-bold text-xl flex items-center gap-1.5 ${canAfford || isOwned ? 'text-[#8a1c1c]' : 'text-gray-400'}`}>
                        <Icons.Coin className="w-5 h-5" /> 
                        {effectiveCost}
                    </div>
                    
                    {item.type === 'theme' && isOwned ? (
                         <FantasyButton 
                            onClick={() => equipTheme(item.id)} 
                            disabled={isActiveTheme}
                            className={`text-xs px-6 py-2 h-auto shadow-sm ${isActiveTheme ? 'opacity-50' : ''}`}
                        >
                            {isActiveTheme ? 'Active' : 'Equip'}
                        </FantasyButton>
                    ) : (
                        <FantasyButton 
                            onClick={() => handleBuy(item)} 
                            disabled={(!canAfford && effectiveCost > 0) || (isOwned && item.type !== 'consumable')}
                            className={`text-xs px-6 py-2 h-auto shadow-sm ${isOwned ? 'opacity-0 pointer-events-none' : ''}`} 
                        >
                            {t.buy}
                        </FantasyButton>
                    )}
                </div>
            </div>
        );
    };

    const filteredItems = SHOP_ITEMS.filter(item => item.type === activeTab);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 md:p-4 animate-in fade-in duration-200">
            <ParchmentContainer className="max-w-6xl w-full h-[95vh] md:h-[90vh] flex flex-col overflow-hidden !p-0 bg-paper-texture shadow-2xl rounded-lg">
                
                {/* Header Section */}
                <div className="shop-header-bar relative bg-[#2c1810] text-[#f3e5ab] p-4 md:p-6 shadow-md z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                    
                    {/* Left: Title */}
                    <div className="flex items-center gap-3">
                        <div className="shop-header-icon-container p-2 bg-[#f3e5ab] rounded-full text-[#2c1810]">
                            <Icons.Store className="shop-header-icon w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-fantasy font-bold tracking-wide">{t.guildTreasury}</h2>
                            <p className="text-xs md:text-sm text-[#d4c59a] opacity-80 uppercase tracking-widest">Waren & Wunder</p>
                        </div>
                    </div>

                    {/* Right: Currency & Close */}
                    <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full border border-[#f3e5ab]/20 shadow-inner">
                            <Icons.Coin className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 drop-shadow-md" />
                            <span className="font-fantasy text-xl md:text-2xl font-bold text-[#f3e5ab] tabular-nums">{profile.guildMarks}</span>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="text-[#f3e5ab]/60 hover:text-[#f3e5ab] transition-colors p-1 hover:bg-white/10 rounded-full"
                        >
                            <Icons.Cross className="w-6 h-6 md:w-8 md:h-8" />
                        </button>
                    </div>
                </div>

                {/* Tabs - Styled like Folder Tabs */}
                <div className="flex bg-[#2c1810] px-4 md:px-6 pt-2 gap-1 overflow-x-auto scrollbar-hide shrink-0">
                    {(['consumable', 'origin', 'theme', 'chronicle', 'badge'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setActiveTab(type)}
                            className={`
                                px-4 md:px-6 py-2 md:py-3 font-fantasy uppercase tracking-wider text-xs md:text-sm font-bold rounded-t-lg transition-all duration-200 relative top-[1px] whitespace-nowrap
                                ${activeTab === type 
                                    ? 'bg-[#f3e5ab] text-[#2c1810] shadow-[0_-2px_5px_rgba(0,0,0,0.2)]' 
                                    : 'bg-[#3e2318] text-[#f3e5ab]/60 hover:bg-[#4a2e20] hover:text-[#f3e5ab]'
                                }
                            `}
                        >
                            {type === 'chronicle' ? t.guildChronicles : type}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-[#f3e5ab] overflow-y-auto p-4 md:p-6 bg-paper-texture">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 pb-8">
                        {/* Always Render Default Theme Option when in Theme Tab */}
                        {renderDefaultThemeCard()}
                        
                        {filteredItems.length > 0 ? (
                            filteredItems.map(renderItem)
                        ) : (
                            activeTab !== 'theme' && (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-40">
                                    <Icons.Store width={64} height={64} className="mb-4 text-[#2c1810]" />
                                    <p className="italic font-serif text-lg text-[#2c1810]">
                                        Der Händler hat keine Waren dieser Art.
                                        <br/><span className="text-sm">(No items available in this category)</span>
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </ParchmentContainer>
        </div>
    );
};
