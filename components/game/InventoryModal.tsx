
import React, { useState } from 'react';
import { useGuild } from '../../contexts/GuildContext';
import { useSettings } from '../../contexts/SettingsContext';
import { translations } from '../../utils/translations';
import { ParchmentContainer } from '../ui/ParchmentContainer';
import { SHOP_ITEMS, ShopItem } from '../../constants/shopItems';
import { FantasyButton } from '../ui/FantasyButton';
import { Icons } from '../ui/Icons';
import { GamePhase } from '../../types';

import { DLCConfirmationModal } from './DLCConfirmationModal';
import { RedemptionModal } from './RedemptionModal';
import { DLCData } from '../../types';

interface InventoryModalProps {
    onClose: () => void;
    currentPhase: GamePhase;
    onUseItem: (item: ShopItem) => Promise<boolean>;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ onClose, currentPhase, onUseItem }) => {
    const { profile } = useGuild();
    const { settings } = useSettings();
    const t = translations[settings.language];
    const [containerViewId, setContainerViewId] = useState<string | null>(null);
    const [usingId, setUsingId] = useState<string | null>(null);
    const [dlcToConfirm, setDlcToConfirm] = useState<DLCData | null>(null);
    const [showRedemption, setShowRedemption] = useState(false);

    // Items to display: Either root level items OR items inside the active container
    const visibleItems = SHOP_ITEMS.filter(item => {
        const qty = profile.inventory[item.id] || 0;
        if (qty <= 0) return false;

        if (containerViewId) {
            // Inside a container: Show items belonging to this container
            // We need to add 'containerId' property to ShopItem definition in constants first or assume a convention.
            // For now, let's assume item.containerId === containerViewId
            return (item as any).containerId === containerViewId;
        } else {
            // Root view: Show items appearing in root (no containerId) AND the container items themselves
            // Assume "container" type items are always root
            return !((item as any).containerId);
        }
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
        switch (phase) {
            case GamePhase.LEVEL_1: return t.phase1Title;
            case GamePhase.LEVEL_2: return t.phase2Title;
            case GamePhase.LEVEL_3: return t.phase3Title;
            case GamePhase.EPILOGUE: return t.missionComplete;
            case GamePhase.MENU: return "Menu";
            default: return phase;
        }
    };

    const handleItemClick = (item: ShopItem) => {
        // If it's a container, open it
        // We need a 'type' check. Assuming new type 'container'
        if ((item as any).type === 'container') {
            setContainerViewId(item.id);
            return;
        }

        // Check if it is a DLC item (inside container usually)
        if ((item as any).type === 'dlc_item') {
            // Mock DLC Data Loading for Demo
            // In real app, we would look up the DLC data based on item.id
            const mockDlcData: any = {
                id: "dlc_mock",
                manifest: {
                    displayTitle: { de: item.name.de, zh: item.name.zh },
                    summary: { de: item.description.de, zh: item.description.zh },
                    tags: ["Demo", "Story"],
                    estimatedPlaytime: "30 min"
                }
            };
            setDlcToConfirm(mockDlcData);
            return;
        }

        // Standard consumable
        handleUse(item);
    }

    return (
        <>
            {dlcToConfirm && (
                <DLCConfirmationModal
                    dlc={dlcToConfirm}
                    onClose={() => setDlcToConfirm(null)}
                    onConfirm={() => {
                        console.log("Loading DLC:", dlcToConfirm);
                        setDlcToConfirm(null);
                        onClose(); // Close inventory
                    }}
                />
            )}
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <ParchmentContainer className="max-w-2xl w-full h-[70vh] flex flex-col overflow-hidden relative">

                    <div className="flex justify-between items-center mb-6 border-b-2 border-[#2c1810] pb-2">
                        <div className="flex items-center gap-3">
                            {containerViewId && (
                                <button onClick={() => setContainerViewId(null)} className="mr-2 hover:bg-black/10 rounded-full p-1">
                                    <Icons.ArrowLeft className="w-6 h-6" />
                                </button>
                            )}
                            <Icons.Satchel className="w-8 h-8 text-[#8a1c1c]" />
                            <h2 className="text-3xl font-fantasy font-bold text-[#2c1810]">
                                {containerViewId ? (SHOP_ITEMS.find(i => i.id === containerViewId)?.name[settings.language] || t.inventory) : t.inventory}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={onClose} className="text-[#2c1810] opacity-40 hover:opacity-100 transition-opacity">
                                <Icons.Cross className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {visibleItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4">
                                <Icons.Satchel width={64} height={64} className="opacity-20" />
                                <p className="italic text-lg">{containerViewId ? "Empty Container" : t.emptyInventory}</p>
                                {!containerViewId && <div className="text-xs bg-[#2c1810]/10 px-3 py-1 rounded">
                                    {t.visitShop}
                                </div>}
                            </div>
                        ) : (
                            visibleItems.map(item => {
                                const IconComponent = (Icons as any)[item.iconKey] || Icons.Default;
                                const qty = profile.inventory[item.id];
                                const isAllowed = item.allowedPhases?.includes(currentPhase);
                                const isContainer = (item as any).type === 'container';
                                const isDlc = (item as any).type === 'dlc_item';

                                return (
                                    <div key={item.id} className={`p-4 rounded-lg border-2 transition-all ${isAllowed || isContainer || isDlc ? 'bg-white/60 border-[#2c1810]/20 hover:border-[#8a1c1c]/50' : 'bg-black/5 border-transparent opacity-80 grayscale-[0.5]'}`}>
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
                                            {!(isContainer || isDlc) && !isAllowed && (
                                                <div className="text-xs text-right opacity-60">
                                                    <div className="font-bold uppercase tracking-wider mb-1">{t.itemNotUsableHere}</div>
                                                    <div>{t.usablePhase} {item.allowedPhases?.map(p => getPhaseName(p)).join(', ')}</div>
                                                </div>
                                            )}

                                            <FantasyButton
                                                onClick={() => handleItemClick(item)}
                                                disabled={(!isContainer && !isDlc && !isAllowed) || usingId !== null}
                                                className={`py-1 px-6 text-sm ${(!isContainer && !isDlc && !isAllowed) ? 'opacity-50 cursor-not-allowed bg-gray-500 border-gray-700 text-gray-200' : ''}`}
                                            >
                                                {isContainer ? 'Open' : (isDlc ? 'Inspect' : (usingId === item.id ? 'Using...' : t.useItem))}
                                            </FantasyButton>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                </ParchmentContainer>
            </div>
        </>
    );
};

