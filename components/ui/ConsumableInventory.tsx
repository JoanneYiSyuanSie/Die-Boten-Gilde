
import React, { useState } from 'react';
import { useGuild } from '../../contexts/GuildContext';
import { useSettings } from '../../contexts/SettingsContext';
import { SHOP_ITEMS, ShopItem } from '../../constants/shopItems';
import { GamePhase } from '../../types';
import { Icons } from './Icons';
import { translations } from '../../utils/translations';

interface ConsumableInventoryProps {
    currentPhase: GamePhase;
    onConsume: (item: ShopItem) => Promise<boolean>; // Callback to handle effect
    className?: string;
}

export const ConsumableInventory: React.FC<ConsumableInventoryProps> = ({ currentPhase, onConsume, className = '' }) => {
    const { profile } = useGuild();
    const { settings } = useSettings();
    const t = translations[settings.language];
    const [usingId, setUsingId] = useState<string | null>(null);

    // Filter: Must be in inventory (qty > 0) AND allowed in current phase
    const availableItems = SHOP_ITEMS.filter(item => {
        const qty = profile.inventory[item.id] || 0;
        const isAllowed = item.type === 'consumable' && item.allowedPhases?.includes(currentPhase);
        return qty > 0 && isAllowed;
    });

    if (availableItems.length === 0) return null;

    const handleUse = async (item: ShopItem) => {
        setUsingId(item.id);
        await onConsume(item);
        setUsingId(null);
    };

    return (
        <div className={`flex items-center gap-2 p-2 bg-[#2c1810]/90 rounded-lg shadow-lg border border-[#f3e5ab]/30 backdrop-blur-sm ${className}`}>
            <span className="text-[10px] font-bold text-[#f3e5ab] uppercase tracking-wider mr-1 transform -rotate-90 md:rotate-0">
                {t.inventory}
            </span>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {availableItems.map(item => {
                    const IconComponent = (Icons as any)[item.iconKey] || Icons.Default;
                    const qty = profile.inventory[item.id];
                    
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleUse(item)}
                            disabled={usingId !== null}
                            className={`relative group flex items-center justify-center w-10 h-10 rounded bg-[#f3e5ab]/10 border border-[#f3e5ab]/30 hover:bg-[#f3e5ab]/20 transition-all active:scale-95 ${usingId === item.id ? 'animate-pulse' : ''}`}
                            title={item.name[settings.language]}
                        >
                            <IconComponent className="w-6 h-6 text-[#f3e5ab]" />
                            <span className="absolute -top-1 -right-1 bg-[#8a1c1c] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-[#2c1810]">
                                {qty}
                            </span>
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-max max-w-[150px] bg-black text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                <div className="font-bold mb-1">{item.name[settings.language]}</div>
                                <div className="text-[10px] italic">{item.description[settings.language]}</div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
