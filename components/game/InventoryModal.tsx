
import React, { useState } from 'react';
import { useGuild } from '../../contexts/GuildContext';
import { useSettings } from '../../contexts/SettingsContext';
import { translations } from '../../utils/translations';
import { ParchmentContainer } from '../ui/ParchmentContainer';
import { SHOP_ITEMS, ShopItem } from '../../constants/shopItems';
import { FantasyButton } from '../ui/FantasyButton';
import { Icons } from '../ui/Icons';
import { GamePhase } from '../../types';

interface InventoryModalProps {
    onClose: () => void;
    currentPhase: GamePhase;
    onUseItem: (item: ShopItem) => Promise<boolean>;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ onClose, currentPhase, onUseItem }) => {
    const { profile } = useGuild();
    const { settings } = useSettings();
    const t = translations[settings.language];
    const [usingId, setUsingId] = useState<string | null>(null);

    // Filter consumable items that the user owns
    const myConsumables = SHOP_ITEMS.filter(item => {
        const qty = profile.inventory[item.id] || 0;
        return item.type === 'consumable' && qty > 0;
    });

    const handleUse = async (item: ShopItem) => {
        setUsingId(item.id);
        const success = await onUseItem(item);
        setUsingId(null);
        if (success) {
            onClose();
        }
    };

    const getPhaseName = (phase: GamePhase) => {
        switch(phase) {
            case GamePhase.LEVEL_1: return t.phase1Title;
            case GamePhase.LEVEL_2: return t.phase2Title;
            case GamePhase.LEVEL_3: return t.phase3Title;
            case GamePhase.EPILOGUE: return t.missionComplete;
            case GamePhase.MENU: return "Menu";
            default: return phase;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <ParchmentContainer className="max-w-2xl w-full h-[70vh] flex flex-col overflow-hidden relative">
                
                <div className="flex justify-between items-center mb-6 border-b-2 border-[#2c1810] pb-2">
                    <div className="flex items-center gap-3">
                        <Icons.Satchel className="w-8 h-8 text-[#8a1c1c]" />
                        <h2 className="text-3xl font-fantasy font-bold text-[#2c1810]">{t.inventory}</h2>
                    </div>
                    <button onClick={onClose} className="text-[#2c1810] opacity-40 hover:opacity-100 transition-opacity">
                        <Icons.Cross className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {myConsumables.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4">
                             <Icons.Satchel width={64} height={64} className="opacity-20" />
                             <p className="italic text-lg">{t.emptyInventory}</p>
                             <div className="text-xs bg-[#2c1810]/10 px-3 py-1 rounded">
                                 {t.visitShop}
                             </div>
                        </div>
                    ) : (
                        myConsumables.map(item => {
                            const IconComponent = (Icons as any)[item.iconKey] || Icons.Default;
                            const qty = profile.inventory[item.id];
                            const isAllowed = item.allowedPhases?.includes(currentPhase);
                            
                            return (
                                <div key={item.id} className={`p-4 rounded-lg border-2 transition-all ${isAllowed ? 'bg-white/60 border-[#2c1810]/20 hover:border-[#8a1c1c]/50' : 'bg-black/5 border-transparent opacity-80 grayscale-[0.5]'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[#2c1810] rounded-full border border-[#f3e5ab]">
                                                 <IconComponent className="w-6 h-6 text-[#f3e5ab]" />
                                            </div>
                                            <div>
                                                <h4 className="font-fantasy font-bold text-lg leading-none">{item.name[settings.language]}</h4>
                                                <span className="text-xs font-bold text-[#8a1c1c]">x {qty}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm italic opacity-80 mb-4 pl-12">
                                        {item.description[settings.language]}
                                    </p>

                                    <div className="flex justify-end items-center gap-4">
                                        {!isAllowed && (
                                            <div className="text-xs text-right opacity-60">
                                                <div className="font-bold uppercase tracking-wider mb-1">{t.itemNotUsableHere}</div>
                                                <div>{t.usablePhase} {item.allowedPhases?.map(p => getPhaseName(p)).join(', ')}</div>
                                            </div>
                                        )}
                                        
                                        <FantasyButton 
                                            onClick={() => handleUse(item)}
                                            disabled={!isAllowed || usingId !== null}
                                            className={`py-1 px-6 text-sm ${!isAllowed ? 'opacity-50 cursor-not-allowed bg-gray-500 border-gray-700 text-gray-200' : ''}`}
                                        >
                                            {usingId === item.id ? 'Using...' : t.useItem}
                                        </FantasyButton>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

            </ParchmentContainer>
        </div>
    );
};
