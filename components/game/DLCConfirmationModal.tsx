
import React from 'react';
import { DLCData } from '../../types';
import { translations } from '../../utils/translations';
import { useSettings } from '../../contexts/SettingsContext';
import { ParchmentContainer } from '../ui/ParchmentContainer';
import { FantasyButton } from '../ui/FantasyButton';
import { Icons } from '../ui/Icons';

interface DLCConfirmationModalProps {
    dlc: DLCData;
    onClose: () => void;
    onConfirm: () => void;
}

export const DLCConfirmationModal: React.FC<DLCConfirmationModalProps> = ({ dlc, onClose, onConfirm }) => {
    const { settings } = useSettings();
    const t = translations[settings.language];
    const lang = settings.language;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <ParchmentContainer className="max-w-lg w-full relative border-4 border-[#8aa7b8] shadow-[0_0_50px_rgba(138,167,184,0.3)]">
                <div className="absolute top-0 right-0 p-4">
                    <button onClick={onClose} className="text-[#2c1810] opacity-50 hover:opacity-100">
                        <Icons.Cross className="w-6 h-6" />
                    </button>
                </div>

                <div className="text-center space-y-6 p-4">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-[#2c1810] rounded-full border-2 border-[#8aa7b8]">
                            <Icons.BookOpen className="w-12 h-12 text-[#8aa7b8]" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-fantasy font-bold text-[#2c1810]">
                        {dlc.manifest.displayTitle[lang]}
                    </h2>

                    <div className="bg-white/40 p-4 rounded border border-[#2c1810]/20 text-left">
                        <p className="italic text-[#2c1810] mb-4">
                            {dlc.manifest.summary[lang]}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-2">
                            {dlc.manifest.tags.map(tag => (
                                <span key={tag} className="text-xs bg-[#2c1810] text-[#f3e5ab] px-2 py-1 rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="text-xs font-bold opacity-60 mt-2 flex items-center gap-1">
                            <Icons.Loader className="w-3 h-3" />
                            {dlc.manifest.estimatedPlaytime}
                        </div>
                    </div>

                    <div className="bg-red-900/10 border border-red-900/30 p-3 rounded text-sm text-red-900 font-bold">
                        Warning: Loading this story will update your current mission context.
                    </div>

                    <div className="flex justify-center gap-4 pt-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-[#2c1810] hover:underline font-bold opacity-70"
                        >
                            Cancel
                        </button>
                        <FantasyButton onClick={onConfirm}>
                            Load Story module
                        </FantasyButton>
                    </div>
                </div>
            </ParchmentContainer>
        </div>
    );
};
